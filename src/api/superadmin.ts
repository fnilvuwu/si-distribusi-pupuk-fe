import { api } from './client';

// ==================== TYPES ====================

export interface MetricsResponse {
    uptime: string;
    total_users: number;
    error_logs: number;
}

export interface User {
    user_id: number;
    username: string;
    role: string;
    nama_lengkap: string;
    status: string;
    alamat?: string;
    no_hp?: string;
    perusahaan?: string;
}

export interface CreateUserData {
    username: string;
    password: string;
    role: string;
    nama_lengkap: string;
    alamat?: string;
    no_hp?: string;
    perusahaan?: string;
}

export interface UpdateUserData {
    username?: string;
    password?: string;
    role?: string;
    nama_lengkap?: string;
    alamat?: string;
    no_hp?: string;
    perusahaan?: string;
}

// ==================== API FUNCTIONS ====================

export const getMetrics = async (token: string): Promise<MetricsResponse> => {
    const response = await api.get<MetricsResponse>('/superadmin/metrics', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getUsers = async (token: string): Promise<User[]> => {
    const response = await api.get<User[]>('/superadmin/users', {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });
    return response.data;
};

export const getUserById = async (token: string, userId: number): Promise<User> => {
    const response = await api.get<User>(`/superadmin/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });
    return response.data;
};

export const createUser = async (token: string, data: CreateUserData): Promise<User> => {
    const response = await api.post<User>('/superadmin/users/add', data, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });
    return response.data;
};

export const updateUser = async (
    token: string,
    userId: number,
    data: UpdateUserData
): Promise<User> => {
    const response = await api.put<User>(`/superadmin/users/${userId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });
    return response.data;
};

export const deleteUser = async (token: string, userId: number): Promise<void> => {
    await api.delete(`/superadmin/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });
};
