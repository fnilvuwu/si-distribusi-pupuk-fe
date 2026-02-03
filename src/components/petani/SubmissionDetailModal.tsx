import {
  X,
  Clock,
  MapPin,
  Package,
  Calendar,
  CheckCircle2,
  Info,
  ChevronRight
} from "lucide-react";

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
    jenisPupuk: string;
    jumlah: string;
    status: "dijadwalkan" | "dikirim" | "selesai";
    keterangan?: string;
  } | null;
}

export const SubmissionDetailModal = ({ isOpen, onClose, data }: SubmissionDetailModalProps) => {
  if (!isOpen || !data) return null;

  const isCompleted = data.status === "selesai";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Detail Transaksi</p>
            <h2 className="text-xl font-black text-slate-800">#{data.id}</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Tracker Brief */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
            {isCompleted ? (
              <CheckCircle2 className="text-emerald-600" size={24} />
            ) : (
              <Clock className="text-amber-600" size={24} />
            )}
            <div>
              <p className={`text-xs font-bold uppercase ${isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                {data.status === "selesai" ? "Pengambilan Selesai" : "Menunggu Pengambilan"}
              </p>
              <p className="text-[11px] text-slate-500">Update terakhir: 10 menit yang lalu</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                <Calendar size={20} />
              </div>
              <div className="flex-1 border-b border-slate-50 pb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Waktu Pengambilan</p>
                <p className="text-sm font-bold text-slate-700">{data.tanggal} • {data.waktu}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                <MapPin size={20} />
              </div>
              <div className="flex-1 border-b border-slate-50 pb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Lokasi Gudang</p>
                <p className="text-sm font-bold text-slate-700">{data.lokasi}</p>
                <p className="text-[11px] text-blue-600 font-medium hover:underline cursor-pointer flex items-center gap-1 mt-1">
                  Lihat di Maps <ChevronRight size={10} />
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <Package size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Rincian Komoditas</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm font-bold text-slate-700">{data.jenisPupuk}</p>
                  <p className="text-lg font-black text-emerald-700">{data.jumlah}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Info for Pending */}
          {!isCompleted && (
            <div className="bg-blue-50 p-3 rounded-xl flex gap-3 border border-blue-100">
              <Info size={18} className="text-blue-500 shrink-0" />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Harap membawa <b>KTP Asli</b> dan <b>Kartu Tani</b> saat melakukan pengambilan di lokasi gudang yang tertera.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-6 pt-0">
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};