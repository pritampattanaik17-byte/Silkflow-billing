import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { Plus, Search, UserCheck, UserX, Shield, Smartphone, Mail, Lock, CheckCircle2, Calendar, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import SearchBox from '../components/SearchBox';
import StatusBadge from '../components/StatusBadge';

const EmployeeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        setEmployees(data);
      } catch (err) {
        throw new Error('Server returned an invalid response. The backend might be down or crashed.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          role: 'employee' 
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Failed to create employee');
        } catch (err) {
          if (err.message.includes('Failed to create employee')) throw err;
          throw new Error('Failed to create employee. Server returned an invalid response.');
        }
      }

      setIsModalOpen(false);
      setShowSuccess(true);
      fetchEmployees(); // Refresh the list
      
      // Reset form
      setFormData({ name: '', mobile: '', email: '', password: '', startDate: new Date().toISOString().split('T')[0] });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading dark:text-white">Employee Management</h1>
          <p className="text-sm text-text dark:text-white/70 mt-1">Create accounts and manage your staff access.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Employee
          </Button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-md flex items-start">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Employee Created Successfully</h3>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              Please share the login credentials (email and password) with the new employee so they can access the application.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SearchBox 
              placeholder="Search by name, email, or mobile..." 
              className="w-full sm:max-w-md" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium text-primary dark:text-white number-font">{emp.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-3">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-heading dark:text-white/90">{emp.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-text dark:text-white/70">{emp.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-text dark:text-white/80 number-font">
                        {new Date(emp.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 capitalize">
                        <Shield className="w-3 h-3 mr-1" />
                        {emp.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={emp.status === 'active' ? 'paid' : 'draft'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className={emp.status === 'active' ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'}>
                        {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-text dark:text-white/50">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                   <TableRow>
                   <TableCell colSpan={7} className="text-center py-8 text-text dark:text-white/50">
                     Loading employees...
                   </TableCell>
                 </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Employee Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 transition-all">
          <Card className="w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-text/50 hover:bg-black/5 dark:hover:bg-white/10 dark:text-white/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <CardHeader className="border-b border-border dark:border-white/10 pb-5 pt-6 px-6">
              <CardTitle className="text-xl">Add New Employee</CardTitle>
              <p className="text-sm text-text dark:text-white/60 mt-1">Fill in the details to create a new staff account.</p>
            </CardHeader>
            <form onSubmit={handleCreateEmployee}>
              <CardContent className="space-y-5 p-6">
                
                <div>
                  <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <UserCheck className="h-4 w-4 text-text/70 dark:text-white/70" />
                    </div>
                    <Input 
                      required
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      className="pl-10 w-full"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Smartphone className="h-4 w-4 text-text/70 dark:text-white/70" />
                    </div>
                    <Input 
                      required
                      type="tel"
                      name="mobile"
                      placeholder="e.g. +91 9876543210"
                      className="pl-10 w-full"
                      value={formData.mobile}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Mail className="h-4 w-4 text-text/70 dark:text-white/70" />
                    </div>
                    <Input 
                      required
                      type="email"
                      name="email"
                      placeholder="employee@vastraflow.com"
                      className="pl-10 w-full"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Initial Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Lock className="h-4 w-4 text-text/70 dark:text-white/70" />
                    </div>
                    <Input 
                      required
                      type="password"
                      name="password"
                      placeholder="Minimum 6 characters"
                      className="pl-10 w-full"
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading dark:text-white mb-1.5">Date of Starting</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Calendar className="h-4 w-4 text-text/70 dark:text-white/70" />
                    </div>
                    <Input 
                      required
                      type="date"
                      name="startDate"
                      className="pl-10 w-full"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

              </CardContent>
              <div className="p-5 border-t border-border dark:border-white/10 flex justify-end space-x-3 bg-gray-50/50 dark:bg-black/20 rounded-b-xl">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Employee
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};

export default EmployeeManagement;
