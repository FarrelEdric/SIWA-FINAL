import React, { useEffect, useState } from "react";
import { expenseService } from "../services/api";
import { Plus, Trash2, Search, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { formatCurrency } from "../utils/formatCurrency";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
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

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getAll({
        page,
        per_page: perPage,
        q: searchTerm,
      });
      const { items, meta } = normalizeListResponse(res.data);
      setExpenses(items);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
      setTotal(meta.total);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data pengeluaran.",
        timer: 5000,
        timerProgressBar: true,
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
      await expenseService.create(formData);
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengeluaran berhasil dicatat.",
        timer: 5000,
        timerProgressBar: true,
      });
      setShowModal(false);
      const res = await expenseService.getAll({
        page: 1,
        per_page: perPage,
        q: searchTerm,
      });
      const { items, meta } = normalizeListResponse(res.data);
      setExpenses(items);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
      setTotal(meta.total);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa menyimpan pengeluaran.",
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus pengeluaran?",
      text: "Data ini akan dihapus permanen.",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await expenseService.delete(id);
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengeluaran berhasil dihapus.",
        timer: 5000,
        timerProgressBar: true,
      });
      fetchExpenses();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa menghapus pengeluaran.",
        timer: 5000,
        timerProgressBar: true,
      });
    }
  };

  const openDetailModal = async (expense) => {
    try {
      const response = await expenseService.getById(expense.id);
      setSelectedExpense(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa memuat detail pengeluaran.",
        timer: 5000,
        timerProgressBar: true,
      });
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedExpense(null);
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus semua pengeluaran?",
      text: "Semua data pengeluaran akan dihapus permanen.",
      showCancelButton: true,
      confirmButtonText: "Hapus Semua",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await expenseService.deleteAll();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Semua pengeluaran berhasil dihapus.",
        timer: 5000,
        timerProgressBar: true,
      });
      setPage(1);
      fetchExpenses();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa menghapus semua pengeluaran.",
        timer: 5000,
        timerProgressBar: true,
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
          gap: "1rem",
          flexWrap: "wrap",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: "240px",
              flex: "1",
            }}
          >
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Cari judul / kategori / keterangan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-outline"
              style={{ color: "var(--danger)" }}
              onClick={handleDeleteAll}
              disabled={loading || total === 0}
              title="Hapus semua data pengeluaran"
            >
              <Trash2 size={18} />
              <span className="desktop-only">Hapus Semua</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              <span className="desktop-only">Catat Pengeluaran</span>
              <span className="mobile-only">Catat</span>
            </button>
          </div>
        </div>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
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
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ color: "var(--text-secondary)" }}>
                    Loading...
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.expense_date).toLocaleDateString()}</td>
                    <td>{e.title}</td>
                    <td>
                      <span className="badge badge-warning">{e.category}</span>
                    </td>
                    <td>Rp {formatCurrency(e.amount)}</td>
                    <td>{e.recurring ? "Rutin" : "Sekali"}</td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
                        onClick={() => openDetailModal(e)}
                        title="Lihat detail pengeluaran"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "0.5rem", color: "var(--danger)" }}
                        onClick={() => handleDelete(e.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "var(--glass-bg)",
              margin: "1rem",
            }}
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
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
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

      {showDetailModal && selectedExpense && (
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
              maxWidth: "560px",
              background: "var(--glass-bg)",
              margin: "1rem",
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
              <h2 style={{ margin: 0 }}>Detail Pengeluaran</h2>
              <button
                className="btn btn-outline"
                style={{ padding: "0.25rem 0.5rem" }}
                onClick={closeDetailModal}
              >
                Tutup
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.5fr",
                gap: "1rem",
                rowGap: "1rem",
              }}
            >
              <span
                style={{ fontWeight: "600", color: "var(--text-secondary)" }}
              >
                Judul:
              </span>
              <span>{selectedExpense.title}</span>

              <span
                style={{ fontWeight: "600", color: "var(--text-secondary)" }}
              >
                Tanggal:
              </span>
              <span>
                {new Date(selectedExpense.expense_date).toLocaleDateString()}
              </span>

              <span
                style={{ fontWeight: "600", color: "var(--text-secondary)" }}
              >
                Kategori:
              </span>
              <span>
                <span className="badge badge-warning">
                  {selectedExpense.category}
                </span>
              </span>

              <span
                style={{ fontWeight: "600", color: "var(--text-secondary)" }}
              >
                Jumlah:
              </span>
              <span>Rp {formatCurrency(selectedExpense.amount)}</span>

              <span
                style={{ fontWeight: "600", color: "var(--text-secondary)" }}
              >
                Status:
              </span>
              <span>{selectedExpense.recurring ? "Rutin" : "Sekali"}</span>

              <span
                style={{ fontWeight: "600", color: "var(--text-secondary)" }}
              >
                Keterangan:
              </span>
              <span style={{ whiteSpace: "pre-wrap" }}>
                {selectedExpense.description?.trim()
                  ? selectedExpense.description
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
