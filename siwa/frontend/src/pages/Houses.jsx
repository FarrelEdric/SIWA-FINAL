import React, { useEffect, useState } from "react";
import { houseService, residentService, STORAGE_URL } from "../services/api";
import {
  Home,
  UserPlus,
  UserMinus,
  Search,
  Eye,
  Phone,
  Plus,
} from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";
import Swal from "sweetalert2";

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assignData, setAssignData] = useState({
    resident_id: "",
    start_date: "",
  });
  const [createData, setCreateData] = useState({
    house_number: "",
    status: "tidak_dihuni",
  });

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchHouses();
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

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const res = await houseService.getAll({
        page,
        per_page: perPage,
        q: searchTerm,
      });
      const { items, meta } = normalizeListResponse(res.data);
      setHouses(items);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
      setTotal(meta.total);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data rumah.",
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    const res = await residentService.getAll();
    setResidents(res.data);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await houseService.assignResident(selectedHouse.id, assignData);
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Penghuni berhasil di-assign.",
        timer: 5000,
        timerProgressBar: true,
      });
      fetchHouses();
      setShowAssignModal(false);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa assign penghuni.",
        timer: 5000,
        timerProgressBar: true,
      });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      await houseService.create(createData);
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Rumah berhasil ditambahkan.",
        timer: 5000,
        timerProgressBar: true,
      });
      setShowCreateModal(false);
      setCreateData({ house_number: "", status: "tidak_dihuni" });
      fetchHouses();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Tidak bisa menambahkan rumah.",
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVacate = async (house) => {
    const result = await Swal.fire({
      title: `Empty Rumah ${house.house_number}`,
      text: "Masukkan tanggal keluar.",
      input: "date",
      inputValue: new Date().toISOString().split("T")[0],
      showCancelButton: true,
      confirmButtonText: "Empty",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await houseService.vacate(house.id, { end_date: result.value });
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Rumah berhasil di-empty.",
        timer: 5000,
        timerProgressBar: true,
      });
      fetchHouses();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa empty rumah.",
        timer: 5000,
        timerProgressBar: true,
      });
    }
  };

  const openDetailModal = (house) => {
    setSelectedHouse(house);
    setShowDetailModal(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header
        className="glass-card"
        style={{
          padding: "1.5rem 2rem",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(/rumah.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
              Manajemen Rumah
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Kelola status hunian dan detail warga per rumah.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Tambah Rumah
          </button>
        </div>
      </header>

      <div
        className="glass-card"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
      >
        <Search size={18} style={{ color: "var(--text-secondary)" }} />
        <input
          type="text"
          placeholder="Cari nomor rumah / status / nama penghuni..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          style={{ width: "100%" }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="glass-card" style={{ height: "200px" }}>
              <div className="skeleton" style={{ height: "100%", width: "100%", borderRadius: "1rem" }}></div>
            </div>
          ))
        ) : (
          houses.map((h) => (
            <div
              key={h.id}
              className="glass-card"
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      padding: "0.5rem",
                      background: "var(--primary-soft)",
                      borderRadius: "0.5rem",
                      color: "var(--primary)",
                    }}
                  >
                    <Home size={20} />
                  </div>
                  <h3 style={{ fontSize: "1.25rem" }}>
                    Rumah {h.house_number}
                  </h3>
                </div>
                <span
                  className={`badge ${h.status === "dihuni" ? "badge-success" : "badge-danger"}`}
                >
                  {h.status === "dihuni" ? "Dihuni" : "Kosong"}
                </span>
              </div>

              <div
                style={{
                  padding: "1rem",
                  background: "var(--surface-muted)",
                  borderRadius: "0.5rem",
                  minHeight: "80px",
                }}
              >
                {h.current_resident ? (
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      PENGHUNI SAAT INI
                    </p>
                    <p style={{ fontWeight: "600", marginTop: "0.25rem" }}>
                      {h.current_resident.full_name}
                    </p>
                  </div>
                ) : (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontStyle: "italic",
                    }}
                  >
                    Tidak ada penghuni aktif
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {h.status === "tidak_dihuni" ? (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setSelectedHouse(h);
                      setShowAssignModal(true);
                    }}
                  >
                    <UserPlus size={16} /> Assign
                  </button>
                ) : (
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, color: "var(--danger)" }}
                    onClick={() => handleVacate(h)}
                  >
                    <UserMinus size={16} /> Empty
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  style={{ flex: 1, color: "var(--primary)" }}
                  title="Detail Penghuni"
                  onClick={() => openDetailModal(h)}
                >
                  <Eye size={16} /> Detail
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
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
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
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
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </div>

      {showAssignModal && (
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
            style={{
              width: "100%",
              maxWidth: "400px",
              background: "var(--glass-bg)",
              margin: "1rem",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>
              Assign Penghuni - Rumah {selectedHouse.house_number}
            </h2>
            <form
              onSubmit={handleAssign}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label>Pilih Penghuni</label>
                <select
                  required
                  value={assignData.resident_id}
                  onChange={(e) =>
                    setAssignData({
                      ...assignData,
                      resident_id: e.target.value,
                    })
                  }
                >
                  <option value="">-- Pilih --</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} ({r.resident_status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Tanggal Masuk</label>
                <input
                  type="date"
                  required
                  value={assignData.start_date}
                  onChange={(e) =>
                    setAssignData({ ...assignData, start_date: e.target.value })
                  }
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowAssignModal(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
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
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "var(--glass-bg)",
              margin: "1rem",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Tambah Rumah</h2>
            <form
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label>Nomor Rumah</label>
                <input
                  type="text"
                  required
                  value={createData.house_number}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      house_number: e.target.value,
                    })
                  }
                  placeholder="Contoh: A-01"
                />
              </div>
              <div>
                <label>Status Awal</label>
                <select
                  value={createData.status}
                  onChange={(e) =>
                    setCreateData({ ...createData, status: e.target.value })
                  }
                >
                  <option value="tidak_dihuni">Tidak Dihuni</option>
                  <option value="dihuni">Dihuni</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetailModal && selectedHouse && (
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
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "var(--glass-bg)",
              margin: "1rem",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Detail Rumah {selectedHouse.house_number}</h2>
              <button
                className="btn btn-outline"
                style={{ padding: "0.25rem 0.5rem" }}
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <section>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--primary)" }}>
                  Penghuni Saat Ini
                </h3>
                {selectedHouse.current_resident ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1.5fr",
                      gap: "1rem",
                      background: "var(--surface-muted)",
                      padding: "1rem",
                      borderRadius: "0.5rem"
                    }}
                  >
                    <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>Nama:</span>
                    <span>{selectedHouse.current_resident.full_name}</span>
                     <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>Status:</span>
                    <div>
                      <span 
                        className={`badge ${selectedHouse.current_resident.resident_status === "tetap" ? "badge-success" : "badge-warning"}`}
                        style={{ 
                          padding: "0.4rem 1rem",
                          borderRadius: "0.75rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.8rem"
                        }}
                      >
                        <div style={{ 
                          width: "6px", 
                          height: "6px", 
                          borderRadius: "50%", 
                          background: selectedHouse.current_resident.resident_status === "tetap" ? "var(--success)" : "var(--warning)" 
                        }} />
                        {selectedHouse.current_resident.resident_status === "tetap" ? "Tetap" : "Kontrak"}
                      </span>
                    </div>
                    <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>Telp:</span>
                    <span style={{ fontWeight: "500" }}>{selectedHouse.current_resident.phone_number}</span>
                  </div>
                ) : (
                  <p style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>Kosong</p>
                )}
              </section>

              <section>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--primary)" }}>
                  History Penghuni
                </h3>
                <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <table style={{ fontSize: "0.875rem" }}>
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Masuk</th>
                        <th>Keluar</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHouse.occupancy_histories?.map((history) => (
                        <tr key={history.id}>
                          <td>{history.resident?.full_name}</td>
                          <td>{new Date(history.start_date).toLocaleDateString()}</td>
                          <td>{history.end_date ? new Date(history.end_date).toLocaleDateString() : "-"}</td>
                          <td>
                            {history.is_current ? 
                              <span className="badge badge-success">Aktif</span> : 
                              <span className="badge badge-danger">Keluar</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--primary)" }}>
                  History Pembayaran
                </h3>
                <div className="table-responsive" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <table style={{ fontSize: "0.875rem" }}>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Penghuni</th>
                        <th>Tipe</th>
                        <th>Jumlah</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHouse.payments?.map((payment) => (
                        <tr key={payment.id}>
                          <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                          <td>{payment.resident?.full_name}</td>
                          <td>
                            <span className="badge badge-success">{payment.payment_type}</span>
                          </td>
                          <td>Rp {formatCurrency(payment.amount)}</td>
                          <td>
                            <span className="badge badge-success">Lunas</span>
                          </td>
                        </tr>
                      ))}
                      {(!selectedHouse.payments || selectedHouse.payments.length === 0) && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                            Belum ada riwayat pembayaran
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
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

export default Houses;
