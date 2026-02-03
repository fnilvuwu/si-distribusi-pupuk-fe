import { api } from './client';

interface LoginCredentials {
    username: string;
    password: string;
    grant_type?: string;
    scope?: string;
    client_id?: string;
    client_secret?: string;
}

interface LoginResponse {
    access_token: string;
    role: string;
    full_name: string | null;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const formData = new URLSearchParams();
        formData.append('grant_type', credentials.grant_type || 'password');
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('scope', credentials.scope || '');
        formData.append('client_id', credentials.client_id || 'string');
        formData.append('client_secret', credentials.client_secret || '');

        const response = await api.post<LoginResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return response.data;
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { detail?: string } } };
            if (axiosError.response?.data?.detail) {
                throw new Error(axiosError.response.data.detail);
            }
        }
        throw new Error('Login failed. Please try again.');
    }
};

export const logout = async (): Promise<void> => {
    try {
        const token = localStorage.getItem('access_token');

        if (token) {
            await api.post('/auth/logout', null, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        }
    } catch (error) {
        // Even if API call fails, we still want to clear local storage
        console.error('Logout API call failed:', error);
    }
};

export interface RegisterPetaniResponse {
    status: string;
    id: number;
    username: string;
    role: string;
    full_name: string;
    access_token: string;
    [key: string]: any;
}

export const registerPetani = async (formData: FormData): Promise<RegisterPetaniResponse> => {
    try {
        const response = await api.post<RegisterPetaniResponse>('/auth/register_petani', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { detail?: string } } };
            if (axiosError.response?.data?.detail) {
                throw new Error(axiosError.response.data.detail);
            }
        }
        throw new Error('Registration failed. Please try again.');
    }
};
