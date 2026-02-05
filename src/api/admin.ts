import { api } from './client';

/* ============================================
   TYPESCRIPT INTERFACES & TYPES
   ============================================ */

// ===== Pagination & Common Types =====
export interface PaginationParams {
    page?: number;
    page_size?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface AdminProfile {
    name: string;
    nik: string;
    phone: string;
    // password can allow update
}

export const getAdminProfile = async (): Promise<AdminProfile> => {
    // Mock
    // const res = await api.get("/admin/profile");
    // return res.data;
    return {
        name: "Admin Distribusi",
        nik: "3500000000000001",
        phone: "081234567890"
    };
};

export const updateAdminProfile = async (data: AdminProfile): Promise<ApiResponse<null>> => {
    // Mock
    // return api.post("/admin/profile", data);
    console.log("Mock update admin: ", data);
    return { success: true, message: "Profil berhasil diperbarui", data: null };
};

// ===== 7. Master Data Pupuk =====
export interface PupukItem {
    id: number;
    nama_pupuk: string;
    satuan: string;
    deskripsi?: string;
    foto?: string;
}

export const getMasterPupukList = async (): Promise<PupukItem[]> => {
    // Mock
    // const res = await api.get("/admin/master_pupuk");
    // return res.data;
    return [
        { id: 1, nama_pupuk: "Urea", satuan: "Kg" },
        { id: 2, nama_pupuk: "NPK", satuan: "Kg" },
        { id: 3, nama_pupuk: "ZA", satuan: "Kg" },
    ];
};

export const addMasterPupuk = async (data: Omit<PupukItem, 'id'>): Promise<ApiResponse<PupukItem>> => {
    // Mock
    console.log("Add pupuk", data);
    return { success: true, message: "Pupuk berhasil ditambahkan", data: { id: Date.now(), ...data } };
};

export const updateMasterPupuk = async (id: number, data: Partial<PupukItem>): Promise<ApiResponse<PupukItem>> => {
    // Mock
    console.log("Update pupuk", id, data);
    return { success: true, message: "Pupuk berhasil diupdate", data: { id, nama_pupuk: "Updated", satuan: "Kg", ...data } };
};

export const deleteMasterPupuk = async (id: number): Promise<ApiResponse<null>> => {
    // Mock
    console.log("Delete pupuk", id);
    return { success: true, message: "Pupuk berhasil dihapus", data: null };
};

// ===== 1. Verifikasi Petani Types =====
export interface VerifikasiPetani {
    user_id: number;
    nama_lengkap: string;
    nik: string;
    status_verifikasi: boolean;
    created_at: string;
}

export interface VerifikasiPetaniDetail {
    user_id: number;
    nama_lengkap: string;
    nik: string;
    alamat: string;
    no_hp: string;
    url_ktp: string | null;
    url_kartu_tani: string | null;
    status_verifikasi: boolean;
    created_at: string;
}

export interface VerifikasiPetaniParams extends PaginationParams {
    status?: boolean;
    date_from?: string;
    date_to?: string;
}

export interface ApproveVerifikasiPetaniRequest {
    comment?: string;
}

export interface RejectVerifikasiPetaniRequest {
    reason: string;
}

// ===== 2. Verifikasi Hasil Tani Types =====
export interface VerifikasiHasilTani {
    id: number;
    petani_id: number;
    nama_lengkap: string;
    jenis_tanaman: string;
    jumlah_hasil: number;
    satuan: string;
    tanggal_panen: string;
    status_verifikasi: boolean;
    created_at: string;
    // Optional fields from detail view
    bukti_url?: string;
    // Fields that might not be in backend yet but were in frontend:
    // petani_nik, luas_lahan, lokasi_detail, keterangan
    // We remove them or make them optional if we don't expect them
}

export interface VerifikasiHasilTaniParams extends PaginationParams {
    status?: boolean;
    date_from?: string;
    date_to?: string;
}

export interface ApproveVerifikasiHasilTaniRequest {
    comment?: string;
}

export interface RejectVerifikasiHasilTaniRequest {
    reason: string;
}

// ===== 3. Persetujuan Pupuk Types =====
export interface PersetujuanPupuk {
    id: number;
    nama_petani: string;
    nama_pupuk: string;
    pupuk_id: number;
    jumlah_diminta: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface ApprovePersetujuanPupukRequest {
    jumlah_disetujui: number;
    pupuk_id?: number;
}

export interface RejectPersetujuanPupukRequest {
    alasan: string;
}

// ===== 4. Jadwal Distribusi Types =====
export interface JadwalDistribusiItem {
    pupuk_id: number;
    nama_pupuk?: string;
    jumlah: number;
    satuan: string;
}

export interface JadwalDistribusi {
    id: number;
    nama_acara: string;
    tanggal: string;
    lokasi: string;
    items: JadwalDistribusiItem[];
    created_at: string;
    created_by?: string;
}

export interface CreateJadwalDistribusiRequest {
    nama_acara: string;
    tanggal: string;
    lokasi: string;
    items: {
        pupuk_id: number;
        jumlah: number;
        satuan: string;
    }[];
}

export interface JadwalDistribusiParams extends PaginationParams {
    tanggal_from?: string;
    tanggal_to?: string;
}

// ===== 5. Stock Management Types =====
export interface RiwayatStock {
    id: number;
    pupuk_id: number;
    nama_pupuk: string;
    tipe: 'tambah' | 'kurangi';
    jumlah: number;
    satuan: string;
    catatan?: string;
    created_at: string;
}

export interface RiwayatStockParams extends PaginationParams {
    pupuk_id?: number;
    tipe?: 'tambah' | 'kurangi';
    created_from?: string;
    created_to?: string;
}

export interface TambahStockRequest {
    pupuk_id: number;
    jumlah: number;
    satuan: string;
    catatan?: string;
}

export interface KurangiStockRequest {
    pupuk_id: number;
    jumlah: number;
    satuan: string;
    catatan?: string;
}

export interface StokPupuk {
    id: number;
    nama_pupuk: string;
    jumlah_stok: number;
    satuan: string;
}

// ===== 6. Laporan Rekap Types =====
export interface LaporanRekapHarian {
    tanggal: string;
    total_penyaluran_kg: number;
    penerima_manfaat: number;
    permohonan_aktif: number;
    wilayah_terbanyak: string;
    rekapitulasi: {
        jam: string;
        by_pupuk: Record<string, number>;
    }[];
}

export interface LaporanRekapBulanan {
    tahun: number;
    bulan: number;
    total_penyaluran_kg: number;
    rekap_per_hari: {
        tanggal: string;
        by_pupuk: Record<string, number>;
    }[];
}

export interface LaporanRekapTahunan {
    tahun: number;
    total_penyaluran_kg: number;
    rekap_per_bulan: {
        bulan: number;
        by_pupuk: Record<string, number>;
    }[];
}

export interface DownloadLaporanParams {
    jenis: 'harian' | 'bulanan' | 'tahunan';
    tanggal?: string; // For harian
    tahun?: number; // For bulanan & tahunan
    bulan?: number; // For bulanan only
}

/* ============================================
   API SERVICE FUNCTIONS
   ============================================ */

const BASE_URL = '/admin';

// ===== 1. Verifikasi Petani =====

/**
 * Get list of farmer verification requests
 */
export const getVerifikasiPetani = async (
    params?: VerifikasiPetaniParams
): Promise<VerifikasiPetani[]> => {
    const response = await api.get(`${BASE_URL}/verifikasi_petani`, { params });
    return response.data;
};

/**
 * Get detailed information of a specific farmer verification request
 */
export const getVerifikasiPetaniDetail = async (
    petaniId: number
): Promise<VerifikasiPetaniDetail> => {
    const response = await api.get(`${BASE_URL}/verifikasi_petani/${petaniId}`);
    return response.data;
};

/**
 * Approve farmer verification request
 */
export const approveVerifikasiPetani = async (
    petaniId: number,
    data: ApproveVerifikasiPetaniRequest
): Promise<ApiResponse<VerifikasiPetani>> => {
    const response = await api.post(
        `${BASE_URL}/verifikasi_petani/${petaniId}/approve`,
        data
    );
    return response.data;
};

/**
 * Reject farmer verification request
 */
export const rejectVerifikasiPetani = async (
    petaniId: number,
    data: RejectVerifikasiPetaniRequest
): Promise<ApiResponse<VerifikasiPetani>> => {
    const response = await api.post(
        `${BASE_URL}/verifikasi_petani/${petaniId}/reject`,
        data
    );
    return response.data;
};

// ===== 2. Verifikasi Hasil Tani =====

/**
 * Get list of harvest report verification requests
 */
export const getVerifikasiHasilTani = async (
    params?: VerifikasiHasilTaniParams
): Promise<VerifikasiHasilTani[]> => {
    const response = await api.get(`${BASE_URL}/verifikasi_hasil_tani`, { params });
    return response.data;
};

/**
 * Get detailed information of a specific harvest report
 */
export const getVerifikasiHasilTaniDetail = async (
    laporanId: number
): Promise<VerifikasiHasilTani> => {
    const response = await api.get(`${BASE_URL}/verifikasi_hasil_tani/${laporanId}`);
    return response.data;
};

/**
 * Approve harvest report verification
 */
export const approveVerifikasiHasilTani = async (
    laporanId: number,
    data: ApproveVerifikasiHasilTaniRequest
): Promise<ApiResponse<VerifikasiHasilTani>> => {
    const response = await api.post(
        `${BASE_URL}/verifikasi_hasil_tani/${laporanId}/approve`,
        data
    );
    return response.data;
};

/**
 * Reject harvest report verification
 */
export const rejectVerifikasiHasilTani = async (
    laporanId: number,
    data: RejectVerifikasiHasilTaniRequest
): Promise<ApiResponse<VerifikasiHasilTani>> => {
    const response = await api.post(
        `${BASE_URL}/verifikasi_hasil_tani/${laporanId}/reject`,
        data
    );
    return response.data;
};

// ===== 3. Persetujuan Pupuk =====

/**
 * Get simple list of fertilizer stocks
 */
export const getStokList = async (): Promise<StokPupuk[]> => {
    const response = await api.get(`${BASE_URL}/stok_pupuk_list`);
    return response.data;
};

/**
 * Get list of pending fertilizer approval requests
 */
export const getPersetujuanPupuk = async (): Promise<PersetujuanPupuk[]> => {
    const response = await api.get(`${BASE_URL}/persetujuan_pupuk`);
    return response.data;
};

/**
 * Approve fertilizer request
 */
export const approvePersetujuanPupuk = async (
    permohonanId: number,
    data: ApprovePersetujuanPupukRequest
): Promise<ApiResponse<PersetujuanPupuk>> => {
    const response = await api.post(
        `${BASE_URL}/persetujuan_pupuk/${permohonanId}/approve`,
        data
    );
    return response.data;
};

/**
 * Reject fertilizer request
 */
export const rejectPersetujuanPupuk = async (
    permohonanId: number,
    data: RejectPersetujuanPupukRequest
): Promise<ApiResponse<PersetujuanPupuk>> => {
    const response = await api.post(
        `${BASE_URL}/persetujuan_pupuk/${permohonanId}/reject`,
        data
    );
    return response.data;
};

// ===== 4. Jadwal Distribusi =====

/**
 * Create new fertilizer distribution schedule
 */
export const createJadwalDistribusi = async (
    data: CreateJadwalDistribusiRequest
): Promise<ApiResponse<JadwalDistribusi>> => {
    const response = await api.post(`${BASE_URL}/buat_jadwal_distribusi_pupuk`, data);
    return response.data;
};

/**
 * Get list of distribution schedules
 */
export const getJadwalDistribusi = async (
    params?: JadwalDistribusiParams
): Promise<JadwalDistribusi[]> => {
    const response = await api.get(`${BASE_URL}/jadwal_distribusi_pupuk`, { params });
    return response.data;
};

/**
 * Get detailed information of a specific distribution schedule
 */
export const getJadwalDistribusiDetail = async (
    jadwalId: number
): Promise<JadwalDistribusi> => {
    const response = await api.get(`${BASE_URL}/jadwal_distribusi_pupuk/${jadwalId}`);
    return response.data;
};

// ===== 5. Stock Management =====

/**
 * Get stock history with filters
 */
export const getRiwayatStock = async (
    params?: RiwayatStockParams
): Promise<RiwayatStock[]> => {
    const response = await api.get(`${BASE_URL}/riwayat_stock_pupuk`, { params });
    return response.data;
};

/**
 * Add stock to fertilizer inventory
 */
export const tambahStock = async (
    data: TambahStockRequest
): Promise<ApiResponse<RiwayatStock>> => {
    const response = await api.post(`${BASE_URL}/tambah_stock_pupuk`, data);
    return response.data;
};

/**
 * Reduce stock from fertilizer inventory
 */
export const kurangiStock = async (
    data: KurangiStockRequest
): Promise<ApiResponse<RiwayatStock>> => {
    const response = await api.post(`${BASE_URL}/kurangi_stock_pupuk`, data);
    return response.data;
};

// ===== 6. Laporan Rekap =====

/**
 * Get daily summary report
 */
export const getLaporanHarian = async (
    tanggal: string
): Promise<LaporanRekapHarian> => {
    const response = await api.get(`${BASE_URL}/laporan_rekap_harian`, {
        params: { tanggal },
    });
    return response.data;
};

/**
 * Get monthly summary report
 */
export const getLaporanBulanan = async (
    tahun: number,
    bulan: number
): Promise<LaporanRekapBulanan> => {
    const response = await api.get(`${BASE_URL}/laporan_rekap_bulanan`, {
        params: { tahun, bulan },
    });
    return response.data;
};

/**
 * Get yearly summary report
 */
export const getLaporanTahunan = async (
    tahun: number
): Promise<LaporanRekapTahunan> => {
    const response = await api.get(`${BASE_URL}/laporan_rekap_tahunan`, {
        params: { tahun },
    });
    return response.data;
};

/**
 * Download report as CSV file
 */
export const downloadLaporanRekap = async (
    params: DownloadLaporanParams
): Promise<void> => {
    const response = await api.get(`${BASE_URL}/download_laporan_rekap`, {
        params,
        responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Generate filename based on params
    const filename = `laporan_${params.jenis}_${params.tanggal || `${params.tahun}_${params.bulan || ''}`
        }.csv`;

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
