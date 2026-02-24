
import React from 'react';
import { Bell, Search, User, Menu, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../types';

interface HeaderProps {
  user: AdminUser | null;
  onMenuClick: () => void;
  onAdminClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick, onAdminClick, onLogout }) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
      <div className="flex items-center space-x-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari info warga atau layanan..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        {user ? (
          <>
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-2 md:space-x-4 md:pl-6 md:border-l md:border-slate-100">
              <div className="hidden sm:block text-right">
                <p className="text-xs md:text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{user.role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-8 h-8 md:w-10 md:h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 border border-red-100 shrink-0 hover:bg-red-600 hover:text-white transition-all group"
                title="Log Out"
              >
                <User size={18} className="group-hover:hidden" />
                <ShieldCheck size={18} className="hidden group-hover:block" />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={onAdminClick}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all text-xs font-bold"
          >
            <ShieldCheck size={16} />
            <span className="hidden sm:inline">Masuk Admin</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
