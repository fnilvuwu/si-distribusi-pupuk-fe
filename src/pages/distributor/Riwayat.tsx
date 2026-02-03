import {
    getJadwalDetail,
    getRiwayatDistribusi
} from "@/api/distributor";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, ChevronRight, MapPin, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Tipe data untuk UI
type ReceiptItem = {
    id: number;
    permohonan_id: number;
    name: string;
    nik: string;
    itemType: string;
    amount: number;
    satuan: string;
    timestamp: string;
};

type DistributionEvent = {
    jadwal_id: number;
    permohonan_id: number;
    eventName: string;
    date: string;
    month: string;
    day: string;
    year: string;
    location: string;
    totalFarmers: number;
    totalWeight: string;
    status: "completed";
    penerima: ReceiptItem[];
};

export default function DistributorRiwayat() {
    const [selectedEvent, setSelectedEvent] = useState<DistributionEvent | null>(null);
    const [historyData, setHistoryData] = useState<DistributionEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        lokasi: ''
    });

    const fetchRiwayatDistribusi = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = {
                status: 'selesai',
                ...(filters.startDate && { start_date: filters.startDate }),
                ...(filters.endDate && { end_date: filters.endDate }),
                ...(filters.lokasi && { lokasi: filters.lokasi })
            };

            const data = await getRiwayatDistribusi(params);

            // Transform API data to UI format
            const transformedData: DistributionEvent[] = data.map(item => {
                const eventDate = new Date(item.tanggal_pengiriman);
                return {
                    jadwal_id: item.jadwal_id,
                    permohonan_id: item.permohonan_id,
                    eventName: `Distribusi - ${item.lokasi}`,
                    date: eventDate.getDate().toString().padStart(2, '0'),
                    month: eventDate.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase(),
                    day: eventDate.toLocaleDateString('id-ID', { weekday: 'long' }),
                    year: eventDate.getFullYear().toString(),
                    location: item.lokasi,
                    totalFarmers: item.total_penerima_terverifikasi,
                    totalWeight: item.total_volume
                        ? `${item.total_volume >= 1000 ? (item.total_volume / 1000).toFixed(2) + ' Ton' : item.total_volume + ' kg'}`
                        : '-',
                    status: "completed",
                    penerima: []
                };
            });

            setHistoryData(transformedData);
        } catch (err: unknown) {
            console.error('Failed to fetch riwayat distribusi:', err);
            const errorMessage = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : null;
            setError(errorMessage || 'Gagal memuat riwayat distribusi');
        } finally {
            setIsLoading(false);
        }
    }, [filters.startDate, filters.endDate, filters.lokasi]);

    useEffect(() => {
        fetchRiwayatDistribusi();
    }, [fetchRiwayatDistribusi]);

    const fetchEventDetail = async (jadwalId: number) => {
        try {
            setIsLoadingDetail(true);
            const detail = await getJadwalDetail(jadwalId);

            // Transform penerima to ReceiptItem
            const penerima: ReceiptItem[] = detail.penerima_list
                .filter(p => p.status_distribusi === 'selesai')
                .map(p => ({
                    id: p.id,
                    permohonan_id: p.permohonan_id,
                    name: p.nama_petani,
                    nik: p.nik,
                    itemType: p.jenis_pupuk,
                    amount: p.jumlah_disetujui,
                    satuan: p.satuan,
                    timestamp: 'Selesai'
                }));

            // Calculate total weight from penerima
            const totalKg = penerima.reduce((sum, p) => sum + p.amount, 0);
            const totalWeight = totalKg >= 1000
                ? `${(totalKg / 1000).toFixed(2)} Ton`
                : `${totalKg} kg`;

            // Update selected event with penerima data and actual counts
            setSelectedEvent(prev => prev ? {
                ...prev,
                penerima,
                totalFarmers: penerima.length,
                totalWeight
            } : null);

            // Also update the history data with correct counts
            setHistoryData(prev => prev.map(event =>
                event.jadwal_id === jadwalId
                    ? { ...event, totalFarmers: penerima.length, totalWeight }
                    : event
            ));
        } catch (err: unknown) {
            console.error(`Failed to fetch event detail for jadwal ${jadwalId}:`, err);
            const errorMessage = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : null;
            setError(errorMessage || 'Gagal memuat detail riwayat');
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleEventClick = (event: DistributionEvent) => {
        setSelectedEvent(event);
        if (event.penerima.length === 0) {
            fetchEventDetail(event.jadwal_id);
        }
    };

    const handleApplyFilters = () => {
        fetchRiwayatDistribusi();
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-xl font-bold text-gray-800">Arsip Distribusi</h2>
                <p className="text-sm text-gray-500">Laporan penyaluran pupuk subsidi yang telah selesai</p>
            </header>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Tanggal Akhir</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Lokasi</label>
                        <input
                            type="text"
                            value={filters.lokasi}
                            onChange={(e) => setFilters(prev => ({ ...prev, lokasi: e.target.value }))}
                            placeholder="Cari lokasi..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleApplyFilters}
                            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            </Card>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Memuat riwayat distribusi...</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {historyData.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto mb-4 text-gray-300" size={48} />
                            <p className="text-gray-400 text-sm">Belum ada riwayat distribusi</p>
                        </div>
                    ) : (
                        historyData.map((event) => (
                            <div
                                key={event.jadwal_id}
                                onClick={() => handleEventClick(event)}
                                className="cursor-pointer group active:scale-[0.99] transition-all"
                            >
                                <Card className="p-0 border-gray-200 group-hover:border-emerald-500 transition-colors shadow-sm overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Date Block */}
                                        <div className="bg-emerald-600 md:w-28 p-4 flex flex-col items-center justify-center text-white">
                                            <span className="text-xs font-bold opacity-80 uppercase">{event.day}</span>
                                            <span className="text-3xl font-black">{event.date}</span>
                                            <span className="text-xs font-bold opacity-80 uppercase">{event.month} '{event.year.slice(-2)}</span>
                                        </div>

                                        {/* Event Body */}
                                        <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-gray-900 text-lg leading-none">{event.eventName}</h3>
                                                    <Badge status="selesai">Selesai</Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-y-1 gap-x-4">
                                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                        <MapPin size={14} className="text-emerald-500" />
                                                        {event.location}
                                                    </div>
                                                    {event.totalWeight !== '-' && (
                                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                            <Package size={14} className="text-emerald-500" />
                                                            <strong>{event.totalWeight}</strong>
                                                        </div>
                                                    )}
                                                    {event.totalFarmers > 0 && (
                                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                                            <strong>{event.totalFarmers}</strong> Petani
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                                                <div className="bg-gray-100 p-2 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal Detail Realistis */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Detail Manifest Distribusi</p>
                                <h3 className="text-xl font-bold text-gray-900">{selectedEvent.eventName}</h3>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <div>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Total Penyaluran</p>
                                    <p className="text-lg font-black text-emerald-900">{selectedEvent.totalWeight}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Lokasi</p>
                                    <p className="text-sm font-bold text-emerald-900">{selectedEvent.location}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Total Petani</p>
                                    <p className="text-lg font-black text-emerald-900">{selectedEvent.totalFarmers}</p>
                                </div>
                            </div>

                            {isLoadingDetail ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                </div>
                            ) : selectedEvent.penerima.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p>Tidak ada data penerima</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        Daftar Verifikasi Petani ({selectedEvent.penerima.length})
                                    </h4>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {selectedEvent.penerima.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm text-gray-800 leading-none">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400">NIK: {p.nik}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-emerald-700">{p.amount} {p.satuan} {p.itemType}</p>
                                                    <p className="text-[10px] text-gray-400 italic">✓ {p.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t flex gap-3">
                            <button
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                                onClick={() => setSelectedEvent(null)}
                            >
                                Tutup
                            </button>
                            <button className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                                Download Berita Acara (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}