import type { RiwayatItem } from "@/api/petani";
import { getRiwayat, konfirmasiTerima } from "@/api/petani";
import { ConfirmReceiptModal } from "@/components/petani/ConfirmReceiptModal";
import { SubmissionDetailModal } from "@/components/petani/SubmissionDetailModal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, ChevronRight, Clock, History, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";

interface SubmissionDetail {
    id: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
    jenisPupuk: string;
    jumlah: string;
    status: "dijadwalkan" | "dikirim" | "selesai";
}

interface Props {
    statusVerifikasi: "pending" | "verified" | "rejected";
}

export default function PetaniJadwal({ statusVerifikasi }: Props) {
    const [scheduleList, setScheduleList] = useState<RiwayatItem[]>([]);
    const [historyList, setHistoryList] = useState<RiwayatItem[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<RiwayatItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Detail Modal State
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<SubmissionDetail | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (statusVerifikasi === "verified") {
            fetchSchedule();
        } else {
            setLoading(false);
        }
    }, [statusVerifikasi]);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const data = await getRiwayat();

            // Aktif = semua yang belum selesai
            const active = data.filter(item => item.status !== "selesai");
            const history = data.filter(item => item.status === "selesai");

            setScheduleList(active);
            setHistoryList(history);
        } catch (error) {
            console.error("Gagal mengambil jadwal", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (event: RiwayatItem) => {
        if (event.status === "dikirim") {
            setSelectedEvent(event);
            setIsModalOpen(true);
        }
    };

    const handleConfirmReceipt = async () => {
        if (!selectedEvent) return;

        try {
            await konfirmasiTerima(selectedEvent.id);
            alert("Penerimaan pupuk berhasil dikonfirmasi!");
            setIsModalOpen(false);
            fetchSchedule(); // Refresh list
        } catch (error) {
            console.error("Gagal konfirmasi", error);
            alert("Gagal mengonfirmasi penerimaan.");
        }
    };

    const handleViewDetail = (e: React.MouseEvent, item: RiwayatItem) => {
        e.stopPropagation();

        const dateObj = new Date(item.created_at);

        setDetailData({
            id: `TRX-${item.id}`,
            tanggal: dateObj.toLocaleDateString("id-ID"),
            waktu: dateObj.toLocaleTimeString("id-ID"),
            lokasi: item.lokasi_pengambilan || "Gudang Distribusi Pusat",
            jenisPupuk: item.nama_pupuk,
            jumlah: `${item.jumlah_disetujui || item.jumlah_diminta} Kg`,
            status: item.status === "pending" ? "dijadwalkan" : (item.status as any),
        });
        setIsDetailOpen(true);
    };

    // --- UI: Not Verified State ---
    if (statusVerifikasi !== "verified") {
        return (
            <Card className="border-l-4 border-l-amber-400 bg-amber-50/50">
                <div className="flex gap-4 p-4">
                    <div className="bg-amber-100 p-2 rounded-full h-fit text-amber-600">
                        <AlertCircle size={20} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-amber-900">Jadwal Belum Tersedia</h3>
                        <p className="text-sm text-amber-800/80 leading-relaxed">
                            Akun Anda saat ini sedang dalam proses verifikasi.
                            Jadwal pengambilan pupuk akan otomatis muncul di sini setelah data Anda disetujui oleh Admin.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    // --- UI: Loading State ---
    if (loading) {
        return <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
            <Clock className="animate-spin text-emerald-600" size={32} />
            <p>Memuat jadwal...</p>
        </div>;
    }

    return (
        <div className="space-y-8">
            {/* --- SECTION: Active Schedule (Jadwal Pengambilan) --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Daftar Pengajuan Aktif</h2>
                        <p className="text-sm text-gray-500">Pantau proses persetujuan dan konfirmasi penerimaan pupuk</p>
                    </div>
                </div>

                {scheduleList.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <Package className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-500 font-medium">Belum ada pengajuan aktif.</p>
                        <p className="text-xs text-gray-400">Anda belum melakukan pengajuan pupuk atau semua telah selesai.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {scheduleList.map((item) => {
                            const date = new Date(item.created_at);
                            const dayName = date.toLocaleDateString("id-ID", { weekday: 'long' });
                            const dayDate = date.getDate();
                            const monthYear = date.toLocaleDateString("id-ID", { month: 'short', year: 'numeric' });
                            const time = date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
                            const location = item.lokasi_pengambilan || "Gudang Distribusi Pusat";

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={item.status === "dikirim" ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}
                                >
                                    <Card
                                        className={`group border-none shadow-sm bg-white overflow-hidden transition-all 
                                        ${item.status === "dikirim" ? "cursor-pointer ring-2 ring-emerald-500/20 hover:shadow-md border-emerald-200" : ""}`}
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            <div className="bg-emerald-50 md:w-32 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-emerald-100 text-emerald-700">
                                                <span className="text-[10px] font-bold uppercase">{dayName}</span>
                                                <span className="text-2xl font-black">{dayDate}</span>
                                                <span className="text-[10px] font-medium uppercase text-emerald-600">{monthYear}</span>
                                            </div>

                                            <div className="flex-1 p-5 space-y-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                                            <Clock size={12} />
                                                            <span>{time}</span>
                                                        </div>
                                                        <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-emerald-500" />
                                                            {location}
                                                        </h3>
                                                    </div>

                                                    <Badge status={item.status === "pending" ? "dijadwalkan" : (item.status as any)}>
                                                        {item.status === "dikirim" ? "DIKIRIM" : item.status.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                {item.status === "dikirim" && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit animate-pulse">
                                                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                                                        PUPUK TELAH DIKIRIM - KLIK DISINI UNTUK KONFIRMASI TERIMA
                                                    </div>
                                                )}

                                                <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-gray-100 group-hover:bg-white transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                                            <Package size={18} className="text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase leading-none mb-1">Komoditas</p>
                                                            <p className="text-sm font-bold text-gray-700">{item.nama_pupuk}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-none mb-1">Total</p>
                                                        <p className="text-sm font-black text-emerald-700">
                                                            {item.jumlah_disetujui || item.jumlah_diminta} Kg
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        onClick={(e) => handleViewDetail(e, item)}
                                                        className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline tracking-widest uppercase"
                                                    >
                                                        Lihat Detail <ChevronRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- SECTION: History (Riwayat Distribusi) --- */}
            {historyList.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                            <History size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-700">Riwayat Distribusi</h2>
                            <p className="text-sm text-gray-400">Pengambilan yang telah selesai</p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {historyList.map((item) => {
                            // Fallback for history date
                            const date = new Date(item.created_at);
                            const dateStr = date.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

                            return (
                                <Card key={item.id} className="bg-gray-50 border-gray-100 opacity-80 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-200 p-3 rounded-full text-gray-500">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-700">{item.nama_pupuk}</h4>
                                                <p className="text-xs text-gray-500">{dateStr} • {item.jumlah_disetujui || item.jumlah_diminta} Kg</p>
                                            </div>
                                        </div>
                                        <Badge status="selesai">Selesai</Badge>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {selectedEvent && (
                <ConfirmReceiptModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmReceipt}
                    data={{
                        namaPupuk: selectedEvent.nama_pupuk,
                        jumlah: (selectedEvent.jumlah_disetujui || selectedEvent.jumlah_diminta) + " Kg",
                        lokasi: selectedEvent.lokasi_pengambilan || "Gudang Distribusi Pusat",
                    }}
                />
            )}

            <SubmissionDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                data={detailData}
            />
        </div>
    );
}