import React, { useState } from 'react';
import { Bell, Menu, User, LogOut, Settings, Sun, Moon, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import Dropdown, { DropdownItem } from '../components/Dropdown';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const TopNavbar = ({ user, onLogout, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="sticky top-0 z-40 flex-shrink-0 flex h-16 bg-white/70 dark:bg-primary/95 backdrop-blur-xl border-b border-border shadow-sm transition-colors">
      <button
        type="button"
        onClick={onMenuClick}
        className="px-4 border-r border-border text-text/50 dark:text-white/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          {/* Global search removed as per user request */}
        </div>
        <div className="ml-4 flex items-center md:ml-6 space-x-2 md:space-x-4">
          <button className="p-2 rounded-full text-text dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          <Dropdown
            trigger={
              <button className="relative flex items-center ml-2 max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors group">
                <span className="sr-only">Open user menu</span>
                
                {/* Revolving colorful ring animation */}
                <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-[spin_3s_linear_infinite]"></div>
                
                {/* Avatar */}
                <div className="relative h-8 w-8 bg-white dark:bg-[#152842] rounded-full flex items-center justify-center text-primary dark:text-white font-bold z-10">
                  {getInitials(user?.name)}
                </div>
              </button>
            }
          >
            <div className="px-4 py-2 border-b border-border dark:border-white/10">
              <p className="text-sm font-medium text-heading dark:text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-text dark:text-white/50">{user?.email || 'user@vastraflow.com'}</p>
            </div>
            
            <DropdownItem icon={User}>{t('profile')}</DropdownItem>
            
            <div className="border-t border-border dark:border-white/10 my-1"></div>
            
            {/* Theme Toggle in Dropdown */}
            <DropdownItem 
              icon={theme === 'dark' ? Sun : Moon} 
              onClick={(e) => {
                e.stopPropagation(); // prevent dropdown from closing
                toggleTheme();
              }}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </DropdownItem>

            {/* Language Selection in Dropdown */}
            <div 
              className="group flex w-full items-center justify-between px-4 py-2 text-sm text-text dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-heading dark:hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowLangMenu(!showLangMenu);
              }}
            >
              <div className="flex items-center">
                <Globe className="mr-3 h-4 w-4" aria-hidden="true" />
                Language: {i18n.language === 'en' ? 'English' : i18n.language === 'hi' ? 'हिंदी' : 'ଓଡ଼ିଆ'}
              </div>
              {showLangMenu ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
            
            {showLangMenu && (
              <div className="bg-black/5 dark:bg-white/5 py-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleLanguageChange('en'); setShowLangMenu(false); }}
                  className={`w-full text-left pl-12 pr-4 py-2 text-sm ${i18n.language === 'en' ? 'text-primary dark:text-white font-medium' : 'text-text dark:text-white/70 hover:text-heading dark:hover:text-white'}`}
                >
                  English
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLanguageChange('hi'); setShowLangMenu(false); }}
                  className={`w-full text-left pl-12 pr-4 py-2 text-sm ${i18n.language === 'hi' ? 'text-primary dark:text-white font-medium' : 'text-text dark:text-white/70 hover:text-heading dark:hover:text-white'}`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLanguageChange('or'); setShowLangMenu(false); }}
                  className={`w-full text-left pl-12 pr-4 py-2 text-sm ${i18n.language === 'or' ? 'text-primary dark:text-white font-medium' : 'text-text dark:text-white/70 hover:text-heading dark:hover:text-white'}`}
                >
                  ଓଡ଼ିଆ (Odia)
                </button>
              </div>
            )}
            
            <div className="border-t border-border dark:border-white/10 my-1"></div>
            
            <DropdownItem icon={LogOut} danger onClick={onLogout}>{t('sign_out')}</DropdownItem>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
