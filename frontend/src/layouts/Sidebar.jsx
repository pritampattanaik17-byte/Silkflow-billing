import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings, Package, ShoppingCart, X, RefreshCcw, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';

const Sidebar = ({ user, isOpen, setIsOpen }) => {
  const { t } = useTranslation();

  // Common navigation items for all users
  let navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('invoices'), href: '/invoices', icon: FileText },
    { name: t('returns'), href: '/returns', icon: RefreshCcw },
  ];

  // Owner gets full access
  if (user?.role === 'owner') {
    navigation = [
      ...navigation,
      { name: t('employees'), href: '/employees', icon: Users },
      { name: t('reports'), href: '/reports', icon: BarChart3 },
    ];
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#1E3A5F]/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#152842]/95 backdrop-blur-2xl border-r border-white/10 text-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:fixed md:flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center font-bold text-primary">
              V
            </div>
            <span className="font-heading font-bold text-xl tracking-wide">VastraFlow</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pt-5 pb-4">
          <nav className="mt-2 flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)} // Close sidebar on mobile when navigating
                className={({ isActive }) => cn(
                  "group flex items-center px-3 py-3 md:py-2 text-base md:text-sm font-medium rounded-md transition-all duration-200 hover:translate-x-1 min-h-[44px]",
                  isActive 
                    ? "bg-white/10 text-white translate-x-1" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* User profile brief at bottom */}
        <div className="flex-shrink-0 flex border-t border-white/10 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="relative">
                {/* Revolving colorful ring animation */}
                <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-[spin_3s_linear_infinite]"></div>
                
                {/* Avatar */}
                <div className="relative h-9 w-9 rounded-full bg-[#152842] text-white flex items-center justify-center font-bold z-10">
                  {getInitials(user?.name)}
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs font-medium text-white/50 group-hover:text-white/70 capitalize">{user?.role} Account</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
