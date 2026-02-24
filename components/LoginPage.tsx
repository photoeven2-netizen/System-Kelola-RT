
import React, { useState } from 'react';
import { Shield, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { AdminRole, AdminUser, RTConfig } from '../types';

interface LoginPageProps {
  onLogin: (user: AdminUser) => void;
  rtConfig: RTConfig;
  admins: AdminUser[];
  onRegisterFirstAdmin: (user: AdminUser) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, rtConfig, admins, onRegisterFirstAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', username: '', password: '' });

  const isInitialState = admins.length === 1 && admins[0].username === 'admin' && !admins[0].password;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const foundAdmin = admins.find(a => a.username === username && (a.password || '') === password);
      
      if (foundAdmin) {
        onLogin(foundAdmin);
      } else {
        setError('Username atau password salah.');
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleRegisterFirst = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const newUser: AdminUser = {
        id: Date.now().toString(),
        name: regForm.name,
        username: regForm.username.toLowerCase().replace(/\s/g, ''),
        password: regForm.password,
        role: 'Super Admin'
      };
      onRegisterFirstAdmin(newUser);
      setIsLoading(false);
      setIsRegistering(false);
      alert('Admin pertama berhasil didaftarkan. Silakan login.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 font-['Plus_Jakarta_Sans']">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-blue-100 mb-2 overflow-hidden border-4 border-white transform transition-transform hover:scale-105">
            <img 
              src={rtConfig.appLogo} 
              alt="Logo" 
              className="w-14 h-14 object-contain" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{rtConfig.appName}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Sistem Administrasi RT 05 / RW 02</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm relative">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
             <Shield size={120} />
          </div>

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username Admin</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="Masukkan username"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kata Sandi</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-red-600 font-bold flex items-center space-x-3 animate-bounce">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-70 group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="text-sm">MASUK DASHBOARD</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {isInitialState && (
                <div className="pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="w-full py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-[11px] uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                  >
                    Daftar Admin Pertama
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterFirst} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Registrasi Admin Pertama</h3>
                <p className="text-xs text-slate-500">Silakan buat akun admin utama untuk mengelola sistem.</p>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <input required type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm">Batal</button>
                <button disabled={isLoading} type="submit" className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2">
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                  <span>DAFTAR SEKARANG</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center pt-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">SmartWarga RT 05 • Digitalized v2.4.1</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
