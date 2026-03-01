from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# ============ MODELS ============

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    token: str
    user: User

class HealthEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str  # YYYY-MM-DD format
    weight: Optional[float] = None  # kg
    steps: Optional[int] = None
    water: Optional[float] = None  # liters
    sleep: Optional[float] = None  # hours
    calories: Optional[int] = None
    exercise: Optional[int] = None  # minutes
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HealthEntryCreate(BaseModel):
    date: str
    weight: Optional[float] = None
    steps: Optional[int] = None
    water: Optional[float] = None
    sleep: Optional[float] = None
    calories: Optional[int] = None
    exercise: Optional[int] = None
    notes: Optional[str] = None

class Goal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    metric: str  # weight, steps, water, sleep, calories, exercise
    target_value: float
    current_value: Optional[float] = None
    unit: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GoalCreate(BaseModel):
    metric: str
    target_value: float
    unit: str

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    return decode_token(token)

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email
    )
    
    user_doc = user.model_dump()
    user_doc['password_hash'] = hash_password(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user.id)
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(login_data.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create user object (without password)
    user_doc.pop('password_hash', None)
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_token(user.id)
    
    return TokenResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ============ HEALTH TRACKING ROUTES ============

@api_router.post("/health/log", response_model=HealthEntry)
async def create_health_entry(entry_data: HealthEntryCreate, user_id: str = Depends(get_current_user)):
    # Check if entry for this date already exists
    existing = await db.health_entries.find_one(
        {"user_id": user_id, "date": entry_data.date},
        {"_id": 0}
    )
    
    if existing:
        # Update existing entry
        update_data = {k: v for k, v in entry_data.model_dump().items() if v is not None}
        await db.health_entries.update_one(
            {"user_id": user_id, "date": entry_data.date},
            {"$set": update_data}
        )
        updated_doc = await db.health_entries.find_one(
            {"user_id": user_id, "date": entry_data.date},
            {"_id": 0}
        )
        if isinstance(updated_doc['created_at'], str):
            updated_doc['created_at'] = datetime.fromisoformat(updated_doc['created_at'])
        return HealthEntry(**updated_doc)
    else:
        # Create new entry
        entry = HealthEntry(user_id=user_id, **entry_data.model_dump())
        entry_doc = entry.model_dump()
        entry_doc['created_at'] = entry_doc['created_at'].isoformat()
        
        await db.health_entries.insert_one(entry_doc)
        return entry

@api_router.get("/health/entries", response_model=List[HealthEntry])
async def get_health_entries(
    user_id: str = Depends(get_current_user),
    limit: int = 30
):
    entries = await db.health_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).limit(limit).to_list(limit)
    
    for entry in entries:
        if isinstance(entry['created_at'], str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    
    return [HealthEntry(**entry) for entry in entries]

@api_router.get("/health/entries/{date}", response_model=HealthEntry)
async def get_health_entry_by_date(
    date: str,
    user_id: str = Depends(get_current_user)
):
    entry = await db.health_entries.find_one(
        {"user_id": user_id, "date": date},
        {"_id": 0}
    )
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    if isinstance(entry['created_at'], str):
        entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    
    return HealthEntry(**entry)

@api_router.get("/health/stats")
async def get_health_stats(user_id: str = Depends(get_current_user)):
    entries = await db.health_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).limit(30).to_list(30)
    
    if not entries:
        return {
            "averages": {},
            "latest": {},
            "total_entries": 0
        }
    
    # Calculate averages
    metrics = ['weight', 'steps', 'water', 'sleep', 'calories', 'exercise']
    averages = {}
    
    for metric in metrics:
        values = [e[metric] for e in entries if e.get(metric) is not None]
        if values:
            averages[metric] = round(sum(values) / len(values), 2)
    
    return {
        "averages": averages,
        "latest": entries[0] if entries else {},
        "total_entries": len(entries)
    }

# ============ GOALS ROUTES ============

@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate, user_id: str = Depends(get_current_user)):
    goal = Goal(user_id=user_id, **goal_data.model_dump())
    goal_doc = goal.model_dump()
    goal_doc['created_at'] = goal_doc['created_at'].isoformat()
    
    await db.goals.insert_one(goal_doc)
    return goal

@api_router.get("/goals", response_model=List[Goal])
async def get_goals(user_id: str = Depends(get_current_user)):
    goals = await db.goals.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    for goal in goals:
        if isinstance(goal['created_at'], str):
            goal['created_at'] = datetime.fromisoformat(goal['created_at'])
    
    return [Goal(**goal) for goal in goals]

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user_id: str = Depends(get_current_user)):
    result = await db.goals.delete_one({"id": goal_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()