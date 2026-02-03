import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle2, Package, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    namaPupuk: string;
    jumlah: string;
    lokasi: string;
  } | null;
  loading?: boolean;
}

export function ConfirmReceiptModal({ isOpen, onClose, onConfirm, data, loading }: ConfirmModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-gray-800">Konfirmasi Penerimaan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3">
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 h-fit">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Item Diterima</p>
              <p className="text-lg font-black text-emerald-900">{data.namaPupuk}</p>
              <p className="text-sm text-emerald-700 font-medium">{data.jumlah}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              Apakah Anda yakin telah menerima pupuk ini di <span className="font-bold text-gray-800">{data.lokasi}</span>?
            </p>
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-[11px] font-medium border border-amber-100">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>Pastikan fisik pupuk sudah Anda terima sebelum melakukan konfirmasi. Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 flex flex-col gap-2">
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            {loading ? "Memproses..." : "Ya, Saya Sudah Terima"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-gray-200 text-gray-600 py-3 rounded-xl"
          >
            Batal
          </Button>
        </div>
      </div>
    </div>
  );
}