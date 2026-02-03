import type { PetaniProfile, RiwayatItem } from "@/api/petani";
import { getProfile, getRiwayat, konfirmasiTerima } from "@/api/petani";
import { ConfirmReceiptModal } from "@/components/petani/ConfirmReceiptModal";
import { SubmissionDetailModal } from "@/components/petani/SubmissionDetailModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileUp,
  Leaf,
  Lock,
  MapPin,
  Package
} from "lucide-react";
import { useEffect, useState } from "react";

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



interface SubmissionDetail {
  id: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  jenisPupuk: string;
  jumlah: string;
  status: "dijadwalkan" | "dikirim" | "selesai";
}

export default function PetaniHome() { // Removed Props


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    namaPupuk: string;
    jumlah: string;
    lokasi: string;
    id: number;
  } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<SubmissionDetail | null>(null);

  // API Data State
  const [profile, setProfile] = useState<PetaniProfile | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<RiwayatItem | null>(null);
  const [loading, setLoading] = useState(true);

  const statusVerifikasi = profile?.status_verifikasi ? "verified" : "pending";
  const isVerified = statusVerifikasi === "verified";
  const config = statusConfig[statusVerifikasi];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, riwayatData] = await Promise.all([
        getProfile(),
        getRiwayat()
      ]);

      setProfile(profileData);

      // Get latest submission (assuming API returns list, we sort by created_at desc or take first)
      if (riwayatData && riwayatData.length > 0) {
        // Sort by id desc (latest first) or created_at
        const sorted = [...riwayatData].sort((a, b) => b.id - a.id);
        setLatestSubmission(sorted[0]);
      } else {
        setLatestSubmission(null);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenConfirm = () => {
    if (!latestSubmission || latestSubmission.status !== "dikirim") return;

    setSelectedEvent({
      namaPupuk: latestSubmission.nama_pupuk,
      jumlah: `${latestSubmission.jumlah_disetujui || latestSubmission.jumlah_diminta} Kg`,
      lokasi: "Gudang Distribusi", // Backend doesn't provide location in RiwayatItem yet, assuming default or need update
      id: latestSubmission.id
    });
    setIsModalOpen(true);
  };

  const handleConfirmSuccess = async () => {
    if (selectedEvent) {
      try {
        await konfirmasiTerima(selectedEvent.id);
        setIsModalOpen(false);
        // Refresh data
        await fetchData();
        alert("Konfirmasi berhasil!");
      } catch (error) {
        console.error("Konfirmasi gagal:", error);
        alert("Gagal melakukan konfirmasi.");
      }
    }
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!latestSubmission) return;

    const dateObj = new Date(latestSubmission.created_at);

    setDetailData({
      id: `TRX-${latestSubmission.id}`,
      tanggal: dateObj.toLocaleDateString("id-ID"),
      waktu: dateObj.toLocaleTimeString("id-ID"),
      lokasi: "Gudang Distribusi",
      jenisPupuk: latestSubmission.nama_pupuk,
      jumlah: `${latestSubmission.jumlah_disetujui || latestSubmission.jumlah_diminta} Kg`,
      status: latestSubmission.status === "pending" ? "dijadwalkan" : latestSubmission.status as any,
    });
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">

      {/* 1. Status Grid (Verification, Quota, Next Schedule) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <Card className={`border-none shadow-sm bg-white p-5 ${!isVerified ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isVerified ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sisa Kuota</p>
              <h2 className={`text-2xl font-black ${isVerified ? "text-gray-800" : "text-gray-300"}`}>
                {isVerified ? "120 Kg" : "--"}
              </h2>
            </div>
          </div>
        </Card>

        <Card className={`border-none shadow-sm bg-white p-5 ${!isVerified ? "opacity-60" : ""}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isVerified ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Jadwal Terdekat</p>
              <h2 className={`text-sm font-bold ${isVerified ? "text-gray-800" : "text-gray-300"}`}>
                {isVerified ? "Belum Tersedia" : "Belum Tersedia"}
              </h2>
            </div>
          </div>
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

      {/* 2. Tracking Section (The Improved Card) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">
          Lacak Pengajuan Terakhir
        </h3>

        {!isVerified ? (
          <Card className="border-none shadow-sm bg-white p-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <Lock size={20} />
            </div>
            <p className="text-sm font-bold text-gray-700">Fitur Terkunci</p>
            <p className="text-xs text-gray-400 mt-1">Selesaikan verifikasi untuk melihat distribusi.</p>
          </Card>
        ) : !latestSubmission ? (
          <Card className="border-none shadow-sm bg-white p-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <Package size={20} />
            </div>
            <p className="text-sm font-bold text-gray-700">Belum Ada Pengajuan</p>
            <p className="text-xs text-gray-400 mt-1">Anda belum melakukan pengajuan pupuk apapun.</p>
          </Card>
        ) : (
          <div
            onClick={handleOpenConfirm}
            className={latestSubmission.status === "dikirim" ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}
          >
            <Card
              className={`group border-none shadow-sm bg-white overflow-hidden transition-all 
              ${latestSubmission.status === "dikirim" ? "cursor-pointer ring-2 ring-blue-500/10 hover:shadow-md" : ""}`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left Side: Date Block */}
                <div className="bg-emerald-50 md:w-32 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-emerald-100 text-emerald-700">
                  <span className="text-[10px] font-bold uppercase">
                    {new Date(latestSubmission.created_at).toLocaleDateString('id-ID', { weekday: 'long' })}
                  </span>
                  <span className="text-2xl font-black">
                    {new Date(latestSubmission.created_at).getDate()}
                  </span>
                  <span className="text-[10px] font-medium uppercase text-emerald-600">
                    {new Date(latestSubmission.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Clock size={12} />
                        <span>{new Date(latestSubmission.created_at).toLocaleTimeString('id-ID')}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-500" />
                        Gudang Distribusi
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <Badge status={latestSubmission.status === "pending" ? "dijadwalkan" : latestSubmission.status as any}>
                      {latestSubmission.status === "dikirim" ? "DIKIRIM" : latestSubmission.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Confirm Pulse Hint */}
                  {latestSubmission.status === "dikirim" && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit animate-pulse">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      PUPUK TELAH DIKIRIM - KLIK DISINI UNTUK KONFIRMASI TERIMA
                    </div>
                  )}

                  {/* Summary Info */}
                  <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-gray-100 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Package size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-none mb-1">Komoditas</p>
                        <p className="text-sm font-bold text-gray-700">{latestSubmission.nama_pupuk}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase leading-none mb-1">Total</p>
                      <p className="text-sm font-black text-emerald-700">
                        {latestSubmission.jumlah_disetujui || latestSubmission.jumlah_diminta} Kg
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleViewDetail}
                      className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline tracking-widest uppercase"
                    >
                      Lihat Detail <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <ConfirmReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSuccess}
        data={selectedEvent}
      />

      <SubmissionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />
    </div>
  );
}