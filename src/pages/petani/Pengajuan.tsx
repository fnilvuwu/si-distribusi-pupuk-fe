import type { RiwayatItem } from "@/api/petani";
import { ajukanPupuk, getRiwayat } from "@/api/petani";
import { AddPengajuanModal } from "@/components/petani/AddPengajuanModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, Clock, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  statusVerifikasi: "pending" | "verified" | "rejected";
}

export default function PetaniPengajuan({ statusVerifikasi }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<RiwayatItem[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchRiwayat = async () => {
    try {
      setFetchLoading(true);
      const data = await getRiwayat();
      // Sort desc by ID or Date
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setSubmissions(sorted);
    } catch (error) {
      console.error("Gagal mengambil riwayat:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (statusVerifikasi === "verified") {
      fetchRiwayat();
    }
  }, [statusVerifikasi]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const payload = {
        jenis_pupuk: formData.get("jenisPupuk") as string,
        jumlah_kg: Number(formData.get("jumlah")),
        alasan_pengajuan: formData.get("alasan") as string,
        lokasi_penggunaan: formData.get("lokasi") as string,
        dokumen_pendukung: formData.get("dokumen") as File | undefined,
      };

      await ajukanPupuk(payload);

      await fetchRiwayat();
      handleModalClose();

      alert("Pengajuan berhasil dikirim!");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert(error.response?.data?.detail || "Terjadi kesalahan saat mengirim pengajuan");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selesai":
      case "dikirim":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "selesai":
      case "dikirim":
        return <CheckCircle2 size={16} />;
      case "pending":
        return <Clock size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const mapStatusLabel = (status: string) => {
    if (status === 'pending') return 'Diproses';
    if (status === 'dikirim') return 'Dikirim';
    if (status === 'selesai') return 'Selesai';
    return status;
  }

  // --- State: Not Verified ---
  if (statusVerifikasi !== "verified") {
    return (
      <Card className="max-w-2xl mx-auto border-gray-200 shadow-sm">
        <div className="p-10 text-center flex flex-col items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800">Akun Belum Terverifikasi</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Fitur pengajuan bantuan hanya tersedia untuk akun yang sudah diverifikasi oleh petugas.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // --- State: Verified - Submission History ---
  return (
    <div className="space-y-6 w-full max-w-none mx-auto">
      {/* Header with Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Pengajuan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau semua pengajuan bantuan pupuk Anda</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-md flex items-center gap-2 font-semibold"
        >
          <PlusCircle size={18} />
          Buat Pengajuan Baru
        </Button>
      </div>

      {/* Submissions Table/List */}
      <Card className="border-gray-200 shadow-sm overflow-hidden w-full">
        {fetchLoading ? (
          <div className="p-10 text-center">Memuat riwayat...</div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-full text-gray-400">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-800">Belum Ada Pengajuan</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Anda belum membuat pengajuan bantuan pupuk. Klik tombol di atas untuk memulai.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">No. Pengajuan</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Jenis Pupuk</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Jumlah</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Lokasi / Keterangan</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                {/* <th className="px-6 py-4 text-left font-semibold text-gray-700">Aksi</th> */}
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr key={submission.id} className={index !== submissions.length - 1 ? "border-b" : ""}>
                  <td className="px-6 py-4 font-medium text-gray-900">#{submission.id}</td>
                  <td className="px-6 py-4 text-gray-600">{submission.nama_pupuk}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {submission.jumlah_disetujui || submission.jumlah_diminta} Kg
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    - {/* Lokasi not in RiwayatItem yet, maybe add later */}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{new Date(submission.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {mapStatusLabel(submission.status)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal */}
      <AddPengajuanModal isOpen={isModalOpen} onClose={handleModalClose} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}