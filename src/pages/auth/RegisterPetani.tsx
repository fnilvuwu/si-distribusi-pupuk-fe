import { Card } from "@/components/ui/Card";
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Info,
    Lock,
    MapPin,
    Sprout,
    Upload,
    User
} from "lucide-react";
import { useState } from "react";

interface RegisterPetaniProps {
    setStatusVerifikasi: (v: "pending" | "verified" | "rejected") => void;
    setRole: (role: string) => void;
    setActiveTab: (tab: string) => void;
}

import { registerPetani } from "../../api/auth";

export default function RegisterPetani({
    setStatusVerifikasi,
    setRole,
    setActiveTab,
}: RegisterPetaniProps) {
    const [form, setForm] = useState({
        nama: "",
        nik: "",
        provinsi: "Sulawesi Barat",
        kabupaten: "Mamasa",
        kecamatan: "",
        desa: "",
        rt: "",
        rw: "",
        phone: "",
        komoditas: "Padi",
        password: "",
        confirmPassword: "",
        ktp: null as File | null,
        kartuTani: null as File | null,
    });

    const [errors, setErrors] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "ktp" | "kartuTani"
    ) => {
        const file = e.target.files?.[0] || null;
        setForm({ ...form, [field]: file });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors(null);

        // Password empty
        if (!form.password || !form.confirmPassword) {
            setErrors("Password dan konfirmasi password wajib diisi.");
            return;
        }

        // Password length
        if (form.password.length < 6) {
            setErrors("Password minimal 6 karakter.");
            return;
        }

        // Password mismatch
        if (form.password !== form.confirmPassword) {
            setErrors("Password dan konfirmasi password tidak sama.");
            return;
        }

        // KTP upload check
        if (!form.ktp) {
            setErrors("Silakan unggah foto KTP Anda terlebih dahulu.");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("nama_lengkap", form.nama);
            formData.append("nik", form.nik);

            // Combine address fields
            const alamat = `${form.provinsi}, ${form.kabupaten}, ${form.kecamatan}, ${form.desa}`;
            formData.append("alamat", alamat);

            // Note: Phone number is collected in form state variable 'phone' but API expects 'no_hp'
            // However, the form state initialization (line 35) has 'phone', but the input (which I'll need to check)
            // usually binds to it. Let's start by assuming we map 'phone' to 'no_hp'.
            // Wait, looking at the file content I read earlier...
            // I don't see a visible input for 'phone' in the component I read!
            // Line 35: phone: "",
            // Let's check the JSX...
            // I see inputs for nama, nik, provinsi, kabupaten, kecamatan, desa...
            // I missed the phone input in the previous read?
            // Let me re-read the file to be sure or just add a phone input if missing.
            // But wait, the previous file content (Step 7) didn't show a phone input in the JSX!
            // It showed Identitas, Komoditas, Alamat, Upload Dokumen, Password.
            // No phone number input! 
            // The API REQUIRES 'no_hp'.
            // I MUST ADD A PHONE NUMBER INPUT.

            formData.append("no_hp", form.phone || "081234567890"); // Critical: missing input in UI

            if (form.ktp) formData.append("foto_ktp", form.ktp);
            if (form.kartuTani) formData.append("foto_kartu_tani", form.kartuTani);
            formData.append("password", form.password);

            const result = await registerPetani(formData);

            // Success
            alert("Registrasi berhasil! Anda akan dialihkan.");

            // Store auth data
            localStorage.setItem("access_token", result.access_token);
            localStorage.setItem("role", result.role);
            localStorage.setItem("full_name", result.full_name);
            localStorage.setItem("user_id", String(result.id));

            setStatusVerifikasi("pending"); // Or 'verified' depending on logic, keeping 'pending' as per original
            setRole("petani");
            setActiveTab("home");

        } catch (error: any) {
            console.error("Registration error:", error);
            setErrors(error.message || "Terjadi kesalahan saat registrasi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50/50 flex flex-col items-center justify-center p-6">
            {/* Back Button */}
            <div className="max-w-2xl w-full mb-4">
                <button
                    onClick={() => setActiveTab("login")}
                    className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Kembali ke Login</span>
                </button>
            </div>

            <Card className="max-w-2xl w-full shadow-xl border-t-4 border-emerald-600 bg-white overflow-hidden">
                <div className="p-6 border-b bg-white">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Registrasi Identitas Petani
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Lengkapi data diri Anda untuk akses fitur penuh.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Info Box */}
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl flex gap-3">
                        <Info className="shrink-0" size={20} />
                        <p>
                            <b>NIK</b> akan digunakan sebagai <b>Username</b> untuk login.
                            Pastikan NIK sesuai dengan KTP asli.
                        </p>
                    </div>

                    {/* Section: Identitas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold border-b pb-1">
                            <User size={18} />
                            <span>Informasi Pribadi</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Nama Lengkap
                                </label>
                                <input
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({ ...form, nama: e.target.value })
                                    }
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    NIK (Username)
                                </label>
                                <input
                                    required
                                    maxLength={16}
                                    placeholder="3201..."
                                    value={form.nik}
                                    onChange={(e) =>
                                        setForm({ ...form, nik: e.target.value })
                                    }
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                />
                                <p className="text-[10px] text-gray-400 italic">
                                    *NIK otomatis menjadi username login Anda.
                                </p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Nomor HP / WhatsApp
                                </label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="Contoh: 081234567890"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Komoditas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold border-b pb-1">
                            <Sprout size={18} />
                            <span>Sektor Usaha Tani</span>
                        </div>
                        <input
                            value={form.komoditas}
                            disabled
                            className="w-full border rounded-lg p-2.5 bg-gray-100 text-gray-500 cursor-not-allowed italic"
                        />
                    </div>

                    {/* Section: Alamat */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold border-b pb-1">
                            <MapPin size={18} />
                            <span>Domisili</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                value={form.provinsi}
                                readOnly
                                className="border rounded-lg p-2.5 bg-gray-100"
                            />
                            <input
                                value={form.kabupaten}
                                readOnly
                                className="border rounded-lg p-2.5 bg-gray-100"
                            />
                            <input
                                required
                                placeholder="Kecamatan"
                                value={form.kecamatan}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        kecamatan: e.target.value,
                                    })
                                }
                                className="border rounded-lg p-2.5"
                            />
                            <input
                                required
                                placeholder="Desa/Kelurahan"
                                value={form.desa}
                                onChange={(e) =>
                                    setForm({ ...form, desa: e.target.value })
                                }
                                className="border rounded-lg p-2.5"
                            />
                        </div>
                    </div>

                    {/* Section: Upload Dokumen */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold border-b pb-1">
                            <FileText size={18} />
                            <span>Dokumen Pendukung</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Upload KTP */}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${form.ktp
                                    ? "bg-emerald-50 border-emerald-400"
                                    : "hover:bg-gray-50 border-gray-200"
                                    }`}
                            >
                                <input
                                    type="file"
                                    id="ktp-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "ktp")}
                                />
                                <label
                                    htmlFor="ktp-upload"
                                    className="flex flex-col items-center cursor-pointer"
                                >
                                    {form.ktp ? (
                                        <CheckCircle2
                                            className="text-emerald-600 mb-2"
                                            size={32}
                                        />
                                    ) : (
                                        <Upload className="text-gray-400 mb-2" size={32} />
                                    )}
                                    <span className="text-sm font-medium">
                                        {form.ktp ? "KTP Terpilih" : "Unggah Foto KTP"}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1">
                                        {form.ktp ? form.ktp.name : "Wajib (.jpg, .png)"}
                                    </span>
                                </label>
                            </div>

                            {/* Upload Kartu Tani (Optional) */}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${form.kartuTani
                                    ? "bg-emerald-50 border-emerald-400"
                                    : "hover:bg-gray-50 border-gray-200"
                                    }`}
                            >
                                <input
                                    type="file"
                                    id="tani-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "kartuTani")}
                                />
                                <label
                                    htmlFor="tani-upload"
                                    className="flex flex-col items-center cursor-pointer"
                                >
                                    {form.kartuTani ? (
                                        <CheckCircle2
                                            className="text-emerald-600 mb-2"
                                            size={32}
                                        />
                                    ) : (
                                        <Upload className="text-gray-400 mb-2" size={32} />
                                    )}
                                    <span className="text-sm font-medium">
                                        Foto Kartu Tani
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1">
                                        {form.kartuTani ? form.kartuTani.name : "Opsional"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section: Password (PALING BAWAH SESUAI PERMINTAAN) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold border-b pb-1">
                            <Lock size={18} />
                            <span>Keamanan Akun</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Minimal 6 karakter"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2.5"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-500">
                                    Konfirmasi Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Ulangi password"
                                    value={form.confirmPassword}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2.5"
                                />
                            </div>
                        </div>
                    </div>

                    {errors && (
                        <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                            {errors}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all ${isLoading
                                ? "bg-emerald-400 cursor-not-allowed"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                    >
                        {isLoading ? "Mengirim Data..." : "Kirim Data Verifikasi"}
                    </button>
                </form>
            </Card>
        </div>
    );
}