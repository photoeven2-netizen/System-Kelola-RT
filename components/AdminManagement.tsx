
import React, { useState, useRef } from 'react';
import { Shield, UserPlus, MoreHorizontal, ShieldAlert, Lock, UserCheck, RefreshCcw, Database, Server, Loader2, CheckCircle, FileUp, AlertCircle, LogOut, Mail, Phone, User as UserIcon, Save, X, Key, Briefcase, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { AdminRole, RTConfig, AdminUser } from '../types';
import { APP_LOGO_URL, APP_NAME } from '../constants';

interface AdminManagementProps {
  userRole: string;
  onLogout: () => void;
  rtConfig: RTConfig;
  setRtConfig: (config: RTConfig) => void;
}

interface StaffFormData {
  name: string;
  username: string;
  role: string;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ userRole, onLogout, rtConfig, setRtConfig }) => {
  const [tempConfig, setTempConfig] = useState<RTConfig>(rtConfig);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Modal State for Adding Staff
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState<StaffFormData>({
    name: '', username: '', role: ''
  });

  const [adminsList, setAdminsList] = useState<AdminUser[]>([
    { id: '1', username: 'superadmin_rt05', name: rtConfig.rtName, role: 'Super Admin' },
    { id: '2', username: 'staff_ani', name: 'Ibu Ani', role: 'Sekretaris RT' }
  ]);

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
              <button onClick={() => setIsStaffModalOpen(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"><UserPlus size={16} /></button>
            </div>
            <div className="divide-y divide-slate-100">
              {adminsList.map((admin) => (
                <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">{admin.name.charAt(0)}</div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">{admin.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{admin.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Tambah Staf Baru</h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsSavingStaff(true); setTimeout(() => { setAdminsList([...adminsList, { id: Date.now().toString(), name: staffForm.name, username: staffForm.username, role: staffForm.role }]); setIsSavingStaff(false); setIsStaffModalOpen(false); }, 500); }} className="p-6 space-y-4">
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Username</label><input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value.toLowerCase().replace(/\s/g, '')})} /></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan / Posisi</label>
                <input required type="text" placeholder="Contoh: Sekretaris, Bendahara" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm">Batal</button>
                <button disabled={isSavingStaff} type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2">
                  {isSavingStaff ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  <span>SIMPAN STAF</span>
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
