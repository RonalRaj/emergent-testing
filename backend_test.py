import requests
import sys
import json
from datetime import datetime

class HealthTrackerAPITester:
    def __init__(self, base_url="https://fitness-hub-404.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.text else {}
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json() if response.text else {}
                    print(f"   Error response: {error_data}")
                except:
                    print(f"   Error response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register(self, name, email, password):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"name": name, "email": email, "password": password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user: {name} with ID: {self.user_id}")
            return True
        return False

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Logged in user: {response['user']['name']}")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            auth_required=True
        )
        return success

    def test_create_health_entry(self, entry_data):
        """Test creating health entry"""
        success, response = self.run_test(
            "Create Health Entry",
            "POST",
            "health/log",
            200,
            data=entry_data,
            auth_required=True
        )
        
        if success and 'id' in response:
            print(f"   Created entry with ID: {response['id']} for date: {response['date']}")
            return response['id']
        return None

    def test_get_health_entries(self):
        """Test getting health entries"""
        success, response = self.run_test(
            "Get Health Entries",
            "GET",
            "health/entries",
            200,
            auth_required=True
        )
        
        if success:
            print(f"   Retrieved {len(response)} health entries")
            return response
        return []

    def test_get_health_stats(self):
        """Test getting health statistics"""
        success, response = self.run_test(
            "Get Health Stats",
            "GET",
            "health/stats",
            200,
            auth_required=True
        )
        return success, response

    def test_create_goal(self, goal_data):
        """Test creating a goal"""
        success, response = self.run_test(
            "Create Goal",
            "POST",
            "goals",
            200,
            data=goal_data,
            auth_required=True
        )
        
        if success and 'id' in response:
            print(f"   Created goal with ID: {response['id']} for {response['metric']}")
            return response['id']
        return None

    def test_get_goals(self):
        """Test getting goals"""
        success, response = self.run_test(
            "Get Goals",
            "GET",
            "goals",
            200,
            auth_required=True
        )
        
        if success:
            print(f"   Retrieved {len(response)} goals")
            return response
        return []

def main():
    """Run comprehensive API tests"""
    print("🚀 Starting Health Tracker API Tests...")
    print("="*50)
    
    # Setup
    tester = HealthTrackerAPITester()
    
    # Generate unique test data
    timestamp = datetime.now().strftime('%H%M%S')
    test_name = f"Test User {timestamp}"
    test_email = f"test{timestamp}@example.com"
    test_password = "TestPass123!"
    
    # Test Authentication Flow
    print("\n📋 Testing Authentication APIs...")
    
    # Register new user
    if not tester.test_register(test_name, test_email, test_password):
        print("❌ Registration failed, stopping tests")
        return 1
    
    # Test get me endpoint
    if not tester.test_get_me():
        print("❌ Get me endpoint failed")
        return 1
    
    # Test login with same credentials
    if not tester.test_login(test_email, test_password):
        print("❌ Login failed")
        return 1
    
    # Test Health Tracking APIs
    print("\n🏃 Testing Health Tracking APIs...")
    
    # Create sample health entry
    today = datetime.now().strftime('%Y-%m-%d')
    health_entry = {
        "date": today,
        "weight": 70.5,
        "steps": 8500,
        "water": 2.2,
        "sleep": 7.5,
        "calories": 2000,
        "exercise": 45,
        "notes": "Feeling good today!"
    }
    
    entry_id = tester.test_create_health_entry(health_entry)
    if not entry_id:
        print("❌ Health entry creation failed")
        return 1
    
    # Get health entries
    entries = tester.test_get_health_entries()
    if not entries:
        print("❌ Failed to retrieve health entries")
        return 1
    
    # Get health stats
    stats_success, stats = tester.test_get_health_stats()
    if not stats_success:
        print("❌ Failed to get health stats")
        return 1
    
    # Test Goals APIs
    print("\n🎯 Testing Goals APIs...")
    
    # Create sample goal
    goal_data = {
        "metric": "steps",
        "target_value": 10000,
        "unit": "steps/day"
    }
    
    goal_id = tester.test_create_goal(goal_data)
    if not goal_id:
        print("❌ Goal creation failed")
        return 1
    
    # Get goals
    goals = tester.test_get_goals()
    if not goals:
        print("❌ Failed to retrieve goals")
        return 1
    
    # Print final results
    print("\n" + "="*50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    print("="*50)
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())