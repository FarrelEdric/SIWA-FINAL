import React, { useEffect, useState } from "react";
import { expenseService } from "../services/api";
import { Receipt, Plus, Trash2 } from "lucide-react";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expense_date: "",
    category: "Gaji",
    recurring: false,
    description: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await expenseService.getAll();
    setExpenses(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await expenseService.create(formData);
      fetchExpenses();
      setShowModal(false);
    } catch (error) {
      console.error(error);
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
            Pengeluaran RT
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Catat pengeluaran rutin dan tidak rutin kas RT.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Catat Pengeluaran
        </button>
      </header>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.expense_date).toLocaleDateString()}</td>
                <td>{e.title}</td>
                <td>
                  <span className="badge badge-warning">{e.category}</span>
                </td>
                <td>Rp {parseFloat(e.amount).toLocaleString()}</td>
                <td>{e.recurring ? "Rutin" : "Sekali"}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.5rem", color: "var(--danger)" }}
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
            <h2 style={{ marginBottom: "1.5rem" }}>Catat Pengeluaran Baru</h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label>Judul Pengeluaran</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
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
                  <label>Jumlah (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expense_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label>Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Gaji">Gaji Satpam</option>
                  <option value="Listrik">Token Listrik</option>
                  <option value="Perbaikan">Perbaikan Jalan/Selokan</option>
                  <option value="Maintenance">Maintenance Fasilitas</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={formData.recurring}
                  onChange={(e) =>
                    setFormData({ ...formData, recurring: e.target.checked })
                  }
                />
                <label>Pengeluaran Rutin</label>
              </div>
              <div>
                <label>Keterangan</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
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

export default Expenses;
