import { api } from './client';

// ==================== Type Definitions ====================

export interface JadwalDistribusi {
    id: number;
    permohonan_id: number;
    tanggal_pengiriman: string;
    lokasi: string;
    status: string;
    tahap: string | null;
}

export interface PenerimaItem {
    id: number;
    permohonan_id: number;
    nama_petani: string;
    nik: string;
    jenis_pupuk: string;
    jumlah_disetujui: number;
    satuan: string;
    no_hp: string;
    status_distribusi: string;
    verified_at?: string;
}

export interface JadwalDetail {
    jadwal_id: number;
    permohonan_id: number;
    tanggal_pengiriman: string;
    lokasi: string;
    jadwal_status: string;
    tahap: string | null;
    penerima_list: PenerimaItem[];
}

export interface RiwayatDistribusi {
    jadwal_id: number;
    permohonan_id: number;
    tanggal_pengiriman: string;
    lokasi: string;
    status: string;
    total_penerima_terverifikasi: number;
    total_volume: number | null;
    satuan: string | null;
}

export interface VerifikasiPenerimaRequest {
    permohonan_id: number;
    bukti_penerima_url?: string;
    catatan?: string;
}

export interface VerifikasiPenerimaResponse {
    message: string;
    permohonan_id: number;
    status_baru: string;
}

// ==================== Query Parameters ====================

export interface GetJadwalParams {
    lokasi?: string;
    tanggal?: string; // YYYY-MM-DD
    status?: 'dijadwalkan' | 'dikirim' | 'selesai';
}

export interface GetRiwayatParams {
    start_date?: string; // YYYY-MM-DD
    end_date?: string; // YYYY-MM-DD
    lokasi?: string;
    status?: string; // default: selesai
}

// ==================== API Service Functions ====================

/**
 * Get Jadwal Distribusi dengan filter opsional
 * @param params Filter parameters (lokasi, tanggal, status)
 * @returns List of jadwal distribusi
 */
export const getJadwalDistribusi = async (params?: GetJadwalParams): Promise<JadwalDistribusi[]> => {
    try {
        const response = await api.get<JadwalDistribusi[]>('/distributor/jadwal-distribusi-pupuk', {
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching jadwal distribusi:', error);
        throw error;
    }
};

/**
 * Get Detail Jadwal Distribusi beserta daftar penerima
 * @param jadwalId ID jadwal distribusi
 * @returns Detail jadwal dan list penerima
 */
export const getJadwalDetail = async (jadwalId: number): Promise<JadwalDetail> => {
    try {
        const response = await api.get<JadwalDetail>(`/distributor/jadwal-distribusi-pupuk/${jadwalId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching jadwal detail for ID ${jadwalId}:`, error);
        throw error;
    }
};

/**
 * Verifikasi penerima pupuk (mark as distributed)
 * @param data Permohonan ID, bukti URL (optional), catatan (optional)
 * @returns Confirmation message and new status
 */
export const verifikasiPenerima = async (
    data: FormData
): Promise<VerifikasiPenerimaResponse> => {
    try {
        const response = await api.post<VerifikasiPenerimaResponse>('/distributor/verifikasi-penerima-pupuk', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying penerima:', error);
        throw error;
    }
};

/**
 * Get Riwayat Distribusi dengan filter opsional
 * @param params Filter parameters (start_date, end_date, lokasi, status)
 * @returns List of riwayat distribusi (default: selesai)
 */
export const getRiwayatDistribusi = async (
    params?: GetRiwayatParams
): Promise<RiwayatDistribusi[]> => {
    try {
        const response = await api.get<RiwayatDistribusi[]>('/distributor/riwayat-distribusi-pupuk', {
            params: {
                status: 'selesai', // Default status
                ...params,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching riwayat distribusi:', error);
        throw error;
    }
};

/**
 * Update Status Jadwal Distribusi
 * @param jadwalId ID jadwal distribusi
 * @param status Status baru ('mulai' | 'selesai')
 * @returns Response message
 */
export const updateStatusJadwal = async (
    jadwalId: number,
    status: 'mulai' | 'selesai'
): Promise<{ message: string; new_status: string }> => {
    try {
        const response = await api.put<{ message: string; new_status: string }>(
            `/distributor/jadwal-distribusi-pupuk/${jadwalId}/status`,
            { status }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating status for jadwal ${jadwalId}:`, error);
        throw error;
    }
};
