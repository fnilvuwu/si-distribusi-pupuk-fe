import { deleteMasterPupuk, getMasterPupukList, getRiwayatStock, type PupukItem, type RiwayatStock } from '@/api/admin';
import { AddStockModal } from "@/components/admin/AddStockModal";
import { MasterPupukModal } from "@/components/admin/MasterPupukModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Edit, Loader2, MinusCircle, Package, PlusCircle, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Use PupukItem directly or extend
interface StokPupukDisplay extends PupukItem {
    jumlah_stok: number;
}

export default function AdminStok() {
    // State untuk Modal Stock
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedStockItem, setSelectedStockItem] = useState<{ id: number, nama: string } | null>(null);
    const [stockModalMode, setStockModalMode] = useState<'tambah' | 'kurangi'>('tambah');

    // State untuk Modal Master Pupuk
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<PupukItem | null>(null);

    // Data State
    const [allRiwayatStock, setAllRiwayatStock] = useState<RiwayatStock[]>([]);
    const [masterPupuk, setMasterPupuk] = useState<PupukItem[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<number | null>(null);

    // Derived state: Combined Master Data with calculated stock
    const stokPupuk: StokPupukDisplay[] = masterPupuk.map(pupuk => {
        // Calculate stock from history for this pupuk
        const total = allRiwayatStock
            .filter(r => r.pupuk_id === pupuk.id)
            .reduce((acc, item) => {
                return item.tipe === 'tambah' ? acc + item.jumlah : acc - item.jumlah;
            }, 0);

        return {
            ...pupuk,
            jumlah_stok: total
        };
    });

    // Filtered history for display in table
    const filteredRiwayatStock = historyFilter
        ? allRiwayatStock.filter(item => item.pupuk_id === historyFilter)
        : allRiwayatStock;

    // Load data
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [historyData, masterData] = await Promise.all([
                getRiwayatStock({ page: 1, page_size: 100 }),
                getMasterPupukList()
            ]);

            setAllRiwayatStock(historyData);
            setMasterPupuk(masterData);

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

    // Handlers
    const openStockModal = (id: number, nama: string, mode: 'tambah' | 'kurangi') => {
        setSelectedStockItem({ id, nama });
        setStockModalMode(mode);
        setIsStockModalOpen(true);
    };

    const openAddMasterModal = () => {
        setItemToEdit(null);
        setIsMasterModalOpen(true);
    };

    const openEditMasterModal = (item: PupukItem) => {
        setItemToEdit(item);
        setIsMasterModalOpen(true);
    };

    const handleDeleteMaster = async (id: number, nama: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data pupuk "${nama}"? Data akan hilang permanen.`)) {
            try {
                await deleteMasterPupuk(id);
                alert("Pupuk berhasil dihapus");
                loadData();
            } catch (e) {
                console.error(e);
                alert("Gagal menghapus pupuk. Pastikan tidak ada stok atau riwayat terkait.");
            }
        }
    };

    return (
        <div className="space-y-8">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Manajemen Pupuk & Stok</h1>
                    <p className="text-gray-500 text-sm">Kelola jenis pupuk dan pembaruan stok gudang</p>
                </div>
                <Button onClick={openAddMasterModal} icon={PlusCircle} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Pupuk Baru
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : masterPupuk.length === 0 ? (
                <div className="py-12 text-center text-gray-400 border-2 border-dashed rounded-xl">
                    Belum ada data pupuk. Tambahkan pupuk baru untuk memulai.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stokPupuk.sort((a, b) => a.nama_pupuk.localeCompare(b.nama_pupuk)).map(item => {
                        const limit = 2000; // Default limit
                        const persentase = Math.min((item.jumlah_stok / limit) * 100, 100);
                        const isLow = item.jumlah_stok < 500;
                        const badgeStatus = isLow ? "pending" : "selesai";

                        return (
                            <Card key={item.id} className="p-0 overflow-hidden border-none shadow-md group relative">
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditMasterModal(item)}
                                        className="p-1.5 bg-white text-gray-400 hover:text-blue-500 rounded shadow-sm border"
                                        title="Edit Data Pupuk"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMaster(item.id, item.nama_pupuk)}
                                        className="p-1.5 bg-white text-gray-400 hover:text-red-500 rounded shadow-sm border"
                                        title="Hapus Pupuk"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                                            <Package size={18} />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-800">{item.nama_pupuk}</h3>
                                    </div>

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
                                        onClick={() => openStockModal(item.id, item.nama_pupuk, 'kurangi')}
                                    >
                                        Kurangi Stok
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1 text-xs py-1"
                                        icon={PlusCircle}
                                        onClick={() => openStockModal(item.id, item.nama_pupuk, 'tambah')}
                                    >
                                        Tambah Stok
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
                        {masterPupuk.map(item => (
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

            {/* Render Stock Modal */}
            {selectedStockItem && (
                <AddStockModal
                    isOpen={isStockModalOpen}
                    onClose={() => setIsStockModalOpen(false)}
                    onSuccess={loadData}
                    pupukId={selectedStockItem.id}
                    namaPupuk={selectedStockItem.nama}
                    mode={stockModalMode}
                />
            )}

            {/* Render Master Pupuk Modal */}
            <MasterPupukModal
                isOpen={isMasterModalOpen}
                onClose={() => setIsMasterModalOpen(false)}
                onSuccess={loadData}
                itemToEdit={itemToEdit}
            />
        </div>
    );
}