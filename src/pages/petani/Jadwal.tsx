import type { RiwayatItem } from "@/api/petani";
import { getRiwayat, konfirmasiTerima } from "@/api/petani";
import { ConfirmReceiptModal } from "@/components/petani/ConfirmReceiptModal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AlertCircle, Clock, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
    statusVerifikasi: "pending" | "verified" | "rejected";
}

export default function PetaniJadwal({ statusVerifikasi }: Props) {
    const [scheduleList, setScheduleList] = useState<RiwayatItem[]>([]);
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
            // Filter only items that are scheduled (dikirim) or completed? 
            // Usually "Jadwal" implies upcoming or active. 
            // Let's show 'dikirim' mainly, maybe 'selesai' as history if needed.
            // For now, filtering for 'dikirim' + 'selesai' to show full schedule history, 
            // or maybe just 'dikirim' as "Active Schedule".
            // The previous dummy data only had 'dikirim'. Let's include 'dikirim' and 'selesai'.
            const relevantItems = data.filter(item => item.status === "dikirim" || item.status === "selesai");
            setScheduleList(relevantItems);
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
                <div className="flex gap-4 p-2">
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
        return <div className="p-8 text-center text-gray-500">Memuat jadwal...</div>;
    }

    // --- UI: Empty State ---
    if (scheduleList.length === 0) {
        return (
            <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">Belum ada jadwal pengambilan pupuk.</p>
                <p className="text-sm text-gray-400 mt-1">Ajukan permohonan pupuk terlebih dahulu.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Jadwal Pengambilan</h2>

            {scheduleList.map((item) => {
                const date = new Date(item.created_at); // Assuming created_at is relevant date, or should we use another field if available? API only gives created_at.
                // For 'dikirim', ideally there is a 'delivery_date', but it's not in RiwayatItem. 
                // usage of created_at as fallback.
                const dayName = date.toLocaleDateString("id-ID", { weekday: 'long' });
                const dayDate = date.getDate(); // e.g. 20
                const monthYear = date.toLocaleDateString("id-ID", { month: 'short', year: '2-digit' }); // Nov 26
                const time = date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WITA"; // Mocking WITA timezone if needed or use local

                return (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={item.status === "dikirim" ? "cursor-pointer" : ""}
                    >
                        <Card
                            className={`group transition-all overflow-hidden ${item.status === "dikirim"
                                ? "border-blue-200 ring-2 ring-blue-500/10"
                                : ""
                                }`}
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Date Block */}
                                <div className="bg-emerald-50 md:w-32 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-emerald-100">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase">{dayName}</span>
                                    <span className="text-2xl font-black text-emerald-800">{dayDate}</span>
                                    <span className="text-[10px] font-medium text-emerald-600 uppercase">{monthYear}</span>
                                </div>

                                <div className="flex-1 p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                                                <Clock size={12} /> <span>{time}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm md:text-base">
                                                <MapPin size={14} className="text-emerald-500" />
                                                Gudang Distribusi {/* Placeholder location */}
                                            </h3>
                                        </div>
                                        <Badge status={item.status}>{item.status}</Badge>
                                    </div>

                                    {/* Status Specific Hint */}
                                    {item.status === "dikirim" && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit animate-pulse">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                            PUPUK TELAH DIKIRIM - KLIK DISINI UNTUK KONFIRMASI TERIMA
                                        </div>
                                    )}

                                    {/* Package Summary */}
                                    <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-emerald-600" />
                                            <span className="text-sm font-bold text-gray-700">{item.nama_pupuk}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-400 block">Jml. Disetujui</span>
                                            <span className="text-sm font-black text-emerald-700">{item.jumlah_disetujui || item.jumlah_diminta} Kg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                );
            })}

            {/* The Confirmation Modal */}
            {/* Note: ConfirmReceiptModal logic might need update if it expects 'EventItem', let's check input prop type */}
            {selectedEvent && (
                <ConfirmReceiptModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmReceipt}
                    data={{
                        namaPupuk: selectedEvent.nama_pupuk,
                        jumlah: (selectedEvent.jumlah_disetujui || selectedEvent.jumlah_diminta) + " Kg",
                        lokasi: "Gudang Distribusi", // Mock
                    }}
                />
            )}
        </div>
    );
}