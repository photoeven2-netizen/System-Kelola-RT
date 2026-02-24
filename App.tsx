
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
  
  const [rtConfig, setRtConfig] = useState<RTConfig>(() => {
    const saved = localStorage.getItem('smartwarga_rt_config');
    return saved ? JSON.parse(saved) : {
      rtName: 'Pak RT Budiman',
      rtWhatsapp: '628123456789',
      rtEmail: 'rt05@smartwarga.id',
      appName: APP_NAME,
      appLogo: APP_LOGO_URL,
      googleSheetUrl: ''
    };
  });

  const [dashboardInfo, setDashboardInfo] = useState<DashboardInfo>(() => {
    const saved = localStorage.getItem('smartwarga_dashboard_info');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: if old format, convert to new format
      if (parsed.govInfo) {
        return {
          dashboardTitle: parsed.dashboardTitle || 'SmartWarga Dashboard',
          dashboardSubtitle: parsed.dashboardSubtitle || 'Selamat datang di sistem layanan digital RT 05.',
          govItems: [{ id: '1', title: 'Info Pemerintah', content: parsed.govInfo, url: parsed.govUrl }],
          activityItems: [{ id: '1', title: 'Kegiatan Warga', content: parsed.activityInfo, url: parsed.activityUrl }],
          patrolItems: [{ id: '1', title: 'Jadwal Ronda', content: parsed.patrolSchedule, url: parsed.patrolUrl }],
        };
      }
      return parsed;
    }
    return {
      dashboardTitle: 'SmartWarga Dashboard',
      dashboardSubtitle: 'Selamat datang di sistem layanan digital RT 05.',
      govItems: [
        { id: '1', title: 'Vaksinasi Booster', content: 'Pemerintah sedang menjalankan program vaksinasi booster gratis di Puskesmas terdekat. Harap membawa KTP.', url: 'https://www.kemkes.go.id' }
      ],
      activityItems: [
        { id: '1', title: 'Kerja Bakti', content: 'Kegiatan kerja bakti rutin akan dilaksanakan pada hari Minggu besok pukul 07.00 WIB. Mohon partisipasinya.', url: 'https://picsum.photos/800/600' }
      ],
      patrolItems: [
        { id: '1', title: 'Jadwal Mingguan', content: 'Senin: Bpk. Andi & Bpk. Budi\nSelasa: Bpk. Candra & Bpk. Dedi\nRabu: Bpk. Eko & Bpk. Fajar\nKamis: Bpk. Gani & Bpk. Hadi\nJumat: Bpk. Indra & Bpk. Joko\nSabtu: Bpk. Kurnia & Bpk. Lukman\nMinggu: Bpk. Mono & Bpk. Nano', url: '' }
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

  const handleSaveResident = (data: Resident) => {
    if (editingResident) {
      setResidents(prev => prev.map(r => r.nik === editingResident.nik ? data : r));
      addLog('Update Data Warga', `NIK: ${data.nik}`, 'UPDATE');
    } else {
      setResidents(prev => [data, ...prev]);
      addLog('Pendaftaran Warga Baru', `Nama: ${data.name}`, 'CREATE');
    }
    setIsResidentModalOpen(false);
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
                />
              )}
              {activeTab === 'warga' && (
                currentUser ? (
                  <ResidentDatabase 
                    residents={residents}
                    onAddResident={() => setIsResidentModalOpen(true)} 
                    onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                    onDeleteResident={(nik) => setResidents(prev => prev.filter(r => r.nik !== nik))}
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
      
      {/* AI Assistant Floating UI */}
      <AIAssistant rtConfig={rtConfig} />
    </div>
  );
};

export default App;
