import type { Pupuk as PupukType } from "@/api/petani";
import { getPupukList } from "@/api/petani";
import { Button } from "@/components/ui/Button";
import { AlertCircle, CheckCircle, ClipboardList, FileText, Info, MapPin, PlusCircle, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface AddPengajuanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    loading?: boolean;
}

export function AddPengajuanModal({ isOpen, onClose, onSubmit, loading }: AddPengajuanModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        jenisPupuk: "",
        jumlah: "",
        lokasi: "",
        alasan: "",
    });

    // Fertilizer Options State
    const [pupukOptions, setPupukOptions] = useState<PupukType[]>([]);

    useEffect(() => {
        if (isOpen) {
            getPupukList().then(setPupukOptions).catch(console.error);
        }
    }, [isOpen]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append("jenisPupuk", formData.jenisPupuk);
        form.append("jumlah", formData.jumlah);
        form.append("lokasi", formData.lokasi);
        form.append("alasan", formData.alasan);

        if (selectedFile) {
            form.append("dokumen", selectedFile);
        }

        onSubmit(form);
    };

    const handleClose = () => {
        setFormData({ jenisPupuk: "", jumlah: "", lokasi: "", alasan: "" });
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">Formulir Pengajuan Bantuan</h3>
                        <p className="text-xs text-gray-500 mt-1">Lengkapi data di bawah untuk diproses oleh tim distribusi.</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="overflow-y-auto flex-1 p-6">
                    <form className="space-y-6" onSubmit={handleFormSubmit}>
                        {/* Help Notice */}
                        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-lg flex gap-3 items-center">
                            <Info className="shrink-0" size={16} />
                            <p>
                                Tanda <span className="text-red-500 font-bold">*</span> wajib diisi.
                                Unggah dokumen hanya jika Anda memiliki berkas pendukung.
                            </p>
                        </div>

                        {/* Section 1: Detail Pupuk */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <ClipboardList size={16} className="text-emerald-600" />
                                <h3>Informasi Pupuk</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600">
                                        Jenis Pupuk <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="jenisPupuk"
                                        value={formData.jenisPupuk}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full text-sm rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="">Pilih Jenis</option>
                                        {pupukOptions.map((pupuk) => (
                                            <option key={pupuk.id} value={pupuk.nama_pupuk}>
                                                {pupuk.nama_pupuk} (Stok: {pupuk.jumlah_stok} {pupuk.satuan})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600">
                                        Jumlah (Kg) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="jumlah"
                                        value={formData.jumlah}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="0"
                                        className="w-full text-sm rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Lokasi */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <MapPin size={16} className="text-emerald-600" />
                                <h3>Lokasi Lahan</h3>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600">
                                    Lokasi Penggunaan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleInputChange}
                                    required
                                    rows={2}
                                    placeholder="Contoh: Sawah Blok B Desa Sukamaju"
                                    className="w-full text-sm rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Section 3: Alasan Pengajuan */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <AlertCircle size={16} className="text-emerald-600" />
                                <h3>Alasan Pengajuan</h3>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600">
                                    Jelaskan alasan Anda mengajukan bantuan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="alasan"
                                    value={formData.alasan}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    placeholder="Contoh: Stok pupuk di kelompok tani habis dan musim tanam sudah dimulai..."
                                    className="w-full text-sm rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <p className="text-[10px] text-gray-400">
                                    Alasan ini akan menjadi bahan pertimbangan utama dalam proses verifikasi.
                                </p>
                            </div>
                        </div>

                        {/* Section 4: Dokumen (Optional) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Upload size={16} className="text-emerald-600" />
                                    <h3>Dokumen Pendukung</h3>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                    Opsional
                                </span>
                            </div>

                            <input
                                type="file"
                                id="file-upload-modal"
                                className="hidden"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                accept="image/png, image/jpeg, application/pdf"
                            />

                            {!selectedFile ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors group hover:border-emerald-400">
                                    <label htmlFor="file-upload-modal" className="cursor-pointer flex flex-col items-center gap-1">
                                        <div className="bg-gray-100 p-2 rounded-full text-gray-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium mt-1">Klik untuk pilih file</span>
                                        <span className="text-[10px] text-gray-400">JPG, PNG, PDF (Maks. 5MB)</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-3 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium text-gray-700 truncate" title={selectedFile.name}>
                                                {selectedFile.name}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                {formatFileSize(selectedFile.size)} •{" "}
                                                <span className="text-emerald-600 flex items-center gap-0.5">
                                                    <CheckCircle size={12} /> Siap diunggah
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-md transition-colors shrink-0"
                                        title="Hapus file"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 border-gray-200 text-gray-600 py-3 rounded-md"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={() => handleFormSubmit(new Event('submit') as unknown as React.FormEvent)}
                        disabled={loading || !formData.jenisPupuk || !formData.jumlah || !formData.lokasi || !formData.alasan}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-md flex items-center justify-center gap-2 transition-all font-semibold disabled:opacity-50"
                    >
                        <PlusCircle size={18} />
                        {loading ? "Mengirim..." : "Kirim Pengajuan"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
