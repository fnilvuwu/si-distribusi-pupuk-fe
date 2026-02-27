import type { MetricsResponse } from '@/api/superadmin';
import { getMetrics } from '@/api/superadmin';
import { Card } from "@/components/ui/Card";
import {
    CalendarDays,
    FileText,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SuperAdminDashboard() {
    const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('No token found');

                const data = await getMetrics(token);
                setMetrics(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-gray-500 font-bold uppercase">Total User</p>
                        <Users size={16} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-black mt-2">{metrics?.total_users?.toLocaleString() || '0'}</p>
                </Card>

                <Card className="p-4">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Pengajuan</p>
                        <FileText size={16} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black mt-2">{metrics?.total_pengajuan?.toLocaleString() || '0'}</p>
                </Card>

                <Card className="p-4">
                    <div className="flex justify-between items-start">
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Event Distribusi</p>
                        <CalendarDays size={16} className="text-orange-600" />
                    </div>
                    <p className="text-2xl font-black mt-2">{metrics?.total_event_distribusi?.toLocaleString() || '0'}</p>
                </Card>
            </div>
        </div>
    );

}