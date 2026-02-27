import type { PetaniProfile } from "@/api/petani";
import { getProfile } from "@/api/petani";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileUp,
  Leaf,
  Lock
} from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  statusVerifikasi: "pending" | "verified" | "rejected";
}

const statusConfig = {
  verified: {
    label: "Terverifikasi",
    sub: "Akun aktif & fitur terbuka",
    icon: <CheckCircle className="text-emerald-500" size={24} />,
    accent: "border-l-emerald-500",
  },
  pending: {
    label: "Diproses",
    sub: "Menunggu verifikasi admin",
    icon: <Clock className="text-amber-500" size={24} />,
    accent: "border-l-amber-500",
  },
  rejected: {
    label: "Ditolak",
    sub: "Data KTP tidak valid",
    icon: <AlertCircle className="text-red-500" size={24} />,
    accent: "border-l-red-500",
  },
};



export default function PetaniHome({ statusVerifikasi }: Props) {
  // API Data State
  const [profile, setProfile] = useState<PetaniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const config = statusConfig[statusVerifikasi];

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();

      setProfile(profileData);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">

      {/* 1. Status Verification */}
      <div>
        <Card className={`bg-white border-none shadow-sm border-l-4 ${config.accent} p-5`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status Akun</p>
              <h2 className="text-xl font-bold mt-1 text-gray-800">{config.label}</h2>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">{config.icon}</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{config.sub}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Profil Petani (Sesuai KTP)">
          {loading ? <p className="p-4 text-center text-gray-500">Memuat data...</p> : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Nama Lengkap</p>
                <p className="font-bold">{profile?.nama_lengkap || "-"}</p>
              </div>
              <div>
                <p className="text-gray-400">NIK</p>
                <p className="font-bold">{profile?.nik || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Alamat</p>
                <p className="font-bold">{profile?.alamat || "-"}</p>
              </div>
              <div>
                <p className="text-gray-400">No HP</p>
                <p className="font-bold">{profile?.no_hp || "-"}</p>
              </div>

              {/* Komoditas Terkunci (Padi) */}
              <div className="col-span-2 mt-2">
                <p className="text-gray-400 mb-1 flex items-center gap-1">
                  Komoditas Utama <Lock size={12} />
                </p>
                <div className="flex items-center gap-3 p-3 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                  <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600">
                    <Leaf size={16} />
                  </div>
                  <span className="font-bold text-gray-500">Padi</span>
                  <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                    Default
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card title="Dokumen Profil">
          <div className="space-y-4 text-sm">
            {/* KTP WAJIB */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileUp size={18} className="text-gray-500" />
                <span>Foto KTP (Wajib)</span>
              </div>
              <span className={`font-bold ${profile?.url_ktp ? "text-emerald-600" : "text-amber-600"}`}>
                {profile?.url_ktp ? "Terunggah" : "Belum Ada"}
              </span>
            </div>

            {/* Kartu Tani OPSIONAL */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileUp size={18} className="text-gray-500" />
                <span>Foto Kartu Tani (Opsional)</span>
              </div>
              <span className={`font-bold ${profile?.url_kartu_tani ? "text-emerald-600" : "text-amber-600"}`}>
                {profile?.url_kartu_tani ? "Terunggah" : "Belum Ada"}
              </span>
            </div>

            <Button variant="secondary" className="w-full mt-4">
              Upload / Perbarui Dokumen
            </Button>
          </div>
        </Card>
      </div>

    </div>
  );
}