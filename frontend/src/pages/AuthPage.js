import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const AuthPage = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Image */}
      <div className="hidden lg:block relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1707257969667-68804d47f5da?w=1200"
            alt="Wellness"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6 font-heading">
              Welcome to
              <br />
              WellnessTracker
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-md">
              Your personal companion for tracking health metrics, setting goals, and achieving wellness.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-gradient-to-br from-oat-100 to-sage-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="auth-title">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? 'Sign in to continue your wellness journey' : 'Start your health tracking journey today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="auth-form">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="name"
                      data-testid="name-input"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="pl-10 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    data-testid="email-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    data-testid="password-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                data-testid="auth-submit-btn"
                disabled={loading}
                className="w-full h-12 rounded-full text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                data-testid="toggle-auth-mode-btn"
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-primary font-semibold">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;