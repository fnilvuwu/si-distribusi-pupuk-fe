import {
    getJadwalDetail,
    getJadwalDistribusi,
    updateStatusJadwal,
    verifikasiPenerima
} from "@/api/distributor";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    ChevronDown, ChevronUp,
    MapPin,
    Package,
    Play,
    TrendingUp,
    User
} from 'lucide-react';
import { useCallback, useEffect, useState } from "react";

// --- Helper Functions ---
const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string } } }).response;
        return response?.data?.detail || 'Terjadi kesalahan';
    }
    return 'Terjadi kesalahan';
};

// --- Interfaces ---
interface FarmerTask {
    id: number;
    permohonan_id: number;
    farmer: string;
    nik: string;
    loc: string;
    item: string;
    amount: number;
    satuan: string;
    no_hp: string;
    status: "pending" | "verified" | "rejected";
    verifiedAt?: string;
}

interface DistributionEvent {
    id: number;
    jadwal_id: number;
    eventName: string;
    date: string;
    displayDate: string;
    locationPoint: string;
    farmers: FarmerTask[];
    status: "upcoming" | "ongoing" | "completed";
    startTime?: string;
    endTime?: string;
    totalWeight?: string;
    backend_status: string;
}

export default function DistributorDashboard() {
    const [selectedTask, setSelectedTask] = useState<FarmerTask | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedEvents, setExpandedEvents] = useState<number[]>([]);
    const [events, setEvents] = useState<DistributionEvent[]>([]);
    const [completionSummary, setCompletionSummary] = useState<DistributionEvent | null>(null);

    // File upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const calculateTotalWeight = useCallback((farmers: FarmerTask[]): string => {
        const totalKg = farmers.reduce((sum, f) => sum + f.amount, 0);
        if (totalKg >= 1000) {
            return `${(totalKg / 1000).toFixed(2)} Ton`;
        }
        return `${totalKg} kg`;
    }, []);

    const fetchEventDetail = useCallback(async (jadwalId: number, skipLoadingState = false) => {
        try {
            if (!skipLoadingState) {
                setIsLoadingDetail(true);
            }
            const detail = await getJadwalDetail(jadwalId);

            // Transform penerima to FarmerTask
            const farmers: FarmerTask[] = detail.penerima_list.map(p => ({
                id: p.id,
                permohonan_id: p.permohonan_id,
                farmer: p.nama_petani,
                nik: p.nik,
                loc: '-', // Not provided by API
                item: p.jenis_pupuk,
                amount: p.jumlah_disetujui,
                satuan: p.satuan,
                no_hp: p.no_hp,
                status: (p.status_distribusi === 'selesai' || p.status_distribusi === 'terverifikasi') ? 'verified' : 'pending',
                verifiedAt: p.verified_at
                    ? new Date(p.verified_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    : (p.status_distribusi === 'selesai' || p.status_distribusi === 'terverifikasi') ? 'Terverifikasi' : undefined
            }));

            // Update event with farmers and total weight
            setEvents(prev => prev.map(event =>
                event.jadwal_id === jadwalId
                    ? {
                        ...event,
                        farmers,
                        totalWeight: calculateTotalWeight(farmers)
                    }
                    : event
            ));
        } catch (err: unknown) {
            console.error(`Failed to fetch event detail for jadwal ${jadwalId}:`, err);
            if (!skipLoadingState) {
                setError(getErrorMessage(err) || 'Gagal memuat detail jadwal');
            }
        } finally {
            if (!skipLoadingState) {
                setIsLoadingDetail(false);
            }
        }
    }, [calculateTotalWeight]);

    const fetchJadwalDistribusi = useCallback(async () => {
        try {
            setIsLoadingEvents(true);
            setError(null);
            const data = await getJadwalDistribusi({
                status: undefined // Fetch all: dijadwalkan, dikirim (not selesai)
            });

            // Transform API data to UI format
            const transformedEvents: DistributionEvent[] = data
                .filter(jadwal => jadwal.status !== 'selesai') // Only active events
                .map(jadwal => {
                    const eventDate = new Date(jadwal.tanggal_pengiriman);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const eventDateOnly = new Date(eventDate);
                    eventDateOnly.setHours(0, 0, 0, 0);

                    let uiStatus: "upcoming" | "ongoing" | "completed";
                    if (jadwal.status === 'selesai') {
                        uiStatus = 'completed';
                    } else if (jadwal.status === 'dikirim' || eventDateOnly <= today) {
                        uiStatus = 'ongoing';
                    } else {
                        uiStatus = 'upcoming';
                    }

                    return {
                        id: jadwal.id,
                        jadwal_id: jadwal.id,
                        eventName: `Distribusi - ${jadwal.lokasi}`,
                        date: jadwal.tanggal_pengiriman,
                        displayDate: eventDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                        locationPoint: jadwal.lokasi,
                        farmers: [],
                        status: uiStatus,
                        backend_status: jadwal.status,
                        totalWeight: undefined
                    };
                });

            setEvents(transformedEvents);

            // Fetch details for all active events to get farmers list
            const detailPromises = transformedEvents.map(event =>
                fetchEventDetail(event.jadwal_id, true)
            );
            await Promise.all(detailPromises);

            // Auto-expand first ongoing event
            const firstOngoing = transformedEvents.find(e => e.status === 'ongoing');
            if (firstOngoing) {
                setExpandedEvents([firstOngoing.id]);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch jadwal distribusi:', err);
            setError(getErrorMessage(err) || 'Gagal memuat data jadwal distribusi');
        } finally {
            setIsLoadingEvents(false);
        }
    }, [fetchEventDetail]);

    // Fetch jadwal distribusi on mount
    useEffect(() => {
        fetchJadwalDistribusi();
    }, [fetchJadwalDistribusi]);

    // Filter only active events (upcoming and ongoing)
    const activeEvents = events.filter(e => e.status !== "completed");

    const toggleEvent = (id: number) => {
        setExpandedEvents(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handleStartEvent = async (eventId: number) => {
        try {
            // Call API first
            await updateStatusJadwal(eventId, 'mulai');

            setEvents(prev => prev.map(event =>
                event.id === eventId
                    ? { ...event, status: "ongoing" as const, startTime: new Date().toISOString() }
                    : event
            ));
            setExpandedEvents(prev => [...prev, eventId]);
        } catch (err: unknown) {
            console.error("Failed to start event:", err);
            alert(getErrorMessage(err) || "Gagal memulai event");
        }
    };

    const handleEndEvent = (event: DistributionEvent) => {
        setCompletionSummary({
            ...event,
            endTime: new Date().toISOString()
        });
    };

    const confirmCompleteEvent = async () => {
        if (!completionSummary) return;

        try {
            await updateStatusJadwal(completionSummary.id, 'selesai');

            setEvents(prev => prev.map(event =>
                event.id === completionSummary.id
                    ? { ...event, status: "completed" as const, endTime: completionSummary.endTime }
                    : event
            ));
            setCompletionSummary(null);
            alert("Event berhasil diselesaikan dan dipindahkan ke Riwayat!");

            // Refresh list to update status derived from backend
            fetchJadwalDistribusi();
        } catch (err: unknown) {
            console.error("Failed to complete event:", err);
            alert(getErrorMessage(err) || "Gagal menyelesaikan event. Pastikan semua petani telah diverifikasi/ditolak.");
        }
    };

    const handleSubmitBukti = async () => {
        if (!selectedTask) return;

        setIsSubmitting(true);
        try {
            // Prepare FormData
            const formData = new FormData();
            formData.append('permohonan_id', selectedTask.permohonan_id.toString());
            formData.append('catatan', `Verifikasi distribusi untuk ${selectedTask.farmer}`);

            if (selectedFile) {
                formData.append('bukti_foto', selectedFile);
            }

            // Call API to verify penerima
            await verifikasiPenerima(formData);

            // Update farmer status to verified immediately
            setEvents(prev => prev.map(event => ({
                ...event,
                farmers: event.farmers.map(f =>
                    f.permohonan_id === selectedTask.permohonan_id
                        ? {
                            ...f,
                            status: "verified" as const,
                            verifiedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        }
                        : f
                )
            })));

            setSelectedTask(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            alert('Verifikasi berhasil! Petani telah menerima pupuk.');
        } catch (err: unknown) {
            console.error('Failed to verify penerima:', err);
            alert(getErrorMessage(err) || 'Gagal melakukan verifikasi. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getEventProgress = (event: DistributionEvent) => {
        const verified = event.farmers.filter(f => f.status === "verified").length;
        const total = event.farmers.length;
        const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;
        return { verified, total, percentage };
    };

    const calculateDuration = (startTime?: string, endTime?: string) => {
        if (!startTime) return "-";
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const diff = end.getTime() - start.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}j ${minutes}m`;
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-xl font-bold text-gray-800">Distribusi Aktif</h2>
                <p className="text-sm text-gray-500">Kelola event distribusi pupuk subsidi</p>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {isLoadingEvents ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Memuat jadwal distribusi...</p>
                    </div>
                </div>
            ) : activeEvents.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-gray-400 text-sm">Tidak ada jadwal distribusi aktif</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {activeEvents.map((event) => {
                        const isExpanded = expandedEvents.includes(event.id);
                        const progress = getEventProgress(event);
                        const isUpcoming = event.status === "upcoming";
                        const isOngoing = event.status === "ongoing";

                        return (
                            <div key={event.id} className="transition-all duration-300">
                                <Card className={`p-0 border-gray-200 transition-colors shadow-sm overflow-hidden ${isExpanded ? "border-emerald-500" : "hover:border-emerald-400"
                                    }`}>
                                    <div className="flex flex-col md:flex-row">
                                        {/* Status/Date Block */}
                                        <div className={`md:w-28 p-4 flex flex-col items-center justify-center text-white ${isOngoing ? "bg-emerald-600" : "bg-blue-600"
                                            }`}>
                                            <span className="text-xs font-bold opacity-80 uppercase">
                                                {isOngoing ? "AKTIF" : "SEGERA"}
                                            </span>
                                            <span className="text-3xl font-black">{new Date(event.date).getDate()}</span>
                                            <span className="text-xs font-bold opacity-80 uppercase">
                                                {new Date(event.date).toLocaleDateString('id-ID', { month: 'short' })}
                                            </span>
                                        </div>

                                        {/* Event Body */}
                                        <div className="flex-1 p-5">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-gray-900 text-lg leading-none">{event.eventName}</h3>
                                                    <Badge status={isOngoing ? "diproses" : "pending"}>
                                                        {isOngoing ? "Sedang Berlangsung" : "Akan Datang"}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap gap-y-1 gap-x-4">
                                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                        <MapPin size={14} className="text-emerald-500" />
                                                        {event.locationPoint}
                                                    </div>
                                                    {event.totalWeight && (
                                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                            <Package size={14} className="text-emerald-500" />
                                                            <strong>{event.totalWeight}</strong>
                                                        </div>
                                                    )}
                                                    {progress.total > 0 && (
                                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                            <User size={14} className="text-emerald-500" />
                                                            {progress.verified}/{progress.total} petani
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Progress Bar for Ongoing Events */}
                                                {isOngoing && (
                                                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Progress</span>
                                                            <span className="text-xs font-black text-emerald-900">{progress.percentage}%</span>
                                                        </div>
                                                        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                                                                style={{ width: `${progress.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mt-4 border-t pt-4">
                                                    {isUpcoming ? (
                                                        <>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => toggleEvent(event.id)}
                                                                className="flex-1 h-10 rounded-xl font-bold text-sm"
                                                            >
                                                                {isExpanded ? (
                                                                    <><ChevronUp size={16} className="mr-2" /> Tutup</>
                                                                ) : (
                                                                    <><ChevronDown size={16} className="mr-2" /> Lihat Daftar</>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => handleStartEvent(event.id)}
                                                                className="flex-1 h-10 rounded-xl font-bold text-sm"
                                                            >
                                                                <Play size={16} className="mr-2" />
                                                                Mulai Event
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => toggleEvent(event.id)}
                                                                className="flex-1 h-10 rounded-xl font-bold text-sm"
                                                            >
                                                                {isExpanded ? (
                                                                    <><ChevronUp size={16} className="mr-2" /> Tutup</>
                                                                ) : (
                                                                    <><ChevronDown size={16} className="mr-2" /> Lihat Daftar</>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => handleEndEvent(event)}
                                                                className="flex-1 h-10 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700"
                                                            >
                                                                <CheckCircle2 size={16} className="mr-2" />
                                                                Selesaikan
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {isExpanded && (
                                    <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                                        {isLoadingDetail ? (
                                            <div className="flex justify-center items-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                            </div>
                                        ) : event.farmers.length === 0 ? (
                                            <p className="text-center text-gray-400 py-8">Tidak ada data penerima</p>
                                        ) : (
                                            <>
                                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                    <User size={16} className="text-emerald-500" />
                                                    Daftar Petani Penerima
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {event.farmers.map((task) => {
                                                        const isVerified = task.status === "verified";
                                                        return (
                                                            <div
                                                                key={task.id}
                                                                onClick={() => !isVerified && isOngoing && setSelectedTask(task)}
                                                                className={`p-4 rounded-xl border transition-all ${isVerified
                                                                    ? "bg-emerald-50 border-emerald-200 cursor-default"
                                                                    : isOngoing
                                                                        ? "bg-white border-gray-200 hover:border-emerald-400 hover:shadow-md cursor-pointer active:scale-[0.98]"
                                                                        : "bg-white border-gray-200 cursor-default"
                                                                    }`}
                                                            >
                                                                <div className="space-y-2">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1">
                                                                            <p className="font-bold text-sm text-gray-900 leading-tight">{task.farmer}</p>
                                                                            <p className="text-[10px] text-gray-400 mt-0.5">NIK: {task.nik}</p>
                                                                        </div>
                                                                        {isVerified && (
                                                                            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
                                                                                <CheckCircle2 size={14} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="pt-2 border-t border-gray-100">
                                                                        <p className="text-xs font-bold text-emerald-700">{task.amount} {task.satuan} {task.item}</p>
                                                                        <p className="text-[10px] text-gray-500 mt-1">HP: {task.no_hp}</p>
                                                                        {isVerified && task.verifiedAt && (
                                                                            <p className="text-[10px] text-emerald-600 mt-1">✓ {task.verifiedAt}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Completion Summary Modal */}
            {completionSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ringkasan Distribusi</p>
                                <h3 className="text-xl font-bold text-gray-900">{completionSummary.eventName}</h3>
                            </div>
                            <button onClick={() => setCompletionSummary(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Event Info */}
                            <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100">
                                <h4 className="text-lg font-black text-emerald-900 mb-4">{completionSummary.eventName}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Lokasi</p>
                                        <p className="text-sm font-bold text-emerald-900">{completionSummary.locationPoint}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Tanggal</p>
                                        <p className="text-sm font-bold text-emerald-900">{completionSummary.displayDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Durasi</p>
                                        <p className="text-sm font-bold text-emerald-900">{calculateDuration(completionSummary.startTime, completionSummary.endTime)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-blue-500 text-white p-2 rounded-xl">
                                            <Package size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase">Total Muatan</p>
                                    </div>
                                    <p className="text-2xl font-black text-blue-900">{completionSummary.totalWeight || "N/A"}</p>
                                </div>

                                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-emerald-500 text-white p-2 rounded-xl">
                                            <User size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase">Petani Terlayani</p>
                                    </div>
                                    <p className="text-2xl font-black text-emerald-900">
                                        {getEventProgress(completionSummary).verified}/{completionSummary.farmers.length}
                                    </p>
                                </div>

                                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-amber-500 text-white p-2 rounded-xl">
                                            <TrendingUp size={20} />
                                        </div>
                                        <p className="text-[10px] font-black text-amber-600 uppercase">Persentase</p>
                                    </div>
                                    <p className="text-2xl font-black text-amber-900">
                                        {getEventProgress(completionSummary).percentage}%
                                    </p>
                                </div>
                            </div>

                            {/* Farmer List */}
                            <div>
                                <h5 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    Daftar Verifikasi Petani
                                </h5>
                                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                                    {completionSummary.farmers.map((farmer) => (
                                        <div
                                            key={farmer.id}
                                            className={`flex items-center justify-between p-3 rounded-xl border ${farmer.status === "verified"
                                                ? "bg-emerald-50 border-emerald-200"
                                                : "bg-gray-50 border-gray-200"
                                                }`}
                                            onClick={() => !farmer.status && setSelectedTask(farmer)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {farmer.status === "verified" ? (
                                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                                ) : (
                                                    <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300"></div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800">{farmer.farmer}</p>
                                                    <p className="text-[10px] text-gray-500">{farmer.item}</p>
                                                </div>
                                            </div>
                                            {farmer.verifiedAt && (
                                                <span className="text-xs text-emerald-600 font-bold">{farmer.verifiedAt}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex gap-3">
                            <button
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                                onClick={() => setCompletionSummary(null)}
                            >
                                Tutup
                            </button>
                            <button
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                                onClick={confirmCompleteEvent}
                            >
                                Konfirmasi Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => {
                        if (!isSubmitting) {
                            setSelectedTask(null);
                            setSelectedFile(null);
                            setPreviewUrl(null);
                        }
                    }} />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verifikasi Penerimaan</p>
                                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Distribusi</h3>
                            </div>
                            <button
                                onClick={() => {
                                    if (!isSubmitting) {
                                        setSelectedTask(null);
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                    }
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Nama Petani</p>
                                        <p className="text-lg font-black text-emerald-900">{selectedTask.farmer}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase">NIK</p>
                                        <p className="text-sm font-bold text-emerald-900">{selectedTask.nik}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-emerald-200">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Pupuk</p>
                                    <p className="text-lg font-black text-emerald-900">{selectedTask.amount} {selectedTask.satuan} {selectedTask.item}</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-emerald-200">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase">No. HP</p>
                                    <p className="text-sm font-bold text-emerald-900">{selectedTask.no_hp}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Camera size={16} className="text-emerald-500" /> Foto Bukti Penerimaan
                                </label>
                                <div
                                    className="group h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer overflow-hidden relative"
                                    onClick={() => document.getElementById('bukti-foto-input')?.click()}
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <>
                                            <Camera size={40} className="text-gray-300 group-hover:text-emerald-400 mb-2 transition-colors" />
                                            <p className="text-sm text-gray-400 group-hover:text-emerald-600 font-bold transition-colors">
                                                Klik untuk ambil foto
                                            </p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        id="bukti-foto-input"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                const url = URL.createObjectURL(file);
                                                setPreviewUrl(url);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex gap-3">
                            <button
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                    setSelectedTask(null);
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>
                            <button
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                                onClick={handleSubmitBukti}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Memproses..." : "Konfirmasi Selesai"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}