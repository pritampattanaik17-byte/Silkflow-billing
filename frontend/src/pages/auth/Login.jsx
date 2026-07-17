import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../../config';
import { Card, CardContent } from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage] = useState(location.state?.successMessage || '');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      // Safe JSON parsing — prevents crash if backend returns non-JSON (e.g. HTML error page)
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server is unreachable. Please make sure the backend is running.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      
      // Update app context if needed
      onLogin(data.user);
      
      // Navigate to dashboard with success message
      navigate('/', { state: { successMessage: 'Login successful! Welcome back.' } });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg animate-fade-in-up">
      <CardContent className="px-10 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-heading dark:text-white">Sign in to your account</h2>
          <p className="text-sm text-text dark:text-white/70 mt-2">Enter your details to access the ERP</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-600 dark:text-green-400 text-sm text-center">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Email address</label>
            <Input 
              type="email" 
              placeholder="admin@stylebazar.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Password</label>
            <div className="relative w-full">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex min-h-[44px] md:min-h-0 md:h-10 w-full rounded-input border border-border/80 hover:border-border dark:border-white/10 dark:hover:border-white/20 bg-white/70 dark:bg-black/20 backdrop-blur-sm px-3 py-2 pr-10 text-base md:text-sm text-text dark:text-white placeholder:text-text/60 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-text/50 hover:text-text dark:text-white/40 dark:hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Role Select</label>
            <Select 
              options={[
                { label: 'Owner (Full Access)', value: 'owner' },
                { label: 'Employee (Billing & Invoices)', value: 'employee' }
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <p className="text-xs text-text dark:text-white/60 mt-1">Select your role to login</p>
          </div>



          <Button type="submit" variant="primary" className="w-full mt-6" leftIcon={LogIn} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text dark:text-white/70">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary/80">
            Register now
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
