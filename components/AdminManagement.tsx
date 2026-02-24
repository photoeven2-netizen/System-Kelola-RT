
import React, { useState, useRef } from 'react';
import { Shield, UserPlus, MoreHorizontal, ShieldAlert, Lock, UserCheck, RefreshCcw, Database, Server, Loader2, CheckCircle, FileUp, AlertCircle, LogOut, Mail, Phone, User as UserIcon, Save, X, Key, Briefcase, Image as ImageIcon, RotateCcw, Megaphone, Info, Calendar, Link as LinkIcon, Github, Trash2, Plus } from 'lucide-react';
import { AdminRole, RTConfig, AdminUser, DashboardInfo } from '../types';
import { APP_LOGO_URL, APP_NAME } from '../constants';

interface AdminManagementProps {
  userRole: string;
  onLogout: () => void;
  rtConfig: RTConfig;
  setRtConfig: (config: RTConfig) => void;
  admins: AdminUser[];
  setAdmins: (admins: AdminUser[]) => void;
  dashboardInfo: DashboardInfo;
  setDashboardInfo: (info: DashboardInfo) => void;
}

interface StaffFormData {
  id?: string;
  name: string;
  username: string;
  password?: string;
  role: string;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ userRole, onLogout, rtConfig, setRtConfig, admins, setAdmins, dashboardInfo, setDashboardInfo }) => {
  const [tempConfig, setTempConfig] = useState<RTConfig>(rtConfig);
  const [tempDashboardInfo, setTempDashboardInfo] = useState<DashboardInfo>(dashboardInfo);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(() => localStorage.getItem('github_token'));
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleConnectGithub = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const { url } = await res.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(url, 'github_auth_popup', `width=${width},height=${height},left=${left},top=${top}`);
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
          const token = event.data.data.access_token;
          if (token) {
            setGithubToken(token);
            localStorage.setItem('github_token', token);
            fetchRepos(token);
          }
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
    }
  };

  const fetchRepos = async (token: string) => {
    setIsFetchingRepos(true);
    try {
      const res = await fetch('/api/github/repos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setGithubRepos(data);
      }
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleDisconnectGithub = () => {
    setGithubToken(null);
    setGithubRepos([]);
    localStorage.removeItem('github_token');
  };

  React.useEffect(() => {
    if (githubToken) {
      fetchRepos(githubToken);
    }
  }, []);

  // Modal State for Adding/Editing Staff
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<StaffFormData>({
    name: '', username: '', role: '', password: ''
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Limit 1MB
        alert("Ukuran logo terlalu besar. Maksimal 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempConfig({ ...tempConfig, appLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBranding = () => {
    if (window.confirm("Kembalikan tampilan ke pengaturan awal?")) {
      setTempConfig({ ...tempConfig, appName: APP_NAME, appLogo: APP_LOGO_URL });
    }
  };

  const handleSaveConfig = () => {
    setIsSavingConfig(true);
    setTimeout(() => {
      setRtConfig(tempConfig);
      setIsSavingConfig(false);
      alert('Pengaturan berhasil diperbarui.');
    }, 1000);
  };

  const handleSaveDashboardInfo = () => {
    setIsSavingDashboard(true);
    setTimeout(() => {
      setDashboardInfo(tempDashboardInfo);
      setIsSavingDashboard(false);
      alert('Informasi dashboard berhasil diperbarui.');
    }, 1000);
  };

  const handleEditStaff = (admin: AdminUser) => {
    setEditingStaffId(admin.id);
    setStaffForm({
      name: admin.name,
      username: admin.username,
      role: admin.role,
      password: admin.password || ''
    });
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = (id: string) => {
    if (admins.length <= 1) {
      alert("Tidak dapat menghapus admin terakhir.");
      return;
    }
    if (window.confirm("Hapus pengelola ini?")) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStaff(true);
    
    setTimeout(() => {
      if (editingStaffId) {
        setAdmins(admins.map(a => a.id === editingStaffId ? { ...a, ...staffForm } : a));
      } else {
        setAdmins([...admins, { ...staffForm, id: Date.now().toString() } as AdminUser]);
      }
      setIsSavingStaff(false);
      setIsStaffModalOpen(false);
      setEditingStaffId(null);
      setStaffForm({ name: '', username: '', role: '', password: '' });
      alert(editingStaffId ? 'Data pengelola berhasil diperbarui.' : 'Staf baru berhasil ditambahkan.');
    }, 500);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>
          <p className="text-xs md:text-sm text-slate-500">Sesuaikan identitas dan akses pengelola.</p>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-xs font-bold">
          <LogOut size={16} />
          <span>KELUAR ADMIN</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visual Branding Section */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ImageIcon size={20} /></div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Visual & Branding</h3>
              </div>
              <button onClick={handleResetBranding} className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center space-x-1">
                <RotateCcw size={12} />
                <span>RESET DEFAULT</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors">
                    <img src={tempConfig.appLogo} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <FileUp size={14} />
                  </button>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Aplikasi</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10" 
                      value={tempConfig.appName} 
                      onChange={e => setTempConfig({...tempConfig, appName: e.target.value})} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">* Nama ini akan muncul di Sidebar dan halaman Login.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Information Section */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Megaphone size={20} /></div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Informasi Dashboard</h3>
              </div>
              <button 
                onClick={handleSaveDashboardInfo} 
                disabled={isSavingDashboard}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-emerald-100"
              >
                {isSavingDashboard ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>SIMPAN INFO</span>
              </button>
            </div>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Judul Dashboard</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10" 
                    value={tempDashboardInfo.dashboardTitle} 
                    onChange={e => setTempDashboardInfo({...tempDashboardInfo, dashboardTitle: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Sub-judul Dashboard</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10" 
                    value={tempDashboardInfo.dashboardSubtitle} 
                    onChange={e => setTempDashboardInfo({...tempDashboardInfo, dashboardSubtitle: e.target.value})} 
                  />
                </div>
              </div>

              {/* List Management Component Helper */}
              {([
                { key: 'govItems', label: 'Informasi Pemerintah', icon: Megaphone, color: 'text-blue-600' },
                { key: 'activityItems', label: 'Informasi Kegiatan Warga', icon: Info, color: 'text-emerald-600' },
                { key: 'patrolItems', label: 'Jadwal Ronda', icon: Calendar, color: 'text-amber-600' }
              ] as const).map((cat) => (
                <div key={cat.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={`text-[10px] font-bold ${cat.color} uppercase flex items-center space-x-2`}>
                      <cat.icon size={12} />
                      <span>{cat.label}</span>
                    </label>
                    <button 
                      onClick={() => {
                        const newItems = [...(tempDashboardInfo[cat.key] || [])];
                        newItems.push({ id: Date.now().toString(), title: 'Judul Baru', content: '', date: new Date().toLocaleDateString('id-ID') });
                        setTempDashboardInfo({ ...tempDashboardInfo, [cat.key]: newItems });
                      }}
                      className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:underline"
                    >
                      <Plus size={12} />
                      <span>TAMBAH ITEM</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(tempDashboardInfo[cat.key] || []).length > 0 ? (tempDashboardInfo[cat.key] || []).map((item, idx) => (
                      <div key={item.id || idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 relative group">
                        <button 
                          onClick={() => {
                            const newItems = (tempDashboardInfo[cat.key] || []).filter((_, i) => i !== idx);
                            setTempDashboardInfo({ ...tempDashboardInfo, [cat.key]: newItems });
                          }}
                          className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                          <input 
                            type="text" 
                            placeholder="Judul Item"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                            value={item.title}
                            onChange={e => {
                              const newItems = [...(tempDashboardInfo[cat.key] || [])];
                              newItems[idx] = { ...item, title: e.target.value };
                              setTempDashboardInfo({ ...tempDashboardInfo, [cat.key]: newItems });
                            }}
                          />
                          <input 
                            type="text" 
                            placeholder="Tanggal (opsional)"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                            value={item.date || ''}
                            onChange={e => {
                              const newItems = [...(tempDashboardInfo[cat.key] || [])];
                              newItems[idx] = { ...item, date: e.target.value };
                              setTempDashboardInfo({ ...tempDashboardInfo, [cat.key]: newItems });
                            }}
                          />
                        </div>
                        
                        <textarea 
                          placeholder="Konten informasi..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none min-h-[60px]"
                          value={item.content}
                          onChange={e => {
                            const newItems = [...(tempDashboardInfo[cat.key] || [])];
                            newItems[idx] = { ...item, content: e.target.value };
                            setTempDashboardInfo({ ...tempDashboardInfo, [cat.key]: newItems });
                          }}
                        />
                        
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <input 
                            type="url" 
                            placeholder="Link URL (opsional)" 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] outline-none"
                            value={item.url || ''}
                            onChange={e => {
                              const newItems = [...(tempDashboardInfo[cat.key] || [])];
                              newItems[idx] = { ...item, url: e.target.value };
                              setTempDashboardInfo({ ...tempDashboardInfo, [cat.key]: newItems });
                            }}
                          />
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        Belum ada item. Klik "Tambah Item" untuk mengisi.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Integration Section */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-900 text-white rounded-lg"><Github size={20} /></div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">GitHub Integration</h3>
              </div>
              {githubToken ? (
                <button 
                  onClick={handleDisconnectGithub}
                  className="text-[10px] font-bold text-red-500 hover:underline"
                >
                  PUTUSKAN KONEKSI
                </button>
              ) : (
                <button 
                  onClick={handleConnectGithub}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center space-x-2 shadow-lg shadow-slate-200"
                >
                  <Github size={14} />
                  <span>HUBUNGKAN GITHUB</span>
                </button>
              )}
            </div>
            <div className="p-6">
              {githubToken ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repositori Terbaru</p>
                    {isFetchingRepos && <Loader2 size={14} className="animate-spin text-slate-400" />}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {githubRepos.length > 0 ? githubRepos.map(repo => (
                      <a 
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-400 transition-colors group"
                      >
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">{repo.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-1">{repo.description || 'No description'}</p>
                      </a>
                    )) : (
                      <p className="text-xs text-slate-400 italic">Tidak ada repositori ditemukan.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Github size={24} />
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Hubungkan akun GitHub Anda untuk melihat repositori dan integrasi kode di masa mendatang.</p>
                </div>
              )}
            </div>
          </div>

          {/* RT Identity Section */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Server size={20} /></div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Identitas Pengurus</h3>
              </div>
              <button 
                onClick={handleSaveConfig} 
                disabled={isSavingConfig}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-blue-100"
              >
                {isSavingConfig ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>SIMPAN PERUBAHAN</span>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Ketua RT</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={tempConfig.rtName} onChange={e => setTempConfig({...tempConfig, rtName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp Pak RT</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={tempConfig.rtWhatsapp} onChange={e => setTempConfig({...tempConfig, rtWhatsapp: e.target.value})} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email RT (Notifikasi)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={tempConfig.rtEmail} onChange={e => setTempConfig({...tempConfig, rtEmail: e.target.value})} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Google Sheet URL (Database)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="url" 
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" 
                    value={tempConfig.googleSheetUrl || ''} 
                    onChange={e => setTempConfig({...tempConfig, googleSheetUrl: e.target.value})} 
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">URL ini akan otomatis terisi saat Anda melakukan sinkronisasi pertama kali.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Mini Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <img src={tempConfig.appLogo} alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <div className="font-bold text-sm truncate">{tempConfig.appName}</div>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Preview Tampilan</p>
             <div className="space-y-2 opacity-50">
                <div className="h-8 bg-white/5 rounded-lg w-full"></div>
                <div className="h-8 bg-white/5 rounded-lg w-3/4"></div>
             </div>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Daftar Pengelola</h3>
              <button 
                onClick={() => {
                  setEditingStaffId(null);
                  setStaffForm({ name: '', username: '', role: '', password: '' });
                  setIsStaffModalOpen(true);
                }} 
                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <UserPlus size={16} />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">{admin.name.charAt(0)}</div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">{admin.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{admin.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 transition-opacity">
                    <button onClick={() => handleEditStaff(admin)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><Key size={14} /></button>
                    <button onClick={() => handleDeleteStaff(admin.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{editingStaffId ? 'Edit Pengelola' : 'Tambah Staf Baru'}</h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Username</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value.toLowerCase().replace(/\s/g, '')})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Password (Kosongkan jika tidak ada)</label><input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} /></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan / Posisi</label>
                <input required type="text" placeholder="Contoh: Sekretaris, Bendahara" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm">Batal</button>
                <button disabled={isSavingStaff} type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2">
                  {isSavingStaff ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  <span>{editingStaffId ? 'UPDATE PENGELOLA' : 'SIMPAN STAF'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
