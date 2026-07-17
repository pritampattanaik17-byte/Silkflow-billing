import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';
import { Card, CardContent } from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOwner, setHasOwner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if an owner already exists
    const checkOwner = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check-owner`);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.hasOwner) {
            setHasOwner(true);
            setRole('employee');
          }
        }
      } catch (err) {
        console.error("Failed to check owner status", err);
      }
    };
    checkOwner();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      // Safe JSON parsing
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server is unreachable. Please make sure the backend is running.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // If a token is returned (owner registration), log in immediately
      if (data.token) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
        navigate('/', { state: { successMessage: 'Account created successfully! Welcome to your dashboard.' } });
      } else {
        // Employee registration — account pending owner approval
        navigate('/login', { state: { successMessage: data.message } });
      }
      
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
          <h2 className="text-2xl font-bold text-heading dark:text-white">Create a new account</h2>
          <p className="text-sm text-text dark:text-white/70 mt-2">Start managing your wholesale business today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Full Name</label>
            <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Email address</label>
            <Input type="email" placeholder="admin@stylebazar.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Password</label>
            <div className="relative w-full">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
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
            <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Role</label>
            <Select 
              options={[
                ...(hasOwner ? [] : [{ label: 'Owner (Full Access)', value: 'owner' }]),
                { label: 'Employee (Limited Access)', value: 'employee' }
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            {hasOwner && (
              <p className="text-xs text-text dark:text-white/70 mt-1 text-danger">An Owner account already exists. You can only register as an Employee.</p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full mt-6" leftIcon={UserPlus} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text dark:text-white/70">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            Sign in instead
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default Register;
