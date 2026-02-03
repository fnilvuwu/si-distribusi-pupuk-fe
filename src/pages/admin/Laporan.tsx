import {
  downloadLaporanRekap,
  getLaporanBulanan,
  getLaporanHarian,
  getLaporanTahunan,
  type LaporanRekapBulanan,
  type LaporanRekapHarian,
  type LaporanRekapTahunan
} from "@/api/admin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from "react";

export default function AdminLaporan() {
  // State untuk filter
  const [filterMode, setFilterMode] = useState<'harian' | 'bulanan' | 'tahunan'>('bulanan');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data state
  const [laporanHarian, setLaporanHarian] = useState<LaporanRekapHarian | null>(null);
  const [laporanBulanan, setLaporanBulanan] = useState<LaporanRekapBulanan | null>(null);
  const [laporanTahunan, setLaporanTahunan] = useState<LaporanRekapTahunan | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load data when filter changes
  const loadLaporanData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (filterMode === 'harian') {
        const tanggal = currentDate.toISOString().split('T')[0];
        const data = await getLaporanHarian(tanggal);
        setLaporanHarian(data);
      } else if (filterMode === 'bulanan') {
        const tahun = currentDate.getFullYear();
        const bulan = currentDate.getMonth() + 1;
        const data = await getLaporanBulanan(tahun, bulan);
        setLaporanBulanan(data);
      } else {
        const tahun = currentDate.getFullYear();
        const data = await getLaporanTahunan(tahun);
        setLaporanTahunan(data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Gagal memuat laporan");
      console.error("Error loading laporan:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterMode, currentDate]);

  useEffect(() => {
    loadLaporanData();
  }, [loadLaporanData]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const params: { jenis: 'harian' | 'bulanan' | 'tahunan'; tanggal?: string; tahun?: number; bulan?: number } = { jenis: filterMode };

      if (filterMode === 'harian') {
        params.tanggal = currentDate.toISOString().split('T')[0];
      } else if (filterMode === 'bulanan') {
        params.tahun = currentDate.getFullYear();
        params.bulan = currentDate.getMonth() + 1;
      } else {
        params.tahun = currentDate.getFullYear();
      }

      await downloadLaporanRekap(params);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Gagal mengunduh laporan");
      console.error("Error downloading laporan:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Fungsi navigasi waktu
  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (filterMode === 'harian') newDate.setDate(newDate.getDate() + direction);
    else if (filterMode === 'bulanan') newDate.setMonth(newDate.getMonth() + direction);
    else if (filterMode === 'tahunan') newDate.setFullYear(newDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  // Helper untuk format teks display
  const getLabel = () => {
    if (filterMode === 'harian') return currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    if (filterMode === 'bulanan') return currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    return currentDate.getFullYear().toString();
  };

  // Transform API data to unified format
  const getTransformedData = () => {
    if (filterMode === 'harian' && laporanHarian) {
      // Group by pupuk from rekapitulasi array
      const pupukMap = new Map<string, { total_kg: number; count: number }>();

      laporanHarian.rekapitulasi.forEach(item => {
        Object.entries(item.by_pupuk).forEach(([pupukNama, kg]) => {
          const current = pupukMap.get(pupukNama) || { total_kg: 0, count: 0 };
          pupukMap.set(pupukNama, {
            total_kg: current.total_kg + kg,
            count: current.count + 1
          });
        });
      });

      return Array.from(pupukMap.entries()).map(([pupuk_nama, data]) => ({
        pupuk_nama,
        total_kg: data.total_kg,
        detail: `${data.count} jam tercatat`
      }));
    }

    if (filterMode === 'bulanan' && laporanBulanan) {
      // Group by pupuk from rekap_per_hari array
      const pupukMap = new Map<string, { total_kg: number; count: number }>();

      laporanBulanan.rekap_per_hari.forEach(item => {
        Object.entries(item.by_pupuk).forEach(([pupukNama, kg]) => {
          const current = pupukMap.get(pupukNama) || { total_kg: 0, count: 0 };
          pupukMap.set(pupukNama, {
            total_kg: current.total_kg + kg,
            count: current.count + 1
          });
        });
      });

      return Array.from(pupukMap.entries()).map(([pupuk_nama, data]) => ({
        pupuk_nama,
        total_kg: data.total_kg,
        detail: `${data.count} hari distribusi`
      }));
    }

    if (filterMode === 'tahunan' && laporanTahunan) {
      // Group by pupuk from rekap_per_bulan array
      const pupukMap = new Map<string, { total_kg: number; count: number }>();

      laporanTahunan.rekap_per_bulan.forEach(item => {
        Object.entries(item.by_pupuk).forEach(([pupukNama, kg]) => {
          const current = pupukMap.get(pupukNama) || { total_kg: 0, count: 0 };
          pupukMap.set(pupukNama, {
            total_kg: current.total_kg + kg,
            count: current.count + 1
          });
        });
      });

      return Array.from(pupukMap.entries()).map(([pupuk_nama, data]) => ({
        pupuk_nama,
        total_kg: data.total_kg,
        detail: `${data.count} bulan aktif`
      }));
    }

    return [];
  };

  // Get current data based on filter mode
  const getCurrentData = () => {
    if (filterMode === 'harian') return laporanHarian;
    if (filterMode === 'bulanan') return laporanBulanan;
    return laporanTahunan;
  };

  const currentData = getCurrentData();
  const transformedData = getTransformedData();

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

      {/* HEADER & FILTER CONTROL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          {(['harian', 'bulanan', 'tahunan'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filterMode === mode
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-[150px] justify-center">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-700">{getLabel()}</span>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : !currentData ? (
        <div className="py-12 text-center text-gray-400 bg-white rounded-xl border">
          Tidak ada data untuk periode ini
        </div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Penyaluran */}
            <Card className="p-4 border-l-4 border-emerald-500 shadow-sm bg-white">
              <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">Total Penyaluran</p>
              <p className="text-2xl font-black mt-1 text-slate-800">
                {((currentData.total_penyaluran_kg || 0) / 1000).toFixed(1)}{" "}
                <span className="text-sm font-medium text-slate-400">Ton</span>
              </p>
            </Card>

            {/* Penerima Manfaat - Only for Harian */}
            {filterMode === 'harian' && laporanHarian && (
              <>
                <Card className="p-4 border-l-4 border-blue-500 shadow-sm bg-white">
                  <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest">Penerima Manfaat</p>
                  <p className="text-2xl font-black mt-1 text-slate-800">
                    {laporanHarian.penerima_manfaat}{" "}
                    <span className="text-sm font-medium text-slate-400">Petani</span>
                  </p>
                </Card>

                <Card className="p-4 border-l-4 border-amber-500 shadow-sm bg-white">
                  <p className="text-[10px] text-amber-600 uppercase font-black tracking-widest">Permohonan Aktif</p>
                  <p className="text-2xl font-black mt-1 text-slate-800">{laporanHarian.permohonan_aktif}</p>
                </Card>

                <Card className="p-4 border-l-4 border-purple-500 shadow-sm bg-white">
                  <p className="text-[10px] text-purple-600 uppercase font-black tracking-widest">Wilayah Terbanyak</p>
                  <p className="text-xl font-black mt-1 text-slate-800">{laporanHarian.wilayah_terbanyak}</p>
                </Card>
              </>
            )}
          </div>

          {/* TABLE DATA */}
          <Card
            title={`Rekapitulasi Distribusi ${filterMode.charAt(0).toUpperCase() + filterMode.slice(1)}`}
            footer={
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Unduh Laporan (CSV)
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                      Pupuk
                    </th>
                    <th className="px-4 py-3 text-gray-600 uppercase text-[10px] font-bold tracking-wider">Total (Kg)</th>
                    <th className="px-4 py-3 text-gray-600 uppercase text-[10px] font-bold tracking-wider">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t">
                  {transformedData.length > 0 ? (
                    transformedData.map((pupuk, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 font-bold text-gray-700">{pupuk.pupuk_nama}</td>
                        <td className="px-4 py-4 font-bold text-emerald-600">
                          {pupuk.total_kg.toLocaleString('id-ID')} Kg
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          <span>{pupuk.detail}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                        Tidak ada data distribusi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}