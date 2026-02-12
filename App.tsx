
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
import { AdminUser, Resident, ServiceRequest, RequestStatus, LetterType, RTConfig } from './types.ts';
import { APP_NAME, APP_LOGO_URL } from './constants.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'warga' | 'surat' | 'admin' | 'audit' | 'login'>('dashboard');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [residents, setResidents] = useState<Resident[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [rtConfig, setRtConfig] = useState<RTConfig>({
    rtName: 'Pak RT Budiman',
    rtWhatsapp: '628123456789',
    rtEmail: 'rt05@smartwarga.id',
    appName: APP_NAME,
    appLogo: APP_LOGO_URL
  });

  const handleLogout = () => {
    if (window.confirm(`Apakah Anda yakin ingin keluar dari ${rtConfig.appName}?`)) {
      setCurrentUser(null); 
      localStorage.removeItem('smartwarga_user'); 
      setActiveTab('dashboard');
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('smartwarga_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedRT = localStorage.getItem('smartwarga_rt_config');
    if (savedRT) setRtConfig(JSON.parse(savedRT));

    const savedResidents = localStorage.getItem('smartwarga_residents');
    if (savedResidents) setResidents(JSON.parse(savedResidents));

    const savedRequests = localStorage.getItem('smartwarga_requests');
    if (savedRequests) setRequests(JSON.parse(savedRequests));

    const savedLogs = localStorage.getItem('smartwarga_logs');
    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('smartwarga_rt_config', JSON.stringify(rtConfig));
  }, [rtConfig]);

  useEffect(() => {
    if (residents.length > 0) localStorage.setItem('smartwarga_residents', JSON.stringify(residents));
  }, [residents]);

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
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
          {activeTab === 'login' && !currentUser ? (
            <LoginPage 
              rtConfig={rtConfig}
              onLogin={(user) => { 
                setCurrentUser(user); 
                localStorage.setItem('smartwarga_user', JSON.stringify(user)); 
                setActiveTab('dashboard'); 
              }} 
            />
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard residentsCount={residents.length} requests={requests} onOpenRegister={() => setIsResidentModalOpen(true)} />}
              {activeTab === 'warga' && (
                currentUser ? (
                  <ResidentDatabase 
                    residents={residents}
                    onAddResident={() => setIsResidentModalOpen(true)} 
                    onEditResident={(res) => { setEditingResident(res); setIsResidentModalOpen(true); }}
                    onDeleteResident={(nik) => setResidents(prev => prev.filter(r => r.nik !== nik))}
                    userRole={currentUser.role as any}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                    <h3 className="text-lg font-bold text-slate-800">Akses Terbatas</h3>
                    <p className="text-slate-500 text-sm">Silakan login sebagai admin untuk melihat database.</p>
                  </div>
                )
              )}
              {activeTab === 'surat' && <LetterRequests requests={requests} onUpdateStatus={(id, status) => setRequests(prev => prev.map(r => r.id === id ? {...r, status} : r))} isLoggedIn={!!currentUser} rtConfig={rtConfig} />}
              {activeTab === 'admin' && currentUser && <AdminManagement userRole={currentUser.role} onLogout={handleLogout} rtConfig={rtConfig} setRtConfig={setRtConfig} />}
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
