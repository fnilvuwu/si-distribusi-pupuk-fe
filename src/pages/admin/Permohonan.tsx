import {
  approvePersetujuanPupuk,
  getPersetujuanPupuk,
  getStokList,
  getJadwalDistribusi,
  rejectPersetujuanPupuk,
  type JadwalDistribusi,
  type PersetujuanPupuk,
  type StokPupuk
} from "@/api/admin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Filter, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

/* ================== TYPES ================== */
type ActionType = "approve" | "reject" | null;

/* ================== COMPONENT ================== */
export default function AdminPermohonan() {
  const [applications, setApplications] = useState<PersetujuanPupuk[]>([]);
  const [selectedApp, setSelectedApp] = useState<PersetujuanPupuk | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stokList, setStokList] = useState<StokPupuk[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalDistribusi[]>([]);
  
  const [formData, setFormData] = useState({
    jumlahDisetujui: 0,
    pupukId: 0,
    jadwalId: 0,
    alasanPenolakan: "",
  });

  useEffect(() => {
    loadPermohonan();
    loadStokList();
    loadJadwalList();
  }, []);

  const loadJadwalList = async () => {
    try {
      const data = await getJadwalDistribusi();
      setJadwalList(data);
    } catch (err) {
      console.error("Failed to load jadwal list", err);
    }
  };

  const loadStokList = async () => {
    try {
      const data = await getStokList();
      setStokList(data);
    } catch (err) {
      console.error("Failed to load stok list", err);
    }
  };

  const loadPermohonan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPersetujuanPupuk();
      setApplications(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Gagal memuat data permohonan");
      console.error("Error loading permohonan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (app: PersetujuanPupuk) => {
    setSelectedApp(app);
    setActionType(null);
    setFormData({
      jumlahDisetujui: app.jumlah_diminta || 0,
      pupukId: app.pupuk_id || 0,
      jadwalId: 0,
      alasanPenolakan: "",
    });
  };

  const closeModal = () => {
    setSelectedApp(null);
    setActionType(null);
  };

  const handleApproveAction = () => {
    setActionType("approve");
  };

  const handleRejectAction = () => {
    setActionType("reject");
  };

  const submitApproval = async () => {
    if (!selectedApp) return;

    if (formData.jumlahDisetujui <= 0) {
      alert("Jumlah yang disetujui harus lebih dari 0");
      return;
    }

    try {
      setIsLoading(true);
      await approvePersetujuanPupuk(selectedApp.id, {
        jumlah_disetujui: formData.jumlahDisetujui,
        pupuk_id: formData.pupukId,
        jadwal_id: formData.jadwalId // Include jadwal_id
      });
      alert("Permohonan berhasil disetujui!");
      closeModal();
      loadPermohonan();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Gagal menyetujui permohonan");
      console.error("Error approving permohonan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRejection = async () => {
    if (!selectedApp) return;

    if (!formData.alasanPenolakan.trim()) {
      alert("Alasan penolakan harus diisi");
      return;
    }

    try {
      setIsLoading(true);
      await rejectPersetujuanPupuk(selectedApp.id, {
        alasan: formData.alasanPenolakan,
      });
      alert("Permohonan berhasil ditolak!");
      closeModal();
      loadPermohonan();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Gagal menolak permohonan");
      console.error("Error rejecting permohonan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Filter}>
            Filter Status
          </Button>
          <Button variant="secondary" size="sm" icon={Search}>
            Cari NIK
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          {pendingApplications.length} Permohonan Menunggu
        </p>
      </div>

      {/* List */}
      <Card title="Daftar Permohonan Masuk">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : pendingApplications.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            Tidak ada permohonan yang menunggu persetujuan
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 border rounded-xl flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{app.nama_petani}</p>
                  <p className="text-sm text-gray-600">
                    {app.nama_pupuk} - {app.jumlah_diminta}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(app.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleViewDetail(app)}>
                  Lihat Detail
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">Detail Permohonan</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Nama Petani</p>
                  <p className="font-bold">{selectedApp.nama_petani}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Tanggal Pengajuan</p>
                  <p className="font-bold">{new Date(selectedApp.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Permohonan Pupuk</p>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="font-bold text-emerald-800">{selectedApp.nama_pupuk}</p>
                  <p className="text-emerald-600">Jumlah: {selectedApp.jumlah_diminta}</p>
                </div>
              </div>
            </div>

            {!actionType && (
              <div className="flex gap-2 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1 border-2 border-red-200 text-red-600"
                  onClick={handleRejectAction}
                >
                  Tolak
                </Button>
                <Button
                  className="flex-1 bg-emerald-600"
                  onClick={handleApproveAction}
                >
                  Setujui
                </Button>
              </div>
            )}

            {actionType === "approve" && (
              <div className="space-y-3 pt-4 border-t">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Info:</strong> Pastikan jumlah yang disetujui tidak melebihi stok yang tersedia dan sesuai dengan kebutuhan petani.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Jumlah Disetujui
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    value={formData.jumlahDisetujui}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jumlahDisetujui: parseInt(e.target.value) || 0,
                      })
                    }
                    min="1"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">
                      Permintaan Awal: {selectedApp.jumlah_diminta}
                    </span>
                    <span className="text-emerald-600 font-medium">
                      Stok Tersedia: {stokList.find(s => s.id === formData.pupukId)?.jumlah_stok ?? 0} {stokList.find(s => s.id === formData.pupukId)?.satuan}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Jenis Pupuk
                  </label>
                  <select
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                    value={formData.pupukId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pupukId: parseInt(e.target.value) || 0,
                      })
                    }
                  >
                    {stokList.map((stok) => (
                      <option key={stok.id} value={stok.id}>
                        {stok.nama_pupuk} (Stok: {stok.jumlah_stok} {stok.satuan})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                   <label className="block text-sm font-bold mb-2">
                     Jadwal Pengambilan
                   </label>
                   <select
                     className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                     value={formData.jadwalId}
                     onChange={(e) =>
                       setFormData({
                         ...formData,
                         jadwalId: parseInt(e.target.value) || 0,
                       })
                     }
                   >
                     <option value={0}>-- Pilih Jadwal --</option>
                     {jadwalList.map((jadwal) => (
                       <option key={jadwal.id} value={jadwal.id}>
                         {jadwal.nama_acara} - {new Date(jadwal.tanggal).toLocaleDateString("id-ID")} ({jadwal.lokasi})
                       </option>
                     ))}
                   </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setActionType(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600"
                    onClick={submitApproval}
                    disabled={isLoading || formData.jumlahDisetujui <= 0}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Konfirmasi Persetujuan"}
                  </Button>
                </div>
              </div>
            )}

            {actionType === "reject" && (
              <div className="space-y-3 pt-4 border-t">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Perhatian:</strong> Alasan penolakan akan dikirimkan ke petani. Pastikan alasan jelas dan membantu.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Alasan Penolakan
                  </label>
                  <textarea
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-32"
                    placeholder="Contoh: Stok tidak mencukupi, data lahan tidak valid, sudah menerima subsidi bulan ini..."
                    value={formData.alasanPenolakan}
                    onChange={(e) =>
                      setFormData({ ...formData, alasanPenolakan: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setActionType(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 text-white hover:bg-red-700"
                    onClick={submitRejection}
                    disabled={isLoading || !formData.alasanPenolakan.trim()}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Konfirmasi Penolakan"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}