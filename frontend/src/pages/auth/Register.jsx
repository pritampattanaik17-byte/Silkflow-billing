import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { UserPlus } from 'lucide-react';

const Register = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOwner, setHasOwner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if an owner already exists
    const checkOwner = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/check-owner');
        const data = await response.json();
        if (data.hasOwner) {
          setHasOwner(true);
          setRole('employee'); // Default to employee if owner exists
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Pass the user-selected role
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token
      localStorage.setItem('token', data.token);
      
      // Update app context
      onLogin(data.user);
      
      // Navigate to dashboard with success message
      navigate('/', { state: { successMessage: 'Account created successfully! Welcome to your dashboard.' } });
      
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
          <h2 className="text-2xl font-bold text-heading">Create a new account</h2>
          <p className="text-sm text-text mt-2">Start managing your wholesale business today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Full Name</label>
            <Input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Email address</label>
            <Input type="email" placeholder="admin@vastraflow.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Password</label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Role</label>
            <Select 
              options={[
                ...(hasOwner ? [] : [{ label: 'Owner (Full Access)', value: 'owner' }]),
                { label: 'Employee (Limited Access)', value: 'employee' }
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            {hasOwner && (
              <p className="text-xs text-text mt-1 text-danger">An Owner account already exists. You can only register as an Employee.</p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full mt-6" leftIcon={UserPlus} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-text">
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
