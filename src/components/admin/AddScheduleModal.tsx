import { createJadwalDistribusi, type CreateJadwalDistribusiRequest } from "@/api/admin";
import { Button } from "@/components/ui/Button";
import { Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";

/* ================== TYPES ================== */

interface ScheduleItem {
  pupuk_id: number;
  jumlah: number;
  satuan: string;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// Hardcoded fertilizer list based on system data
const FERTILIZERS = [
  { id: 1, nama: "Urea" },
  { id: 2, nama: "TSP (Triple Super Phosphate)" },
  { id: 3, nama: "KCl (Potassium Chloride)" },
  { id: 4, nama: "NPK 16:16:16" },
  { id: 5, nama: "Pupuk Organik Kompos" },
  { id: 6, nama: "Dolomit" },
];

/* ================== COMPONENT ================== */

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSave,
}: AddScheduleModalProps) {
  const [formData, setFormData] = useState({
    nama_acara: "",
    tanggal: "",
    lokasi: "",
    items: [{ pupuk_id: 1, jumlah: 0, satuan: "kg" }] as ScheduleItem[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { pupuk_id: 1, jumlah: 0, satuan: "kg" }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.nama_acara || !formData.tanggal || !formData.lokasi) {
      alert("Mohon lengkapi semua data utama.");
      return;
    }

    // Validate items
    const hasInvalidItems = formData.items.some(item => item.jumlah <= 0 || !item.satuan);
    if (hasInvalidItems) {
      alert("Mohon pastikan semua item pupuk memiliki jumlah lebih dari 0 dan satuan yang valid.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await createJadwalDistribusi(formData as CreateJadwalDistribusiRequest);

      // Reset form
      setFormData({
        nama_acara: "",
        tanggal: "",
        lokasi: "",
        items: [{ pupuk_id: 1, jumlah: 0, satuan: "kg" }],
      });

      alert("Jadwal distribusi berhasil dibuat!");
      onSave();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal membuat jadwal distribusi";
      setError(errorMessage);
      console.error("Error creating jadwal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
            Buat Distribusi Pupuk
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
              Nama Acara
            </label>
            <input
              className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:border-emerald-500 font-bold text-sm"
              placeholder="e.g. Pembagian Kelompok Tani B"
              value={formData.nama_acara}
              onChange={(e) =>
                setFormData({ ...formData, nama_acara: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Tanggal
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none font-bold text-sm"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Lokasi
              </label>
              <input
                className="w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none font-bold text-sm"
                placeholder="Balai Desa / Gudang"
                value={formData.lokasi}
                onChange={(e) =>
                  setFormData({ ...formData, lokasi: e.target.value })
                }
              />
            </div>
          </div>

          {/* Dynamic Items */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Detail Pupuk
              </label>
              <button
                onClick={handleAddItem}
                className="text-[10px] font-black text-emerald-600 hover:underline"
              >
                + TAMBAH PUPUK
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <select
                  className="w-48 px-3 py-2 bg-gray-50 border rounded-lg text-xs font-bold outline-none"
                  value={item.pupuk_id}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].pupuk_id = parseInt(e.target.value);
                    setFormData({ ...formData, items: newItems });
                  }}
                >
                  {FERTILIZERS.map((fert) => (
                    <option key={fert.id} value={fert.id}>
                      {fert.nama}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Jumlah (kg)"
                  className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-xs font-bold outline-none"
                  value={item.jumlah || ''}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].jumlah = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, items: newItems });
                  }}
                />

                <div className="w-16 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 flex items-center justify-center">
                  kg
                </div>

                {formData.items.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          <Button variant="secondary" className="flex-1 font-bold" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="primary" className="flex-1 font-black" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Jadwal"}
          </Button>
        </div>
      </div>
    </div>
  );
}
