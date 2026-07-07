import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';
import { Card, CardContent } from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

      const data = await response.json();

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
    <Card className="shadow-lg">
      <CardContent className="px-10 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-heading">Sign in to your account</h2>
          <p className="text-sm text-text mt-2">Enter your details to access the ERP</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Email address</label>
            <Input 
              type="email" 
              placeholder="admin@vastraflow.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Role Select</label>
            <Select 
              options={[
                { label: 'Owner (Full Access)', value: 'owner' },
                { label: 'Employee (Billing & Invoices)', value: 'employee' }
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <p className="text-xs text-text mt-1">Select your role to login</p>
          </div>


          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/50"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary/80">
                Forgot your password?
              </a>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-6" leftIcon={LogIn} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text">
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
