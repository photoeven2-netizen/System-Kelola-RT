
import React from 'react';
import { 
  FileText, 
  MapPin, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

// UBAH NAMA DAN LOGO DI SINI
export const APP_NAME = "SmartWarga RT. 03";
export const APP_SUBTITLE = "Kampung Bhineka - RT. 03 / RW 02";
export const APP_LOGO_URL = "https://ais-dev-w6pd5nksvq66heguaovi7k-264076151992.asia-southeast1.run.app/logo.png";

export const FEATURE_LIST = [
  {
    title: "Database Digital",
    desc: "Penyimpanan data warga aman dan terstruktur.",
    icon: <Users className="text-blue-500" />
  },
  {
    title: "Surat Otomatis",
    desc: "Generate PDF resmi dengan QR Code dalam hitungan detik.",
    icon: <FileText className="text-emerald-500" />
  },
  {
    title: "Integrasi Wilayah",
    desc: "Data alamat sinkron dengan API nasional.",
    icon: <MapPin className="text-amber-500" />
  },
  {
    title: "Keamanan RBAC",
    desc: "Akses bertingkat untuk Super Admin dan Staf.",
    icon: <ShieldCheck className="text-purple-500" />
  }
];
