
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, MapPin, User, Calendar, PlusCircle, Baby, Home } from 'lucide-react';
import { MaritalStatus, Resident } from '../types';
import { fetchProvinces, fetchRegencies, fetchDistricts, fetchVillages } from '../services/locationService';

interface ResidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Resident) => void;
  initialData: Resident | null;
}

const ResidentFormModal: React.FC<ResidentFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [provinces, setProvinces] = useState<any[]>([]);
  
  // States for Address
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  
  // States for POB (Place of Birth)
  const [pobRegencies, setPobRegencies] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'none' | 'province' | 'regency' | 'district' | 'village' | 'pob'>('none');

  const [formData, setFormData] = useState<Resident>({
    nik: '', noKk: '', name: '', pob: '', dob: '', gender: 'Laki-laki',
    religion: 'Islam', occupation: '-', bloodType: '-',
    maritalStatus: MaritalStatus.LAJANG, province: '', regency: '',
    district: '', village: '', address: ''
  });

  const [selProvId, setSelProvId] = useState('');
  const [selRegId, setSelRegId] = useState('');
  const [selDistId, setSelDistId] = useState('');
  const [selVillId, setSelVillId] = useState('');

  const [selPobProvId, setSelPobProvId] = useState('');
  const [selPobRegId, setSelPobRegId] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      if (isOpen) {
        setLoadingStep('province');
        const data = await fetchProvinces();
        setProvinces(data);
        setLoadingStep('none');

        if (initialData) {
          setFormData(initialData);
        } else {
          setFormData({
            nik: '', noKk: '', name: '', pob: '', dob: '', gender: 'Laki-laki',
            religion: 'Islam', occupation: '-', bloodType: '-',
            maritalStatus: MaritalStatus.LAJANG, province: '', regency: '',
            district: '', village: '', address: ''
          });
          setSelProvId(''); setSelRegId(''); setSelDistId(''); setSelVillId('');
          setSelPobProvId(''); setSelPobRegId('');
        }
      }
    };
    loadInitialData();
  }, [isOpen, initialData]);

  // Handle POB Province Change
  const handlePobProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelPobProvId(id);
    setSelPobRegId('');
    setPobRegencies([]);
    if (id) {
      setLoadingStep('pob');
      const data = await fetchRegencies(id);
      setPobRegencies(data);
      setLoadingStep('none');
    }
  };

  const handlePobRegChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = pobRegencies.find(r => r.id === id);
    setSelPobRegId(id);
    setFormData(prev => ({ ...prev, pob: item?.name || '' }));
  };

  // Handle Current Address Province Change
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = provinces.find(p => p.id === id);
    setSelProvId(id); setSelRegId(''); setSelDistId(''); setSelVillId('');
    setRegencies([]); setDistricts([]); setVillages([]);
    setFormData(prev => ({ ...prev, province: item?.name || '', regency: '', district: '', village: '' }));
    if (id) {
      setLoadingStep('regency');
      const data = await fetchRegencies(id);
      setRegencies(data);
      setLoadingStep('none');
    }
  };

  const handleRegencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = regencies.find(p => p.id === id);
    setSelRegId(id); setSelDistId(''); setSelVillId('');
    setDistricts([]); setVillages([]);
    setFormData(prev => ({ ...prev, regency: item?.name || '', district: '', village: '' }));
    if (id) {
      setLoadingStep('district');
      const data = await fetchDistricts(id);
      setDistricts(data);
      setLoadingStep('none');
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = districts.find(p => p.id === id);
    setSelDistId(id); setSelVillId(''); setVillages([]);
    setFormData(prev => ({ ...prev, district: item?.name || '', village: '' }));
    if (id) {
      setLoadingStep('village');
      const data = await fetchVillages(id);
      setVillages(data);
      setLoadingStep('none');
    }
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = villages.find(p => p.id === id);
    setSelVillId(id);
    setFormData(prev => ({ ...prev, village: item?.name || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nik.length !== 16) { alert("NIK harus 16 digit!"); return; }
    setIsSubmitting(true);
    setTimeout(() => { onSave(formData); setIsSubmitting(false); }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 overflow-hidden">
      <div className="bg-white w-full max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
              <PlusCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{initialData ? 'Ubah Data' : 'Pendaftaran Warga'}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">SINKRONISASI DATA NASIONAL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 flex-1 scrollbar-hide">
          <form id="resident-reg-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <User size={16} /><h4 className="text-[11px] font-black uppercase tracking-widest">Identitas Dasar</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">NIK</label>
                  <input 
                    required 
                    type="text" 
                    maxLength={16} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.nik} 
                    onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">No. KK</label>
                  <input 
                    required 
                    type="text" 
                    maxLength={16} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.noKk} 
                    onChange={e => setFormData({...formData, noKk: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Baby size={16} /><h4 className="text-[11px] font-black uppercase tracking-widest">Kelahiran (TTL)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Provinsi Lahir</label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white" value={selPobProvId} onChange={handlePobProvChange}>
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kota Lahir {loadingStep === 'pob' && '...'}</label>
                  <select required disabled={!selPobProvId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selPobRegId} onChange={handlePobRegChange}>
                    <option value="">Pilih Kota</option>
                    {pobRegencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                  <input required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <MapPin size={16} /><h4 className="text-[11px] font-black uppercase tracking-widest">Domisili Sekarang</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Provinsi</label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white" value={selProvId} onChange={handleProvinceChange}>
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kota {loadingStep === 'regency' && '...'}</label>
                  <select required disabled={!selProvId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selRegId} onChange={handleRegencyChange}>
                    <option value="">Pilih Kota</option>
                    {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kecamatan {loadingStep === 'district' && '...'}</label>
                  <select required disabled={!selRegId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selDistId} onChange={handleDistrictChange}>
                    <option value="">Pilih Kecamatan</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kelurahan {loadingStep === 'village' && '...'}</label>
                  <select required disabled={!selDistId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selVillId} onChange={handleVillageChange}>
                    <option value="">Pilih Kelurahan</option>
                    {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <Home size={14} /><label className="text-[10px] font-bold uppercase">Alamat Lengkap</label>
                  </div>
                  <textarea 
                    required 
                    rows={3}
                    placeholder="Contoh: Jl. Merdeka No. 05, RT. 03/02"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                  <p className="text-[10px] text-slate-400 italic">Sebutkan nama jalan, nomor rumah, dan detail RT/RW.</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold text-sm">Batal</button>
          <button form="resident-reg-form" type="submit" disabled={isSubmitting || loadingStep !== 'none'} className="px-10 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg disabled:opacity-50 flex items-center space-x-2 transition-all active:scale-95">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentFormModal;
