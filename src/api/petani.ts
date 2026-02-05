import { api } from './client';

// 1. GET PROFILE
export interface PetaniProfile {
  nama_lengkap: string;
  nik: string;
  alamat: string;
  no_hp: string;
  url_ktp: string;
  url_kartu_tani: string | null;
  status_verifikasi: boolean;
}

export const getProfile = async (): Promise<PetaniProfile> => {
  const res = await api.get("/petani/profile");
  return res.data;
};

// 2. UPDATE PROFILE (MULTIPART)
export interface UpdateProfilePayload {
  nama_lengkap: string;
  nik: string;
  alamat: string;
  no_hp: string;
  foto_ktp: File;
  foto_kartu_tani?: File;
}

export const updateProfile = async (data: UpdateProfilePayload) => {
  const formData = new FormData();

  formData.append("nama_lengkap", data.nama_lengkap);
  formData.append("nik", data.nik);
  formData.append("alamat", data.alamat);
  formData.append("no_hp", data.no_hp);
  formData.append("foto_ktp", data.foto_ktp);

  if (data.foto_kartu_tani) {
    formData.append("foto_kartu_tani", data.foto_kartu_tani);
  }

  const res = await api.post("/petani/profile/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// 3. LIST PUPUK
export interface Pupuk {
  id: number;
  nama_pupuk: string;
  jumlah_stok: number;
  satuan: string;
}

export const getPupukList = async (): Promise<Pupuk[]> => {
  const res = await api.get("/petani/pupuk");
  return res.data;
};

// 4. AJUKAN PERMOHONAN (MULTIPART)
export interface PengajuanPayload {
  jenis_pupuk: string;
  jumlah_kg: number;
  alasan_pengajuan: string;
  lokasi_penggunaan: string;
  jenis_tanaman?: string; // New field for Auto-Report
  dokumen_pendukung?: File;
}

export const ajukanPupuk = async (data: PengajuanPayload) => {
  const formData = new FormData();

  formData.append("jenis_pupuk", data.jenis_pupuk);
  formData.append("jumlah_kg", String(data.jumlah_kg));
  formData.append("alasan_pengajuan", data.alasan_pengajuan);
  formData.append("lokasi_penggunaan", data.lokasi_penggunaan);

  if (data.dokumen_pendukung) {
    formData.append("dokumen_pendukung", data.dokumen_pendukung);
  }

  const res = await api.post(
    "/petani/pengajuan_pupuk",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

// 5. RIWAYAT PERMOHONAN
export interface RiwayatItem {
  id: number;
  pupuk_id: number;
  nama_pupuk: string;
  jumlah_diminta: number;
  jumlah_disetujui: number | null;
  status: "pending" | "dikirim" | "selesai";
  created_at: string;
  // Added fields for Schedule
  lokasi_pengambilan?: string;
  waktu_pengambilan?: string;
}

export const getRiwayat = async (): Promise<RiwayatItem[]> => {
  const res = await api.get("/petani/pengajuan_pupuk/riwayat");
  return res.data;
};

// 6. KONFIRMASI TERIMA
export const konfirmasiTerima = async (id: number) => {
  const res = await api.patch(
    `/petani/pengajuan_pupuk/${id}/konfirmasi`
  );
  return res.data;
};



// 7. LAPOR HASIL TANI (URLENCODED)
export interface LaporHasilPayload {
  jenis_tanaman: string;
  jumlah_hasil: number;
  satuan: string;
  tanggal_panen: string; // YYYY-MM-DD
}

export const laporHasilTani = async (data: LaporHasilPayload) => {
  const params = new URLSearchParams();

  params.append("jenis_tanaman", data.jenis_tanaman);
  params.append("jumlah_hasil", String(data.jumlah_hasil));
  params.append("satuan", data.satuan);
  params.append("tanggal_panen", data.tanggal_panen);

  const res = await api.post(
    "/petani/lapor_hasil_tani",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return res.data;
};

// 8. LIST LAPORAN HASIL TANI
export interface LaporanItem {
  id: number;
  tanggalPanen: string;
  jenisKomoditas: string;
  totalHasil: number;
  lokasi: string;
  status: "dilaporkan" | "terverifikasi";
}

export const getLaporanList = async (): Promise<LaporanItem[]> => {
  // Mocking response for now as we pretend endpoint exists
  // const res = await api.get("/petani/laporan_hasil_tani");
  // return res.data;

  // Returning empty array or mock data for UI testing if real endpoint fails
  try {
    const res = await api.get("/petani/laporan_hasil_tani");
    return res.data;
  } catch (e) {
    console.warn("Using mock data for Laporan List");
    return [];
  }
};

