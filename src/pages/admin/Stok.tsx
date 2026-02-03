import { getRiwayatStock, type RiwayatStock } from '@/api/admin';
import { AddStockModal } from "@/components/admin/AddStockModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, MinusCircle, PlusCircle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface StokPupuk {
    id: number;
    nama_pupuk: string;
    jumlah_stok: number;
    satuan: string;
}

export default function AdminStok() {
    // State untuk Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ id: number, nama: string } | null>(null);
    const [modalMode, setModalMode] = useState<'tambah' | 'kurangi'>('tambah');

    // Stock History State
    const [allRiwayatStock, setAllRiwayatStock] = useState<RiwayatStock[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<number | null>(null);

    // Derived state: current stock calculated from all history entries
    const stokPupuk: StokPupuk[] = Object.values(
        allRiwayatStock.reduce((acc, item) => {
            if (!acc[item.pupuk_id]) {
                acc[item.pupuk_id] = {
                    id: item.pupuk_id,
                    nama_pupuk: item.nama_pupuk,
                    jumlah_stok: 0,
                    satuan: item.satuan
                };
            }
            // Calculate cumulative stock by adding/subtracting based on tipe
            if (item.tipe === 'tambah') {
                acc[item.pupuk_id].jumlah_stok += item.jumlah;
            } else {
                acc[item.pupuk_id].jumlah_stok -= item.jumlah;
            }
            return acc;
        }, {} as Record<number, StokPupuk>)
    );

    // Filtered history for display in table
    const filteredRiwayatStock = historyFilter
        ? allRiwayatStock.filter(item => item.pupuk_id === historyFilter)
        : allRiwayatStock;

    // Load all stock history data
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getRiwayatStock({
                page: 1,
                page_size: 100 // Get more records to ensure we have complete history
            });
            setAllRiwayatStock(data);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            setError(errorMessage || "Gagal memuat data stok pupuk");
            console.error("Error loading stock data:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Fungsi Trigger Modal
    const openModal = (id: number, nama: string, mode: 'tambah' | 'kurangi') => {
        setSelectedItem({ id, nama });
        setModalMode(mode);
        setIsModalOpen(true);
    };

    // Fungsi Success Callback
    const handleSuccess = () => {
        loadData();
    };

    return (
        <div className="p-6 space-y-6">
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
            <div>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">Manajemen Stok</h1>
                <p className="text-gray-500 text-sm">Kelola stok pupuk di gudang pusat</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : stokPupuk.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                    Belum ada data stok pupuk
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stokPupuk.sort((a, b) => a.nama_pupuk.localeCompare(b.nama_pupuk)).map(item => {
                        const limit = 2000; // Default limit, bisa disesuaikan
                        const persentase = Math.min((item.jumlah_stok / limit) * 100, 100);

                        // Logika Badge menggunakan status dari BadgeProps Anda
                        const isLow = item.jumlah_stok < 500;
                        const badgeStatus = isLow ? "pending" : "selesai";

                        return (
                            <Card key={item.id} className="p-0 overflow-hidden border-none shadow-md">
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-800">{item.nama_pupuk}</h3>
                                    <p className="text-sm text-gray-500">Stok Gudang Pusat</p>

                                    <div className="mt-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-3xl font-bold">{item.jumlah_stok.toLocaleString('id-ID')}</p>
                                            <p className="text-xs text-gray-400">{item.satuan}</p>
                                        </div>
                                        <Badge status={badgeStatus}>
                                            {isLow ? "Stok Rendah" : "Aman"}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-700 ${isLow ? 'bg-yellow-500' : 'bg-emerald-600'}`}
                                            style={{ width: `${persentase}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 border-t flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 text-xs py-1 border-red-200 text-red-600"
                                        icon={MinusCircle}
                                        onClick={() => openModal(item.id, item.nama_pupuk, 'kurangi')}
                                    >
                                        Kurangi
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1 text-xs py-1"
                                        icon={PlusCircle}
                                        onClick={() => openModal(item.id, item.nama_pupuk, 'tambah')}
                                    >
                                        Tambah
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Stock History Section */}
            <Card title="Riwayat Perubahan Stok">
                <div className="p-4 border-b">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={historyFilter === null ? 'primary' : 'secondary'}
                            onClick={() => setHistoryFilter(null)}
                        >
                            Semua
                        </Button>
                        {stokPupuk.map(item => (
                            <Button
                                key={item.id}
                                size="sm"
                                variant={historyFilter === item.id ? 'primary' : 'secondary'}
                                onClick={() => setHistoryFilter(item.id)}
                            >
                                {item.nama_pupuk}
                            </Button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : filteredRiwayatStock.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        Belum ada riwayat perubahan stok
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Pupuk</th>
                                    <th className="px-6 py-4">Tipe</th>
                                    <th className="px-6 py-4">Jumlah</th>
                                    <th className="px-6 py-4">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {filteredRiwayatStock.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800">
                                                {new Date(item.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(item.created_at).toLocaleTimeString('id-ID')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{item.nama_pupuk}</td>
                                        <td className="px-6 py-4">
                                            <Badge status={item.tipe === 'tambah' ? 'selesai' : 'pending'}>
                                                {item.tipe === 'tambah' ? 'Tambah' : 'Kurangi'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${item.tipe === 'tambah' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {item.tipe === 'tambah' ? '+' : '-'}{item.jumlah} {item.satuan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-600">
                                            {item.catatan || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Render Modal */}
            {selectedItem && (
                <AddStockModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                    pupukId={selectedItem.id}
                    namaPupuk={selectedItem.nama}
                    mode={modalMode}
                />
            )}
        </div>
    );
}