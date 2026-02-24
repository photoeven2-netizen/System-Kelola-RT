
// Add AdminRole enum to fix missing export errors in other components
export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  STAFF = 'Staf'
}

export enum MaritalStatus {
  LAJANG = 'Lajang',
  MENIKAH = 'Menikah',
  CERAI_HIDUP = 'Cerai Hidup',
  CERAI_MATI = 'Cerai Mati'
}

export enum LetterType {
  PINDAH = 'Surat Keterangan Pindah',
  NIKAH = 'Surat Izin Nikah (N1-N4)',
  KERAMAIAN = 'Surat Izin Keramaian',
  KEMATIAN = 'Surat Kematian',
  SKTM = 'SKTM (Surat Keterangan Tidak Mampu)',
  DOMISILI = 'Surat Keterangan Domisili'
}

export enum RequestStatus {
  PENDING = 'Menunggu Verifikasi',
  APPROVED = 'Disetujui',
  REJECTED = 'Ditolak'
}

export interface Resident {
  nik: string;
  noKk: string;
  name: string;
  pob: string;
  dob: string;
  gender: 'Laki-laki' | 'Perempuan';
  religion: string;
  occupation: string;
  bloodType: string;
  maritalStatus: MaritalStatus;
  province: string;
  regency: string;
  district: string;
  village: string;
  address: string;
}

export interface ParentInfo {
  name: string;
  nik: string;
  pobDob: string;
  nationality: string;
  religion: string;
  occupation: string;
  address: string;
}

export interface ServiceRequest {
  id: string;
  nik: string;
  residentName: string;
  type: LetterType;
  status: RequestStatus;
  createdAt: string;
  address?: string;
  pobDob?: string;
  purpose?: string;
  deathDetails?: {
    date: string;
    dayPasaran: string;
    time: string;
    place: string;
    burialPlace: string;
  };
  pdfUrl?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: string;
}

export interface RTConfig {
  rtName: string;
  rtWhatsapp: string;
  rtEmail: string;
  appName: string;
  appLogo: string;
  googleSheetUrl?: string;
}

export interface DashboardItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  date?: string;
}

export interface DashboardInfo {
  dashboardTitle: string;
  dashboardSubtitle: string;
  govItems: DashboardItem[];
  activityItems: DashboardItem[];
  patrolItems: DashboardItem[];
}
