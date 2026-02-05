import { getAdminProfile, updateAdminProfile } from "@/api/admin";
import { CreditCard, Edit, Loader2, Lock, Phone, Save, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export default function Home() {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        nik: "",
        phone: "",
        password: "", // Keep password local/empty initially
    });

    // State untuk menyimpan data sementara saat edit
    const [tempData, setTempData] = useState(formData);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminProfile();
            setFormData({
                ...data,
                password: "password123" // Mock password placeholder
            });
        } catch (error) {
            console.error("Gagal memuat profil admin", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setTempData(formData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempData(formData);
    };

    const handleSave = async () => {
        try {
            await updateAdminProfile(tempData);
            setFormData(tempData);
            setIsEditing(false);
            alert("Profil berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal update profil", error);
            alert("Gagal memperbarui profil.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTempData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Profil Admin</h1>
                    <p className="text-gray-500">Kelola informasi profil akun anda</p>
                </div>
                {!isEditing ? (
                    <Button onClick={handleEdit} icon={Edit}>
                        Edit Profil
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleCancel} icon={X}>
                            Batal
                        </Button>
                        <Button onClick={handleSave} icon={Save}>
                            Simpan Perubahan
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card Summary */}
                <Card className="col-span-1 border-emerald-100 bg-gradient-to-br from-white to-emerald-50">
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 border-4 border-white shadow-sm">
                            <User size={40} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">{formData.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">Administrator</p>
                        <div className="w-full border-t border-emerald-100 pt-4 mt-2">
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <p className="font-medium text-emerald-600">Aktif</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Role</p>
                                    <p className="font-medium text-emerald-600">Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Detail Info Form */}
                <Card className="col-span-1 md:col-span-2" title="Informasi Pribadi">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Nama */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <User size={16} /> Nama Lengkap
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={tempData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium border border-gray-100">
                                        {formData.name}
                                    </div>
                                )}
                            </div>

                            {/* NIK */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <CreditCard size={16} /> NIK
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="nik"
                                        value={tempData.nik}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium border border-gray-100">
                                        {formData.nik}
                                    </div>
                                )}
                            </div>

                            {/* No HP */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Phone size={16} /> No. Handphone
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={tempData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium border border-gray-100">
                                        {formData.phone}
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Lock size={16} /> Password
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="password"
                                        value={tempData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800 font-medium border border-gray-100 font-mono flex justify-between items-center">
                                        <span>{'•'.repeat(formData.password.length)}</span>
                                        <span className="text-xs text-gray-400 font-sans">(Tersembunyi)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
