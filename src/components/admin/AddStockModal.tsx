import { kurangiStock, tambahStock } from '@/api/admin';
import { Button } from "@/components/ui/Button";
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pupukId: number;
    namaPupuk: string;
    mode: 'tambah' | 'kurangi';
}

export function AddStockModal({ isOpen, onClose, onSuccess, pupukId, namaPupuk, mode }: AddStockModalProps) {
    const [jumlah, setJumlah] = useState<string>("");
    const [satuan, setSatuan] = useState("kg");
    const [catatan, setCatatan] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        const value = parseInt(jumlah);
        if (isNaN(value) || value <= 0) {
            alert("Masukkan jumlah yang valid (lebih dari 0)");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (mode === 'tambah') {
                await tambahStock({
                    pupuk_id: pupukId,
                    jumlah: value,
                    satuan,
                    catatan: catatan || undefined,
                });
                alert('Stok berhasil ditambahkan!');
            } else {
                await kurangiStock({
                    pupuk_id: pupukId,
                    jumlah: value,
                    satuan,
                    catatan: catatan || undefined,
                });
                alert('Stok berhasil dikurangi!');
            }

            setJumlah("");
            setSatuan("kg");
            setCatatan("");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || `Gagal ${mode === 'tambah' ? 'menambah' : 'mengurangi'} stok`);
            console.error(`Error ${mode} stock:`, err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-800">
                    {mode === 'tambah' ? 'Tambah Stok Pupuk' : 'Kurangi Stok Pupuk'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    {mode === 'tambah' ? 'Menambah' : 'Mengurangi'} stok untuk:{" "}
                    <span className="font-semibold text-emerald-600">{namaPupuk}</span>
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jumlah
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="Contoh: 500"
                                value={jumlah}
                                onChange={(e) => setJumlah(e.target.value)}
                                autoFocus
                            />
                            <select
                                className="w-24 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                value={satuan}
                                onChange={(e) => setSatuan(e.target.value)}
                            >
                                <option value="kg">Kg</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none h-20"
                            placeholder="Catatan tambahan..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button
                        className={mode === 'tambah' ? 'bg-emerald-600' : 'bg-red-600 hover:bg-red-700'}
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Perubahan'}
                    </Button>
                </div>
            </div>
        </div>
    );
}