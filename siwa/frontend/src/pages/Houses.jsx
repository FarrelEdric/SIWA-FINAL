import React, { useEffect, useState } from "react";
import { houseService, residentService } from "../services/api";
import { Home, UserPlus, UserMinus, History } from "lucide-react";
import Swal from "sweetalert2";

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [residents, setResidents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
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
  }, [page, perPage]);

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
      const res = await houseService.getAll({ page, per_page: perPage });
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header>
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Manajemen Rumah</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Kelola status hunian dan histori warga per rumah.
        </p>
      </header>

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
    </div>
  );
};

export default Houses;
