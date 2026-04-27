import React, { useEffect, useState } from "react";
import { residentService } from "../services/api";
import { Plus, Edit2, Trash2, Phone, User as UserIcon } from "lucide-react";

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    resident_status: "tetap",
    phone_number: "",
    marital_status: "belum",
    ktp_photo: null,
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await residentService.getAll();
      setResidents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await residentService.create(formData);
      fetchResidents();
      setShowModal(false);
      setFormData({
        full_name: "",
        resident_status: "tetap",
        phone_number: "",
        marital_status: "belum",
        ktp_photo: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus penghuni ini?")) {
      try {
        await residentService.delete(id);
        fetchResidents();
      } catch (error) {
        console.error(error);
      }
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Tambah Penghuni
        </button>
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
            {residents.map((r) => (
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
                <td>{r.marital_status === "menikah" ? "Menikah" : "Belum"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.5rem" }}
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
            ))}
          </tbody>
        </table>
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
            <h2 style={{ marginBottom: "1.5rem" }}>Tambah Penghuni Baru</h2>
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
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;
