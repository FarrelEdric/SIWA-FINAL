import React, { useEffect, useState } from "react";
import { houseService, residentService, STORAGE_URL } from "../services/api";
import { Home, UserPlus, UserMinus, History, Search, Eye, Phone } from "lucide-react";
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
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [assignData, setAssignData] = useState({
    resident_id: "",
    start_date: "",
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
      });
      fetchHouses();
      setShowAssignModal(false);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa assign penghuni.",
      });
    }
  };

  const handleVacate = async (house) => {
    const result = await Swal.fire({
      title: `Vacate Rumah ${house.house_number}`,
      text: "Masukkan tanggal keluar.",
      input: "date",
      inputValue: new Date().toISOString().split("T")[0],
      showCancelButton: true,
      confirmButtonText: "Vacate",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      await houseService.vacate(house.id, { end_date: result.value });
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Rumah berhasil di-vacate.",
      });
      fetchHouses();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa vacate rumah.",
      });
    }
  };

  const openDetailModal = (resident) => {
    setSelectedResident(resident);
    setShowDetailModal(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header>
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Manajemen Rumah</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Kelola status hunian dan histori warga per rumah.
        </p>
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
          <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
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
                    <UserMinus size={16} /> Vacate
                  </button>
                )}
                <button
                  className="btn btn-outline"
                  style={{ flex: 0.5, color: "var(--primary)" }}
                  title="Detail Penghuni"
                  disabled={!h.current_resident}
                  onClick={() => openDetailModal(h.current_resident)}
                >
                  <Eye size={16} />
                </button>
                <button
                  className="btn btn-outline"
                  style={{ flex: 0.5 }}
                  title="History"
                >
                  <History size={16} />
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
            style={{ width: "400px", background: "var(--glass-bg)" }}
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

export default Houses;
