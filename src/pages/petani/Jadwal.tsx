import type { RiwayatItem } from "@/api/petani";
import { getRiwayat, konfirmasiTerima } from "@/api/petani";
import { ConfirmReceiptModal } from "@/components/petani/ConfirmReceiptModal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, Clock, History, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
    statusVerifikasi: "pending" | "verified" | "rejected";
}

export default function PetaniJadwal({ statusVerifikasi }: Props) {
    const [scheduleList, setScheduleList] = useState<RiwayatItem[]>([]);
    const [historyList, setHistoryList] = useState<RiwayatItem[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<RiwayatItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

            // Separate Active Schedule (Dikirim) from History (Selesai)
            // 'pending' usually goes to Pengajuan page, but if it has a schedule it might be here? 
            // Assuming 'dikirim' implies scheduled/ready to pickup.
            const active = data.filter(item => item.status === "dikirim");
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
                        <h2 className="text-xl font-bold text-gray-800">Jadwal Pengambilan</h2>
                        <p className="text-sm text-gray-500">Konfirmasi penerimaan saat pupuk diambil</p>
                    </div>
                </div>

                {scheduleList.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-500 font-medium">Tidak ada jadwal aktif.</p>
                        <p className="text-xs text-gray-400">Jadwal akan muncul setelah pengajuan disetujui dan diatur admin.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {scheduleList.map((item) => {
                            // MOCK DATA GENERATION if fields are missing
                            // In real app, `waktu_pengambilan` would come from backend
                            const date = new Date(item.waktu_pengambilan || item.created_at);
                            const dayName = date.toLocaleDateString("id-ID", { weekday: 'long' });
                            const dayDate = date.getDate();
                            const monthYear = date.toLocaleDateString("id-ID", { month: 'short', year: '2-digit' });
                            const time = date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WITA";
                            const location = item.lokasi_pengambilan || "Gudang Distribusi Pusat";

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className="cursor-pointer group"
                                >
                                    <Card className="hover:shadow-lg transition-all border-emerald-100 ring-1 ring-emerald-500/20 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-3">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                            </span>
                                        </div>

                                        <div className="flex flex-col md:flex-row">
                                            {/* Date Block */}
                                            <div className="bg-emerald-50 md:w-32 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 group-hover:text-emerald-100">{dayName}</span>
                                                <span className="text-3xl font-black">{dayDate}</span>
                                                <span className="text-[10px] font-medium uppercase opacity-70 group-hover:text-emerald-100">{monthYear}</span>
                                            </div>

                                            <div className="flex-1 p-5 space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-50 w-fit px-3 py-1 rounded-full text-xs">
                                                        <Clock size={14} /> <span>{time}</span>
                                                    </div>

                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                            {item.nama_pupuk}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                                                            <MapPin size={14} className="text-gray-400" />
                                                            {location}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <Package size={16} className="text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600">Jumlah pengambilan:</span>
                                                    </div>
                                                    <span className="text-lg font-black text-emerald-700">{item.jumlah_disetujui || item.jumlah_diminta} Kg</span>
                                                </div>

                                                <div className="w-full bg-emerald-600 text-white text-center py-2 rounded-lg font-bold text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                    KLIK UNTUK KONFIRMASI DITERIMA
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

            {/* --- SECTION: History (Riwayat Selesai) --- */}
            {historyList.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                            <History size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-700">Riwayat Selesai</h2>
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
        </div>
    );
}