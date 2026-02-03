import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  type CreateUserData,
  type UpdateUserData,
  type User,
} from "@/api/superadmin";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Edit, Search, Trash2, UserPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [total, setTotal] = useState(0);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    password: "",
    role: "",
    nama_lengkap: "",
  });

  // Get token from localStorage
  const token = localStorage.getItem("access_token") || "";

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers(token);
      setUsers(response);
      setTotal(response.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat data pengguna";
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse?.response?.data?.message || message);
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch users on mount and when page changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createUser(token, formData);
      setShowAddModal(false);
      resetForm();
      fetchUsers();
      alert("User berhasil ditambahkan!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menambahkan user";
      const errorResponse = err as { response?: { data?: { message?: string } } };
      alert(errorResponse?.response?.data?.message || message);
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (userId: number) => {
    try {
      setLoading(true);
      const user = await getUserById(token, userId);
      setFormData({
        username: user.username,
        password: "",
        role: user.role,
        nama_lengkap: user.nama_lengkap,
      });
      setSelectedUserId(userId);
      setShowEditModal(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat data user";
      const errorResponse = err as { response?: { data?: { message?: string } } };
      alert(errorResponse?.response?.data?.message || message);
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setLoading(true);
      const updateData: UpdateUserData = {
        username: formData.username,
        role: formData.role,
        nama_lengkap: formData.nama_lengkap,
      };

      // Only include password if it's not empty
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateUser(token, selectedUserId, updateData);
      setShowEditModal(false);
      resetForm();
      setSelectedUserId(null);
      fetchUsers();
      alert("User berhasil diperbarui!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui user";
      const errorResponse = err as { response?: { data?: { message?: string } } };
      alert(errorResponse?.response?.data?.message || message);
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId: number) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      await deleteUser(token, selectedUserId);
      setShowDeleteModal(false);
      setSelectedUserId(null);
      fetchUsers();
      alert("User berhasil dihapus!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus user";
      const errorResponse = err as { response?: { data?: { message?: string } } };
      alert(errorResponse?.response?.data?.message || message);
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "",
      nama_lengkap: "",
    });
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "distributor":
        return "bg-purple-100 text-purple-700";
      case "petani":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filtering logic
  const filteredUsers = (users || []).filter((u) => {
    const matchSearch =
      u.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      (u.alamat || "").toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  return (
    <>
      <Card title="Manajemen Pengguna (Admin, Distributor & Petani)">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Cari nama, wilayah, atau role..."
            />
          </div>

          {/* Filter Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="distributor">Distributor</option>
            <option value="petani">Petani</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <Button
            icon={UserPlus}
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            Tambah User Baru
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Nama Lengkap</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-400">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-800">{u.nama_lengkap}</td>
                    <td className="px-6 py-4 text-gray-600">{u.username}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${roleColor(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(u.user_id)}
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(u.user_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* User count */}
        <div className="mt-6 text-sm text-gray-600">
          Menampilkan {filteredUsers.length} dari {total} pengguna
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Tambah User Baru</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="distributor">Distributor</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_lengkap}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_lengkap: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedUserId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password (kosongkan jika tidak ingin mengubah)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="distributor">Distributor</option>
                    <option value="petani">Petani</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_lengkap}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_lengkap: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                    setSelectedUserId(null);
                  }}
                >
                  Batal
                </Button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUserId(null);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
