import React, { useEffect, useState } from "react";
import { houseService, residentService } from "../services/api";
import { Home, UserPlus, UserMinus, History } from "lucide-react";

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [residents, setResidents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [assignData, setAssignData] = useState({
    resident_id: "",
    start_date: "",
  });

  useEffect(() => {
    fetchHouses();
    fetchResidents();
  }, []);

  const fetchHouses = async () => {
    const res = await houseService.getAll();
    setHouses(res.data);
  };

  const fetchResidents = async () => {
    const res = await residentService.getAll();
    setResidents(res.data);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await houseService.assignResident(selectedHouse.id, assignData);
      fetchHouses();
      setShowAssignModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVacate = async (house) => {
    const endDate = prompt(
      "Masukkan tanggal keluar (YYYY-MM-DD):",
      new Date().toISOString().split("T")[0],
    );
    if (endDate) {
      try {
        await houseService.vacate(house.id, { end_date: endDate });
        fetchHouses();
      } catch (error) {
        console.error(error);
      }
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
        {houses.map((h) => (
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
                <h3 style={{ fontSize: "1.25rem" }}>Rumah {h.house_number}</h3>
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
        ))}
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
