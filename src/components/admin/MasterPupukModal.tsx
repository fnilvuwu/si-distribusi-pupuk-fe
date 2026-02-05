import { addMasterPupuk, updateMasterPupuk, type PupukItem } from "@/api/admin";
import { Button } from "@/components/ui/Button";
import { Package, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    itemToEdit?: PupukItem | null;
}

export function MasterPupukModal({ isOpen, onClose, onSuccess, itemToEdit }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_pupuk: "",
        satuan: "Kg",
        deskripsi: "",
    });

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                nama_pupuk: itemToEdit.nama_pupuk,
                satuan: itemToEdit.satuan || "Kg",
                deskripsi: itemToEdit.deskripsi || "",
            });
        } else {
            setFormData({
                nama_pupuk: "",
                satuan: "Kg",
                deskripsi: "",
            });
        }
    }, [itemToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (itemToEdit) {
                await updateMasterPupuk(itemToEdit.id, formData);
                alert("Data pupuk berhasil diperbarui!");
            } else {
                await addMasterPupuk(formData);
                alert("Data pupuk berhasil ditambahkan!");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan data pupuk.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                            <Package size={20} />
                        </div>
                        {itemToEdit ? "Edit Data Pupuk" : "Tambah Pupuk Baru"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nama Pupuk</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Contoh: Urea, NPK"
                            value={formData.nama_pupuk}
                            onChange={(e) => setFormData({ ...formData, nama_pupuk: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Satuan</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            value={formData.satuan}
                            onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                        >
                            <option value="Kg">Kilogram (Kg)</option>
                            <option value="L">Liter (L)</option>
                            <option value="Karung">Karung</option>
                            <option value="Botol">Botol</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Deskripsi (Opsional)</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
                            placeholder="Tambahkan deskripsi singkat..."
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" icon={Save}>
                            {loading ? "Menyimpan..." : "Simpan Data"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
