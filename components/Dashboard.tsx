
import React from 'react';
import { 
  Users, 
  FileCheck, 
  Clock, 
  TrendingUp,
  FileText,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ServiceRequest, RequestStatus } from '../types';

interface DashboardProps {
  residentsCount: number;
  requests: ServiceRequest[];
  onOpenRegister: () => void;
}

const chartData = [
  { name: 'Jan', surat: 12 },
  { name: 'Feb', surat: 19 },
  { name: 'Mar', surat: 15 },
  { name: 'Apr', surat: 25 },
  { name: 'May', surat: 32 },
  { name: 'Jun', surat: 28 },
];

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 md:p-3 rounded-xl ${color} text-white shadow-lg`}>
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
      <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">
        <TrendingUp size={12} />
        <span>+{trend}%</span>
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">{value}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ residentsCount, requests, onOpenRegister }) => {
  const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING).length;
  const totalRequests = requests.length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">SmartWarga Dashboard</h2>
        <p className="text-xs md:text-sm text-slate-500">Selamat datang di sistem layanan digital RT 05.</p>
      </div>

      {/* Quick Actions for Public Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={onOpenRegister}
          className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[24px] text-left text-white shadow-xl shadow-blue-100 hover:scale-[1.01] transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <UserPlus size={100} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Pendaftaran Warga Baru</h3>
              <p className="text-blue-100 text-xs md:text-sm font-medium">Belum terdaftar di sistem RT 05? Daftarkan diri Anda secara mandiri di sini.</p>
            </div>
            <div className="mt-6 flex items-center space-x-2 font-bold text-sm">
              <span>Mulai Daftar Sekarang</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Warga" value={residentsCount} icon={Users} color="bg-blue-600" trend="12" />
          <StatCard label="Antrean Surat" value={pendingRequests} icon={Clock} color="bg-amber-500" trend="8" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Trend Pengajuan Surat</h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSurat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <Tooltip />
                <Area type="monotone" dataKey="surat" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSurat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold mb-4">Layanan Digital RT</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">Pengajuan surat keterangan tanpa harus ke rumah Pak RT.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">Database warga yang aman dan terintegrasi dengan data nasional.</p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Dikembangkan untuk RT 05 / RW 02
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
