import React, { useEffect, useState } from "react";
import { residentService, STORAGE_URL } from "../services/api";
import {
  Plus,
  Edit2,
  Trash2,
  Phone,
  User as UserIcon,
  Search,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    resident_status: "tetap",
    phone_number: "",
    marital_status: "belum",
    ktp_photo: null,
  });

  const emptyForm = {
    full_name: "",
    resident_status: "tetap",
    phone_number: "",
    marital_status: "belum",
    ktp_photo: null,
  };

  const openCreateModal = () => {
    setEditingResident(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (resident) => {
    setEditingResident(resident);
    setFormData({
      full_name: resident.full_name ?? "",
      resident_status: resident.resident_status ?? "tetap",
      phone_number: resident.phone_number ?? "",
      marital_status: resident.marital_status ?? "belum",
      ktp_photo: null,
    });
    setShowModal(true);
  };

  const openDetailModal = (resident) => {
    setSelectedResident(resident);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingResident(null);
    setFormData(emptyForm);
  };

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, searchTerm]);

  const normalizeListResponse = (payload) => {
    if (Array.isArray(payload)) {
      return {
        items: payload,
        meta: {
          currentPage: 1,
          lastPage: 1,
          perPage: payload.length,
          total: payload.length,
        },
      };
    }

    if (payload && Array.isArray(payload.data)) {
      return {
        items: payload.data,
        meta: {
          currentPage: payload.current_page ?? 1,
          lastPage: payload.last_page ?? 1,
          perPage: payload.per_page ?? payload.data.length,
          total: payload.total ?? payload.data.length,
        },
      };
    }

    return {
      items: [],
      meta: { currentPage: 1, lastPage: 1, perPage: perPage, total: 0 },
    };
  };

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const res = await residentService.getAll({
        page,
        per_page: perPage,
        q: searchTerm,
      });
      const { items, meta } = normalizeListResponse(res.data);
      setResidents(items);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
      setTotal(meta.total);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data penghuni.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      if (editingResident?.id) {
        await residentService.update(editingResident.id, formData);
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data penghuni berhasil diperbarui.",
        });
      } else {
        await residentService.create(formData);
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Penghuni berhasil ditambahkan.",
        });
      }

      closeModal();
      // Refresh first page so new data is visible and avoid perceived duplicates.
      await residentService
        .getAll({ page: 1, per_page: perPage, q: searchTerm })
        .then((res) => {
          const { items, meta } = normalizeListResponse(res.data);
          setResidents(items);
          setPage(meta.currentPage);
          setLastPage(meta.lastPage);
          setTotal(meta.total);
        });
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Aksi tidak berhasil. Coba lagi.";
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus penghuni?",
      text: "Data ini akan dihapus permanen.",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await residentService.delete(id);
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Penghuni berhasil dihapus.",
      });
      fetchResidents();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa menghapus penghuni.",
      });
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus semua penghuni?",
      text: "Semua data penghuni akan dihapus permanen.",
      showCancelButton: true,
      confirmButtonText: "Hapus Semua",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await residentService.deleteAll();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Semua penghuni berhasil dihapus.",
      });
      setPage(1);
      fetchResidents();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa menghapus semua penghuni.",
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
            Manajemen Penghuni
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Kelola data seluruh warga perumahan.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: "260px",
            }}
          >
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Cari nama / telepon / status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ width: "100%" }}
            />
          </div>

          <button
            className="btn btn-outline"
            style={{ color: "var(--danger)" }}
            onClick={handleDeleteAll}
            disabled={loading || total === 0}
            title="Hapus semua data penghuni"
          >
            <Trash2 size={18} />
            Hapus Semua
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Tambah Penghuni
          </button>
        </div>
      </header>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Nama Lengkap</th>
              <th>Status</th>
              <th>No. Telepon</th>
              <th>Status Nikah</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ color: "var(--text-secondary)" }}>
                  Loading...
                </td>
              </tr>
            ) : (
              residents.map((r) => (
                <tr key={r.id}>
                  <td
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "var(--surface-muted)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UserIcon size={16} />
                    </div>
                    {r.full_name}
                  </td>
                  <td>
                    <span
                      className={`badge ${r.resident_status === "tetap" ? "badge-success" : "badge-warning"}`}
                    >
                      {r.resident_status === "tetap" ? "Tetap" : "Kontrak"}
                    </span>
                  </td>
                  <td>{r.phone_number}</td>
                  <td>
                    {r.marital_status === "menikah" ? "Menikah" : "Belum"}
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "0.5rem", color: "var(--primary)" }}
                      onClick={() => openDetailModal(r)}
                      title="Lihat Detail"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "0.5rem" }}
                      onClick={() => openEditModal(r)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "0.5rem", color: "var(--danger)" }}
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Total: {total}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className="btn btn-outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            >
              Page {page} / {lastPage}
            </div>
            <button
              className="btn btn-outline"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            >
              Next
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            >
              Per page
            </span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 20, 16, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="glass-card"
            style={{ width: "500px", background: "var(--glass-bg)" }}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>
              {editingResident ? "Edit Penghuni" : "Tambah Penghuni Baru"}
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label>Status Hunian</label>
                  <select
                    value={formData.resident_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resident_status: e.target.value,
                      })
                    }
                  >
                    <option value="tetap">Tetap</option>
                    <option value="kontrak">Kontrak</option>
                  </select>
                </div>
                <div>
                  <label>Status Pernikahan</label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marital_status: e.target.value,
                      })
                    }
                  >
                    <option value="menikah">Menikah</option>
                    <option value="belum">Belum</option>
                  </select>
                </div>
              </div>
              <div>
                <label>No. Telepon</label>
                <input
                  type="text"
                  required
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Foto KTP</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFormData({ ...formData, ktp_photo: e.target.files[0] })
                  }
                />
                {editingResident ? (
                  <p
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Kosongkan jika tidak mengganti foto.
                  </p>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingResident
                      ? "Simpan Perubahan"
                      : "Simpan"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={closeModal}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedResident && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 20, 16, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="glass-card"
            style={{ width: "500px", background: "var(--glass-bg)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0 }}>Detail Penghuni</h2>
              <button 
                className="btn btn-outline" 
                style={{ padding: "0.25rem 0.5rem" }} 
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {selectedResident.ktp_photo && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: "600", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Foto KTP</p>
                  <div 
                    onClick={() => setZoomedPhoto(`${STORAGE_URL}/${selectedResident.ktp_photo}`)}
                    title="Klik untuk memperbesar"
                    style={{ cursor: "zoom-in" }}
                  >
                    <img 
                      src={`${STORAGE_URL}/${selectedResident.ktp_photo}`} 
                      alt="KTP" 
                      style={{ width: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "0.5rem", border: "1px solid var(--glass-border)" }}
                    />
                  </div>
                </div>
              )}
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
                <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>Nama Lengkap:</span>
                <span>{selectedResident.full_name}</span>
                
                <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>Status Hunian:</span>
                <span className={`badge ${selectedResident.resident_status === "tetap" ? "badge-success" : "badge-warning"}`} style={{ alignSelf: "start" }}>
                  {selectedResident.resident_status === "tetap" ? "Tetap" : "Kontrak"}
                </span>
                
                <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>No. Telepon:</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Phone size={14} />
                  {selectedResident.phone_number}
                </span>
                
                <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>Status Pernikahan:</span>
                <span>{selectedResident.marital_status === "menikah" ? "Menikah" : "Belum Menikah"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {zoomedPhoto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 110,
            padding: "2rem",
          }}
          onClick={() => setZoomedPhoto(null)}
        >
          <img
            src={zoomedPhoto}
            alt="Zoomed KTP"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "0.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          />
          <button
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              background: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
            onClick={() => setZoomedPhoto(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Residents;
