import {
    Calendar,
    MapPin,
    Scale,
    Sprout,
    X
} from "lucide-react";
import { useState } from "react";

interface LaporanData {
    tanggalPanen: string;
    jenisKomoditas: string;
    totalHasil: number;
    lokasi: string;
}

interface AddLaporanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: LaporanData) => void;
}

export default function AddLaporanModal({
    isOpen,
    onClose,
    onSave,
}: AddLaporanModalProps) {
    // Initialize with fixed commodity
    const initializeFormData = () => ({
        tanggalPanen: "",
        jenisKomoditas: "Padi (Beras)",
        totalHasil: 0,
        lokasi: "",
    });

    const [formData, setFormData] = useState<LaporanData>(initializeFormData());

    if (!isOpen) return null;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "totalHasil" ? Number(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);

        // reset
        setFormData(initializeFormData());
        onClose();
    };

    return (
        // ONE unified container: backdrop + modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-emerald-900">
                        Laporan Hasil Panen Baru
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Tanggal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                    <Calendar size={14} /> Tanggal Panen{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="tanggalPanen"
                                    value={formData.tanggalPanen}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full text-sm rounded-md border-gray-300 border p-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Komoditas & Jumlah */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                    <Sprout size={14} /> Jenis Tanaman
                                </label>
                                <div className="w-full text-sm rounded-md border-gray-300 border p-2 bg-gray-100 text-gray-700 flex items-center">
                                    Padi (Beras)
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                    <Scale size={14} /> Total Hasil Panen (Kg){" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="totalHasil"
                                    placeholder="Contoh: 500"
                                    value={formData.totalHasil || ""}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full text-sm rounded-md border-gray-300 border p-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                                <MapPin size={14} /> Lokasi Panen{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lokasi"
                                placeholder="Contoh: Sawah Blok B, Desa Tawalian"
                                value={formData.lokasi}
                                onChange={handleInputChange}
                                required
                                className="w-full text-sm rounded-md border-gray-300 border p-2 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded"
                            >
                                Kirim Hasil Tani
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}