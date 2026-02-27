import {
  finishJadwalDistribusi,
  getJadwalDistribusi,
  getJadwalDistribusiDetail,
  getJadwalPenerima,
  type JadwalDistribusi,
  type PenerimaPupuk
} from "@/api/admin";
import AddScheduleModal from "@/components/admin/AddScheduleModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Calendar, CheckCircle, Loader2, MapPin, Package, Plus, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/* ================= COMPONENT ================= */

export default function AdminJadwal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<JadwalDistribusi[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<JadwalDistribusi | null>(null);
  const [recipients, setRecipients] = useState<PenerimaPupuk[]>([]);
  const [isRecipientsLoading, setIsRecipientsLoading] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJadwalData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getJadwalDistribusi({ page: 1, page_size: 50 });
      setEvents(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal memuat jadwal distribusi";
      setError(errorMessage);
      console.error("Error loading jadwal:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJadwalData();
  }, [loadJadwalData]);

  const handleViewDetail = async (id: number) => {
    try {
      setIsLoading(true);
      setShowRecipients(false);
      const detail = await getJadwalDistribusiDetail(id);
      setSelectedEvent(detail);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal memuat detail jadwal";
      setError(errorMessage);
      console.error("Error loading jadwal detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    loadJadwalData();
  };

  const handleFinishEvent = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin mengakhiri event ini? Status tidak dapat dikembalikan.")) return;
    try {
      setIsFinishing(true);
      await finishJadwalDistribusi(id);
      await loadJadwalData();
      setSelectedEvent(prev => prev ? { ...prev, status: 'selesai' } : null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal mengakhiri event";
      setError(errorMessage);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleLoadRecipients = async (id: number) => {
    try {
      setIsRecipientsLoading(true);
      setError(null);
      const data = await getJadwalPenerima(id);
      setRecipients(data);
      setShowRecipients(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal memuat daftar penerima";
      setError(errorMessage);
    } finally {
      setIsRecipientsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Distribusi Pupuk
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola lokasi dan waktu penyaluran pupuk bersubsidi.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Tambah Jadwal
        </Button>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.length === 0 ? (
              <div className="md:col-span-2 py-24 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                  Belum Ada Jadwal Tersedia
                </p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} onClick={() => handleViewDetail(event.id)} className="cursor-pointer">
                  <Card
                    className="p-5 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight leading-tight">
                        {event.nama_acara}
                      </h3>
                      <span className={`px-2 py-1 rounded text-[10px] font-black border uppercase tracking-wider ${event.status === 'selesai'
                        ? 'bg-gray-50 text-gray-600 border-gray-200'
                        : event.status === 'dikirim'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {event.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-bold">{new Date(event.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="font-bold">{event.lokasi}</span>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      {event.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg"
                        >
                          <Package className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[11px] font-black text-gray-700 uppercase">
                            {item.nama_pupuk || `Pupuk #${item.pupuk_id}`}:{" "}
                            <span className="text-emerald-600">
                              {item.jumlah} {item.satuan}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xl text-gray-800">{selectedEvent.nama_acara}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${selectedEvent.status === 'selesai'
                    ? 'bg-gray-50 text-gray-600 border-gray-200'
                    : selectedEvent.status === 'dikirim'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                    {selectedEvent.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Dibuat: {selectedEvent.created_at ? new Date(selectedEvent.created_at).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Tanggal</p>
                  <p className="font-bold">{new Date(selectedEvent.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <MapPin className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Lokasi</p>
                  <p className="font-bold">{selectedEvent.lokasi}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs text-gray-400 font-bold uppercase">Detail Pupuk</h4>
                {!showRecipients && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadRecipients(selectedEvent.id)}
                    disabled={isRecipientsLoading}
                    className="h-7 text-xs"
                  >
                    {isRecipientsLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Users className="w-3 h-3 mr-1" />}
                    Lihat Penerima
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {selectedEvent.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-amber-500" />
                      <span className="font-bold">{item.nama_pupuk || `Pupuk #${item.pupuk_id}`}</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      {item.jumlah.toLocaleString()} {item.satuan}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {showRecipients && (
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs text-gray-400 font-bold uppercase">Daftar Penerima</h4>
                  <span className="text-xs font-bold text-gray-500">{recipients.length} Orang</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {recipients.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">Belum ada penerima</div>
                  ) : (
                    recipients.map((rec) => (
                      <div key={rec.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{rec.nama_petani}</p>
                          <p className="text-xs text-gray-500">{rec.nama_pupuk}</p>
                        </div>
                        <span className="text-sm font-black text-emerald-600">
                          {rec.jumlah_disetujui} {rec.satuan}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedEvent(null)}>
                Tutup
              </Button>
              {selectedEvent.status !== 'selesai' && (
                <Button
                  variant="primary"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                  onClick={() => handleFinishEvent(selectedEvent.id)}
                  disabled={isFinishing}
                >
                  {isFinishing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Akhiri Event
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
