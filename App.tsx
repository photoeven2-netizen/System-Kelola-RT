
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import ResidentDatabase from './components/ResidentDatabase.tsx';
import LetterRequests from './components/LetterRequests.tsx';
import AdminManagement from './components/AdminManagement.tsx';
import AuditLog from './components/AuditLog.tsx';
import BottomNav from './components/BottomNav.tsx';
import ServiceRequestModal from './components/ServiceRequestModal.tsx';
import ResidentFormModal from './components/ResidentFormModal.tsx';
import LoginPage from './components/LoginPage.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import { X } from 'lucide-react';
import { AdminUser, Resident, ServiceRequest, RequestStatus, LetterType, RTConfig, DashboardInfo } from './types.ts';
import { APP_NAME, APP_LOGO_URL } from './constants.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'warga' | 'surat' | 'admin' | 'audit' | 'login'>('dashboard');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [residents, setResidents] = useState<Resident[]>(() => {
    const saved = localStorage.getItem('smartwarga_residents');
    return saved ? JSON.parse(saved) : [];
  });
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('smartwarga_requests');
    return saved ? JSON.parse(saved) : [];
  });
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('smartwarga_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('smartwarga_admins');
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', password: '', name: 'Default Admin', role: 'Super Admin' }
    ];
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hasSeenPrompt = sessionStorage.getItem('smartwarga_install_prompt_seen');
      if (!hasSeenPrompt) {
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    sessionStorage.setItem('smartwarga_install_prompt_seen', 'true');
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('smartwarga_install_prompt_seen', 'true');
  };

  const [rtConfig, setRtConfig] = useState<RTConfig>(() => {
    const saved = localStorage.getItem('smartwarga_rt_config');
    const defaultConfig = {
      rtName: 'Pak RT Budiman',
      rtWhatsapp: '628123456789',
      rtEmail: 'rt03@smartwarga.id',
      appName: APP_NAME,
      appLogo: APP_LOGO_URL,
      googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BBRPWrpR4Lf8hTRiZ2uPuGnrHPn4A0OwKupRkMCzIik/edit?usp=sharing',
      committeeMembers: [
        { id: '1', name: 'Pak RT Budiman', position: 'Ketua RT', whatsapp: '628123456789' }
      ]
    };
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>(() => {
    const saved = localStorage.getItem('smartwarga_dashboard_info');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: if old format, convert to new format
      if (parsed.govInfo) {
        return {
          dashboardTitle: parsed.dashboardTitle || 'SmartWarga Dashboard',
          dashboardSubtitle: parsed.dashboardSubtitle || 'Selamat datang di sistem layanan digital RT. 03.',
          govItems: [{ id: '1', title: 'Info Pemerintah', content: parsed.govInfo, url: parsed.govUrl }],
          activityItems: [{ id: '1', title: 'Kegiatan Warga', content: parsed.activityInfo, url: parsed.activityUrl }],
          patrolItems: [{ id: '1', title: 'Jadwal Ronda', content: parsed.patrolSchedule, url: parsed.patrolUrl }],
        };
      }
      return parsed;
    }
    return {
      dashboardTitle: 'SmartWarga Dashboard',
      dashboardSubtitle: 'Selamat datang di sistem layanan digital RT. 03.',
      govItems: [
        { id: '1', title: 'Vaksinasi Booster', content: 'Pemerintah sedang menjalankan program vaksinasi booster gratis di Puskesmas terdekat. Harap membawa KTP.', url: 'https://www.kemkes.go.id' }
      ],
      activityItems: [
        { id: '1', title: 'Kerja Bakti', content: 'Kegiatan kerja bakti rutin akan dilaksanakan pada hari Minggu besok pukul 07.00 WIB. Mohon partisipasinya.', url: 'https://picsum.photos/800/600' }
      ],
      patrolItems: [
        { id: 'p1', title: 'Senin', content: 'Bpk. Andi & Bpk. Budi', date: 'Malam Selasa' },
        { id: 'p2', title: 'Selasa', content: 'Bpk. Candra & Bpk. Dedi', date: 'Malam Rabu' },
        { id: 'p3', title: 'Rabu', content: 'Bpk. Eko & Bpk. Fajar', date: 'Malam Kamis' },
        { id: 'p4', title: 'Kamis', content: 'Bpk. Gani & Bpk. Hadi', date: 'Malam Jumat' },
        { id: 'p5', title: 'Jumat', content: 'Bpk. Indra & Bpk. Joko', date: 'Malam Sabtu' },
      ]
    };
  });

  const handleLogout = () => {
    setCurrentUser(null); 
    localStorage.removeItem('smartwarga_user'); 
    setActiveTab('dashboard');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('smartwarga_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    // Migration: Force update app name and subtitle if they still reference the old RT
    if (rtConfig.appName && (rtConfig.appName.includes("RT 05") || rtConfig.appName.includes("RT05"))) {
      setRtConfig(prev => ({ ...prev, appName: APP_NAME, rtEmail: 'rt03@smartwarga.id' }));
    }

    // Force update logo to the new one
    if (rtConfig.appLogo !== APP_LOGO_URL) {
      setRtConfig(prev => ({ ...prev, appLogo: APP_LOGO_URL }));
    }

    // Migration: Set the specific Google Sheet URL if not set
    if (!rtConfig.googleSheetUrl || rtConfig.googleSheetUrl === '') {
      setRtConfig(prev => ({ ...prev, googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BBRPWrpR4Lf8hTRiZ2uPuGnrHPn4A0OwKupRkMCzIik/edit?usp=sharing' }));
    }

    if (dashboardInfo.dashboardSubtitle && (dashboardInfo.dashboardSubtitle.includes("RT 05") || dashboardInfo.dashboardSubtitle.includes("RT05"))) {
      setDashboardInfo(prev => ({ 
        ...prev, 
        dashboardSubtitle: prev.dashboardSubtitle.replace(/RT\s?05/g, "RT. 03") 
      }));
    }

    // Migration: Split single patrol item into daily items if it's the old format
    if (dashboardInfo.patrolItems && dashboardInfo.patrolItems.length === 1 && dashboardInfo.patrolItems[0].title === 'Jadwal Mingguan') {
      setDashboardInfo(prev => ({
        ...prev,
        patrolItems: [
          { id: 'p1', title: 'Senin', content: 'Bpk. Andi & Bpk. Budi', date: 'Malam Selasa' },
          { id: 'p2', title: 'Selasa', content: 'Bpk. Candra & Bpk. Dedi', date: 'Malam Rabu' },
          { id: 'p3', title: 'Rabu', content: 'Bpk. Eko & Bpk. Fajar', date: 'Malam Kamis' },
          { id: 'p4', title: 'Kamis', content: 'Bpk. Gani & Bpk. Hadi', date: 'Malam Jumat' },
          { id: 'p5', title: 'Jumat', content: 'Bpk. Indra & Bpk. Joko', date: 'Malam Sabtu' },
        ]
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smartwarga_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('smartwarga_rt_config', JSON.stringify(rtConfig));
  }, [rtConfig]);

  useEffect(() => {
    localStorage.setItem('smartwarga_dashboard_info', JSON.stringify(dashboardInfo));
  }, [dashboardInfo]);

  useEffect(() => {
    localStorage.setItem('smartwarga_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('smartwarga_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('smartwarga_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addLog = (action: string, target: string, type: string) => {
    const newLog = {
      id: Date.now(),
      action,
      user: currentUser?.name || 'Warga (Public)',
      target,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const autoSyncToGoogleSheets = async (currentResidents: Resident[]) => {
    const tokens = localStorage.getItem('google_tokens');
    if (!tokens) return;

    try {
      const parsedTokens = JSON.parse(tokens);
      const spreadsheetId = rtConfig.googleSheetUrl?.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];

      await fetch('/api/google/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: parsedTokens,
          residents: currentResidents,
          rtName: rtConfig.rtName,
          spreadsheetId
        })
      });
    } catch (error) {
      console.error("Auto-sync failed:", error);
    }
  };

  const handleSaveResident = (data: Resident) => {
    let updatedResidents: Resident[];
    if (editingResident) {
      updatedResidents = residents.map(r => r.nik === editingResident.nik ? data : r);
      addLog('Update Data Warga', `NIK: ${data.nik}`, 'UPDATE');
    } else {
      updatedResidents = [data, ...residents];
      addLog('Pendaftaran Warga Baru', `Nama: ${data.name}`, 'CREATE');
    }
    setResidents(updatedResidents);
    setIsResidentModalOpen(false);
    
    // Trigger auto-sync
    autoSyncToGoogleSheets(updatedResidents);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Plus_Jakarta_Sans']">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        onOpenService={() => { setIsServiceModalOpen(true); setIsSidebarOpen(false); }}
        onOpenRegister={() => setIsResidentModalOpen(true)}
        userRole={currentUser?.role || null}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        isLoggedIn={!!currentUser}
        rtConfig={rtConfig}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          user={currentUser} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onAdminClick={() => setActiveTab('login')} 
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
          {activeTab === 'login' && !currentUser ? (
            <LoginPage 
              rtConfig={rtConfig}
              admins={admins}
              onLogin={(user) => { 
                setCurrentUser(user); 
                localStorage.setItem('smartwarga_user', JSON.stringify(user)); 
                setActiveTab('dashboard'); 
              }} 
              onRegisterFirstAdmin={(user) => {
                setAdmins([user]);
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  residentsCount={residents.length} 
                  requests={requests} 
                  onOpenRegister={() => setIsResidentModalOpen(true)} 
                  dashboardInfo={dashboardInfo}
                  rtConfig={rtConfig}
                />
              )}
              {activeTab === 'warga' && (
                currentUser ? (
                  <ResidentDatabase 
                    residents={residents}
                    onAddResident={() => setIsResidentModalOpen(true)} 
                    onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                    onDeleteResident={(nik) => {
                      const updated = residents.filter(r => r.nik !== nik);
                      setResidents(updated);
                      autoSyncToGoogleSheets(updated);
                    }}
                    userRole={currentUser.role as any}
                    rtConfig={rtConfig}
                    setRtConfig={setRtConfig}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                    <h3 className="text-lg font-bold text-slate-800">Akses Terbatas</h3>
                    <p className="text-slate-500 text-sm">Silakan login sebagai admin untuk melihat database.</p>
                  </div>
                )
              )}
              {activeTab === 'surat' && <LetterRequests requests={requests} onUpdateStatus={(id, status) => setRequests(prev => prev.map(r => r.id === id ? {...r, status} : r))} isLoggedIn={!!currentUser} rtConfig={rtConfig} />}
              {activeTab === 'admin' && currentUser && (
                <AdminManagement 
                  userRole={currentUser.role} 
                  onLogout={handleLogout} 
                  rtConfig={rtConfig} 
                  setRtConfig={setRtConfig}
                  admins={admins}
                  setAdmins={setAdmins}
                  dashboardInfo={dashboardInfo}
                  setDashboardInfo={setDashboardInfo}
                />
              )}
              {activeTab === 'audit' && currentUser && <AuditLog logs={auditLogs} />}
            </>
          )}
        </main>

        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenService={() => setIsServiceModalOpen(true)}
          onOpenRegister={() => setIsResidentModalOpen(true)}
          isLoggedIn={!!currentUser}
        />
      </div>

      <ServiceRequestModal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
        onSubmit={(req) => setRequests([req, ...requests])} 
        rtConfig={rtConfig}
      />
      <ResidentFormModal isOpen={isResidentModalOpen} onClose={() => { setIsResidentModalOpen(false); setEditingResident(null); }} onSave={handleSaveResident} initialData={editingResident} />
      
      {/* PWA Install Prompt Notification */}
      {showInstallPrompt && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-[100] animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-5 flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
                  <img src={rtConfig.appLogo} alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Instal Aplikasi {rtConfig.appName}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Akses lebih cepat & mudah langsung dari layar utama ponsel Anda.</p>
                </div>
              </div>
              <button onClick={handleDismissInstall} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleDismissInstall}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Nanti Saja
              </button>
              <button 
                onClick={handleInstallClick}
                className="flex-1 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                Instal Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Floating UI */}
      <AIAssistant rtConfig={rtConfig} />
    </div>
  );
};

export default App;
