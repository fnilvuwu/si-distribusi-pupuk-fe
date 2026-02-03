import type { LaporHasilPayload } from "@/api/petani";
import { laporHasilTani } from "@/api/petani";
import AddLaporanModal from "@/components/petani/AddLaporanModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
  Sprout,
  TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  statusVerifikasi: "pending" | "verified" | "rejected";
}

interface LaporanItem {
  id: number;
  tanggalPanen: string;
  jenisKomoditas: string;
  totalHasil: number;
  lokasi: string;
  status: "dilaporkan" | "terverifikasi";
}

interface LaporanInput {
  tanggalPanen: string;
  jenisKomoditas: string;
  totalHasil: number;
  lokasi: string;
}

interface Props {
  statusVerifikasi: "pending" | "verified" | "rejected";
}

export default function PetaniLaporan({ statusVerifikasi }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // NOTE: Backend does NOT have GET /petani/laporan yet.
  // We can only submit. So we maintain a temporary local list for UI demo purposes,
  // or purely rely on successful alert.
  // For now, I will empty the initial list or keep it empty. 
  // If the user wants to see their history, the backend needs an endpoint.
  // I will leave it empty to show "No reports" or maybe one dummy to show UI?
  // User asked to REMOVE dummy data. So I will start empty.
  const [laporanList, setLaporanList] = useState<LaporanItem[]>([]);

  // Logic for filtering
  const filteredLaporan = useMemo(() => {
    return laporanList.filter((l) => {
      const matchesSearch = l.jenisKomoditas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || l.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [laporanList, searchQuery, filterStatus]);

  if (statusVerifikasi !== "verified") {
    return (
      <Card className="max-w-2xl mx-auto p-10 text-center flex flex-col items-center gap-4">
        <div className="bg-amber-100 p-3 rounded-full text-amber-600">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Fitur Terkunci</h3>
        <p className="text-sm text-gray-500">Anda harus terverifikasi untuk dapat melaporkan hasil panen.</p>
      </Card>
    );
  }

  const handleSaveLaporan = async (data: LaporanInput) => {
    try {
      const payload: LaporHasilPayload = {
        jenis_tanaman: data.jenisKomoditas,
        jumlah_hasil: data.totalHasil,
        satuan: 'Kg',
        tanggal_panen: data.tanggalPanen,
      };

      await laporHasilTani(payload);

      // Optimistically add to list (since we can't fetch)
      const newLaporan: LaporanItem = {
        id: Date.now(),
        ...data,
        status: "dilaporkan", // Default status
      };
      setLaporanList([newLaporan, ...laporanList]);
      setIsModalOpen(false);
      alert("Laporan hasil tani berhasil dikirim!");
    } catch (error) {
      console.error("Gagal melapor hasil tani", error);
      alert("Gagal mengirim laporan. Silakan coba lagi.");
    }
  };

  // Hitung statistik untuk chart
  const totalHasilKeseluruhan = laporanList.reduce((sum, item) => sum + item.totalHasil, 0);
  const rataRataHasil = laporanList.length ? Math.round(totalHasilKeseluruhan / laporanList.length) : 0;

  const statusConfig = {
    dilaporkan: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", label: "Dilaporkan" },
    terverifikasi: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", label: "Terverifikasi" },
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Hasil Panen</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola dan pantau semua laporan hasil panen Anda
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 px-4 py-2"
        >
          <Plus size={20} />
          Laporan Baru
        </Button>
      </div>

      {/* Chart/Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Total Hasil Panen</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalHasilKeseluruhan} Kg</p>
              <p className="text-[10px] text-gray-500 mt-1">{laporanList.length} laporan</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Rata-Rata Panen</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{rataRataHasil} Kg</p>
              <p className="text-[10px] text-gray-500 mt-1">Per laporan</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Sprout size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Terverifikasi</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {laporanList.filter(l => l.status === "terverifikasi").length}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">laporan</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* History Section */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Riwayat Laporan</h3>

          {/* Fill the horizontal space with search & filter */}
          <div className="flex items-center gap-3 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari komoditas..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="dilaporkan">Dilaporkan</option>
            </select>
          </div>
        </div>

        {filteredLaporan.length === 0 ? (
          <Card className="p-16 text-center border-dashed bg-gray-50/50">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white rounded-full shadow-sm">
                <Search size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Laporan tidak ditemukan</p>
              <p className="text-xs text-gray-400">Belum ada data laporan hasil tani.</p>
            </div>
          </Card>
        ) : (
          /* USE GRID HERE: grid-cols-2 fills the horizontal space much better */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredLaporan.map((laporan) => {
              const config = statusConfig[laporan.status];
              return (
                <Card
                  key={laporan.id}
                  className="group p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-200 transition-all border-l-4 border-l-emerald-500 bg-white cursor-pointer"
                >
                  <div className="flex gap-4 items-center overflow-hidden">
                    <div className="hidden sm:flex bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                      <Sprout size={24} />
                    </div>
                    <div className="space-y-2 truncate">
                      <p className="font-bold text-gray-900 text-lg leading-tight truncate">
                        {laporan.jenisKomoditas}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(laporan.tanggalPanen).toLocaleDateString("id-ID")}</span>
                          <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">{laporan.totalHasil} Kg</span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400 italic truncate">
                          <MapPin size={11} /> {laporan.lokasi}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pl-4 border-l border-gray-50">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${config.bg} ${config.text} ${config.border} border px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap`}>
                      {laporan.status === "terverifikasi" ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {config.label}
                    </span>
                    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AddLaporanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLaporan}
      />
    </div>
  );
}