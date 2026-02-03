import {
  approveVerifikasiHasilTani,
  approveVerifikasiPetani,
  getVerifikasiHasilTani,
  getVerifikasiHasilTaniDetail,
  getVerifikasiPetani,
  getVerifikasiPetaniDetail,
  rejectVerifikasiHasilTani,
  rejectVerifikasiPetani,
  type VerifikasiHasilTani,
  type VerifikasiPetani,
  type VerifikasiPetaniDetail,
} from "@/api/admin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Image as ImageIcon,
  Loader2,
  Users,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from "react";

export default function AdminVerifikasi() {
  const [activeSubTab, setActiveSubTab] = useState<"biodata" | "laporan">("biodata");

  // Petani State
  const [petaniList, setPetaniList] = useState<VerifikasiPetani[]>([]);
  const [selectedPetani, setSelectedPetani] = useState<VerifikasiPetaniDetail | null>(null);
  const [petaniPage, setPetaniPage] = useState(1);
  const [petaniTotalPages, setPetaniTotalPages] = useState(1);

  // Hasil Tani State
  const [hasilTaniList, setHasilTaniList] = useState<VerifikasiHasilTani[]>([]);
  const [selectedHasilTani, setSelectedHasilTani] = useState<VerifikasiHasilTani | null>(null);
  const [hasilTaniPage, setHasilTaniPage] = useState(1);
  const [hasilTaniTotalPages, setHasilTaniTotalPages] = useState(1);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadPetaniData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getVerifikasiPetani({ page: petaniPage, page_size: 10 });
      setPetaniList(response);
      setPetaniTotalPages(1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Gagal memuat data verifikasi petani");
      console.error("Error loading petani data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [petaniPage]);

  const loadHasilTaniData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getVerifikasiHasilTani({ page: hasilTaniPage, page_size: 10 });
      setHasilTaniList(response);
      setHasilTaniTotalPages(1); // Backend does not return total pages yet
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Gagal memuat data hasil tani");
      console.error("Error loading hasil tani data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [hasilTaniPage]);

  // Load Petani Data
  useEffect(() => {
    if (activeSubTab === "biodata") {
      loadPetaniData();
    }
  }, [activeSubTab, loadPetaniData]);

  // Load Hasil Tani Data
  useEffect(() => {
    if (activeSubTab === "laporan") {
      loadHasilTaniData();
    }
  }, [activeSubTab, loadHasilTaniData]);

  const handleViewPetaniDetail = async (petaniId: number) => {
    try {
      setIsLoading(true);
      const detail = await getVerifikasiPetaniDetail(petaniId);
      setSelectedPetani(detail);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Gagal memuat detail petani");
      console.error("Error loading petani detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHasilTaniDetail = async (laporanId: number) => {
    try {
      setIsLoading(true);
      const detail = await getVerifikasiHasilTaniDetail(laporanId);
      setSelectedHasilTani(detail);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Gagal memuat detail laporan");
      console.error("Error loading hasil tani detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePetani = async () => {
    if (!selectedPetani) return;
    try {
      setIsLoading(true);
      await approveVerifikasiPetani(selectedPetani.user_id, {});
      setSelectedPetani(null);
      loadPetaniData();
      alert("Akun petani berhasil diaktivasi!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Gagal menyetujui verifikasi");
      console.error("Error approving petani:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveHasilTani = async () => {
    if (!selectedHasilTani) return;
    try {
      setIsLoading(true);
      await approveVerifikasiHasilTani(selectedHasilTani.id, {});
      setSelectedHasilTani(null);
      loadHasilTaniData();
      alert("Laporan hasil tani berhasil diverifikasi!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Gagal menyetujui laporan");
      console.error("Error approving hasil tani:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;

    try {
      setIsLoading(true);

      if (selectedPetani) {
        await rejectVerifikasiPetani(selectedPetani.user_id, { reason: rejectReason });
        setSelectedPetani(null);
        loadPetaniData();
        alert("Data petani berhasil ditolak");
      } else if (selectedHasilTani) {
        await rejectVerifikasiHasilTani(selectedHasilTani.id, { reason: rejectReason });
        setSelectedHasilTani(null);
        loadHasilTaniData();
        alert("Laporan hasil tani berhasil ditolak");
      }

      setRejectReason("");
      setIsRejectModalOpen(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(errorMessage || "Gagal menolak data");
      console.error("Error rejecting:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERING LOGIC ---

  // 1. View Detail Verifikasi Akun (Biodata)
  if (selectedPetani) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedPetani(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600">
          <ArrowLeft size={16} /> Kembali ke Daftar Akun
        </button>
        <Card title="Verifikasi Aktivasi Akun">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 font-bold uppercase">Nama</p><p className="font-bold">{selectedPetani.nama_lengkap}</p></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase">NIK</p><p className="font-bold">{selectedPetani.nik}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-400 font-bold uppercase">Alamat</p><p className="font-bold">{selectedPetani.alamat}</p></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase">No. HP</p><p className="font-bold">{selectedPetani.no_hp}</p></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase">Tanggal Daftar</p><p className="font-bold">{selectedPetani.created_at ? new Date(selectedPetani.created_at).toLocaleDateString('id-ID') : '-'}</p></div>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-bold uppercase">Dokumen Identitas</p>
              <div className="flex gap-4">
                {selectedPetani.url_ktp && (
                  <div className="flex-1 p-4 border rounded-lg flex flex-col items-center gap-2 bg-gray-50">
                    <ImageIcon size={24} className="text-blue-500" />
                    <span className="text-xs font-bold">KTP</span>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6">Lihat Foto</Button>
                  </div>
                )}
                {selectedPetani.url_kartu_tani && (
                  <div className="flex-1 p-4 border rounded-lg flex flex-col items-center gap-2 bg-gray-50">
                    <ImageIcon size={24} className="text-blue-500" />
                    <span className="text-xs font-bold">KARTU TANI</span>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6">Lihat Foto</Button>
                  </div>
                )}
              </div>
            </div>
            {!selectedPetani.status_verifikasi && (
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-emerald-600 text-white font-bold h-12"
                  onClick={handleApprovePetani}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aktivasi Akun Petani"}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 border-2 border-red-200 text-red-600 font-bold h-12"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isLoading}
                >
                  Tolak Data
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Modal Rejection */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800">Alasan Penolakan</h3>
                <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Perhatian:</strong> Aksi ini akan mengirimkan notifikasi penolakan ke petani. Pastikan alasan jelas.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Detail Alasan</label>
                  <textarea
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none resize-none text-sm transition-all"
                    placeholder="Contoh: Foto KTP buram, NIK tidak sesuai dengan format, atau data lahan meragukan..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Batal</Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200"
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                >
                  Kirim Penolakan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. View Detail Verifikasi Laporan Panen
  if (selectedHasilTani) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedHasilTani(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600">
          <ArrowLeft size={16} /> Kembali ke Daftar Laporan
        </button>
        <Card title="Detail Laporan & Bukti">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 font-bold uppercase">Nama Petani</p><p className="font-bold">{selectedHasilTani.nama_lengkap}</p></div>
              {/* NIK not available in backend response yet */}
              <div><p className="text-xs text-gray-400 font-bold uppercase">Jenis Tanaman</p><p className="font-bold">{selectedHasilTani.jenis_tanaman}</p></div>
              {/* Luas Lahan not available */}
              <div><p className="text-xs text-gray-400 font-bold uppercase">Hasil Panen</p><p className="font-bold">{selectedHasilTani.jumlah_hasil} {selectedHasilTani.satuan}</p></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase">Tanggal Panen</p><p className="font-bold">{new Date(selectedHasilTani.tanggal_panen).toLocaleDateString('id-ID')}</p></div>
              {/* Lokasi not available */}
            </div>
            {selectedHasilTani.bukti_url && (
              <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center gap-2">
                <ImageIcon size={20} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">BUKTI PANEN</span>
                <Button variant="ghost" size="sm">Lihat Foto</Button>
              </div>
            )}
            {!selectedHasilTani.status_verifikasi && (
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-600 text-white font-bold"
                  onClick={handleApproveHasilTani}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terima Laporan"}
                </Button>
                <Button
                  variant="ghost"
                  className="border-red-200 text-red-500"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isLoading}
                >
                  Tolak
                </Button>
              </div>
            )}
            {/* Keterangan removed or empty */}
          </div>
        </Card>

        {/* Modal Rejection */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800">Alasan Penolakan Laporan</h3>
                <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Perhatian:</strong> Aksi ini akan mengirimkan notifikasi penolakan ke petani.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Detail Alasan</label>
                  <textarea
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none resize-none text-sm transition-all"
                    placeholder="Contoh: Bukti tidak valid, buram, tanggal tidak sesuai..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Batal</Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200"
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                >
                  Kirim Penolakan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  const pendingPetani = petaniList.filter(p => !p.status_verifikasi);
  const verifiedPetani = petaniList.filter(p => p.status_verifikasi);

  const pendingHasilTani = hasilTaniList.filter(h => !h.status_verifikasi);
  const verifiedHasilTani = hasilTaniList.filter(h => h.status_verifikasi);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 w-fit rounded-lg">
        <button
          onClick={() => setActiveSubTab("biodata")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${activeSubTab === "biodata" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Users size={16} /> Verifikasi Biodata
        </button>
        <button
          onClick={() => setActiveSubTab("laporan")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${activeSubTab === "laporan" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <ClipboardCheck size={16} /> Hasil Tani
        </button>
      </div>

      <Card
        title={activeSubTab === "biodata" ? "Antrean Verifikasi Biodata" : "Laporan Penggunaan Pupuk"}
        subtitle={activeSubTab === "biodata" ? "Petani yang baru mendaftar dan memerlukan akses subsidi" : "Review produktivitas petani setelah menerima bantuan"}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Informasi Petani</th>
                    <th className="px-6 py-4">{activeSubTab === "biodata" ? "Lahan" : "Hasil Panen"}</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {activeSubTab === "biodata" ? (
                    pendingPetani.length > 0 ? (
                      pendingPetani.map(petani => (
                        <tr key={petani.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800">{petani.nama_lengkap}</p>
                            <p className="text-[10px] text-gray-400">NIK: {petani.nik}</p>
                          </td>
                          <td className="px-6 py-4 font-medium">-</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">Menunggu</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 font-bold"
                              onClick={() => handleViewPetaniDetail(petani.user_id)}
                            >
                              Verifikasi Akun
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          Tidak ada data verifikasi biodata pending
                        </td>
                      </tr>
                    )
                  ) : (
                    pendingHasilTani.length > 0 ? (
                      pendingHasilTani.map(hasil => (
                        <tr key={hasil.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800">{hasil.nama_lengkap}</p>
                            {/* NIK Removed */}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-700">{hasil.jumlah_hasil} {hasil.satuan}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">Menunggu</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-amber-600 font-bold"
                              onClick={() => handleViewHasilTaniDetail(hasil.id)}
                            >
                              Periksa Laporan
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          Tidak ada laporan hasil tani pending
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Pending List */}
            {activeSubTab === "biodata" && petaniTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPetaniPage(p => Math.max(1, p - 1))}
                  disabled={petaniPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Halaman {petaniPage} dari {petaniTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPetaniPage(p => Math.min(petaniTotalPages, p + 1))}
                  disabled={petaniPage === petaniTotalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {activeSubTab === "laporan" && hasilTaniTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHasilTaniPage(p => Math.max(1, p - 1))}
                  disabled={hasilTaniPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Halaman {hasilTaniPage} dari {hasilTaniTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHasilTaniPage(p => Math.min(hasilTaniTotalPages, p + 1))}
                  disabled={hasilTaniPage === hasilTaniTotalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* HISTORY SECTION */}
      <Card
        title={activeSubTab === "biodata" ? "Riwayat Verifikasi Biodata" : "Riwayat Verifikasi Laporan"}
        subtitle="Daftar petani yang sudah diverifikasi atau ditolak"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Informasi Petani</th>
                <th className="px-6 py-4">{activeSubTab === "biodata" ? "Lahan" : "Hasil Panen"}</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal Verifikasi</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {activeSubTab === "biodata" ? (
                verifiedPetani.length > 0 ? (
                  verifiedPetani.map(petani => (
                    <tr key={petani.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{petani.nama_lengkap}</p>
                        <p className="text-[10px] text-gray-400">NIK: {petani.nik}</p>
                      </td>
                      <td className="px-6 py-4 font-medium">-</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">Diterima</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {petani.created_at ? new Date(petani.created_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 font-bold"
                          onClick={() => handleViewPetaniDetail(petani.user_id)}
                        >
                          Lihat Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Belum ada riwayat verifikasi biodata
                    </td>
                  </tr>
                )
              ) : (
                verifiedHasilTani.length > 0 ? (
                  verifiedHasilTani.map(hasil => (
                    <tr key={hasil.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{hasil.nama_lengkap}</p>
                        {/* NIK Removed */}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-700">{hasil.jumlah_hasil} {hasil.satuan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">Diterima</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {/* Backend uses created_at as verif date if verified? Or we assume today if verified? 
                            The backend list returns 'created_at'. It does NOT return distinct 'tanggal_verifikasi'.
                            For now, display created_at or nothing. 
                         */}
                        {hasil.created_at ? new Date(hasil.created_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 font-bold"
                          onClick={() => handleViewHasilTaniDetail(hasil.id)}
                        >
                          Lihat Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Belum ada riwayat verifikasi laporan
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}