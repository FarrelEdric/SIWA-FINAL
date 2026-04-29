import React, { useEffect, useState } from "react";
import { expenseService } from "../services/api";
import { Plus, Trash2, Search, Eye, Calendar, ChevronDown, Repeat, Zap, Edit2 } from "lucide-react";
import Swal from "sweetalert2";
import { formatCurrency } from "../utils/formatCurrency";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    global_balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    category: "Lainnya",
    recurring: false,
  });

  const [expenseType, setExpenseType] = useState("wajib"); // wajib, lainnya
  const [wajibSelection, setWajibSelection] = useState("gaji_satpam");

  const WAJIB_OPTIONS = {
    gaji_satpam: { title: "Gaji Satpam", category: "Gaji", recurring: true, defaultAmount: "1500000" },
    token_listrik: { title: "Token Listrik Pos Satpam", category: "Utilitas", recurring: true, defaultAmount: "100000" },
  };

  // Auto-fill amount when wajib selection changes
  useEffect(() => {
    if (expenseType === 'wajib' && !isEditing) {
      const selected = WAJIB_OPTIONS[wajibSelection];
      if (selected) {
        setFormData(prev => ({
          ...prev,
          amount: selected.defaultAmount
        }));
      }
    }
  }, [wajibSelection, expenseType, isEditing]);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, searchTerm, month, year]);

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
        month,
        year
      });
      
      const responseData = res.data;
      setExpenses(responseData.data || []);
      setSummary(responseData.summary || { total_income: 0, total_expense: 0, global_balance: 0 });
      
      if (responseData.meta) {
        setPage(responseData.meta.current_page);
        setLastPage(responseData.meta.last_page);
        setTotal(responseData.meta.total);
      } else {
        setTotal(responseData.data?.length || 0);
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data pengeluaran.",
        timer: 3000,
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
      
      let payload = { ...formData };
      
      if (!isEditing && expenseType === 'wajib') {
        const selected = WAJIB_OPTIONS[wajibSelection];
        payload.title = selected.title;
        payload.category = selected.category;
        payload.recurring = selected.recurring;
      }

      if (isEditing) {
        await expenseService.update(selectedExpense.id, payload);
      } else {
        await expenseService.create(payload);
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Pengeluaran berhasil ${isEditing ? 'diperbarui' : 'dicatat'}.`,
        timer: 3000,
        timerProgressBar: true,
      });
      setShowModal(false);
      setIsEditing(false);
      fetchExpenses();
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setExpenseType("wajib");
    setFormData({
      title: "",
      description: "",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      category: "Lainnya",
      recurring: false,
    });
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setIsEditing(true);
    setExpenseType("lainnya"); // Always use manual mode for editing for flexibility
    setSelectedExpense(expense);
    setFormData({
      title: expense.title,
      description: expense.description || "",
      amount: expense.amount,
      expense_date: expense.expense_date,
      category: expense.category,
      recurring: expense.recurring,
    });
    setShowModal(true);
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
      {/* Summary cards removed per user request */}
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
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <div className="glass-card" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.75rem", 
            padding: "0.6rem 1.25rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid var(--glass-border)"
          }}>
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ border: "none", background: "transparent", outline: "none", width: "180px", fontSize: "0.95rem" }}
            />
          </div>

          <div className="glass-card" style={{ 
            display: "flex", 
            gap: "0.5rem", 
            padding: "0.4rem 1.25rem", 
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            border: "1px solid var(--glass-border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingRight: "0.75rem", borderRight: "1px solid var(--glass-border)" }}>
              <Calendar size={18} style={{ color: "var(--primary)" }} />
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <select 
                  value={month} 
                  onChange={(e) => setMonth(Number(e.target.value))}
                  style={{ 
                    padding: "0.4rem 1.5rem 0.4rem 0.5rem", 
                    border: "none", 
                    background: "transparent", 
                    fontWeight: "700",
                    appearance: "none",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                >
                  <option value="">Semua Bulan</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 0, pointerEvents: "none", color: "var(--text-secondary)" }} />
              </div>
            </div>

            <div style={{ position: "relative", display: "flex", alignItems: "center", paddingLeft: "0.25rem" }}>
              <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                style={{ 
                  padding: "0.4rem 1.5rem 0.4rem 0.5rem", 
                  border: "none", 
                  background: "transparent", 
                  fontWeight: "700",
                  appearance: "none",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                <option value="">Semua Tahun</option>
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 0, pointerEvents: "none", color: "var(--text-secondary)" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-outline"
              style={{ color: "var(--danger)", padding: "0.75rem 1.25rem", borderRadius: "1rem" }}
              onClick={handleDeleteAll}
              disabled={loading || total === 0}
            >
              <Trash2 size={18} />
              <span className="desktop-only">Hapus Semua</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={openCreateModal}
              style={{ padding: "0.75rem 1.5rem", borderRadius: "1rem" }}
            >
              <Plus size={20} />
              <span>Catat Pengeluaran</span>
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
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} style={{ padding: "1.25rem" }}>
                      <div className="skeleton" style={{ height: "30px", width: "100%", borderRadius: "0.5rem" }}></div>
                    </td>
                  </tr>
                ))
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} style={{ cursor: "default" }}>
                    <td style={{ paddingLeft: "1.5rem" }}>{new Date(e.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontWeight: "700", color: "var(--text-strong)" }}>{e.title}</td>
                    <td>
                      <span className="badge badge-warning" style={{ background: "var(--surface-muted)", color: "var(--text-secondary)", border: "1px solid var(--glass-border)" }}>{e.category}</span>
                    </td>
                    <td style={{ fontWeight: "800", color: "var(--danger)" }}>Rp {formatCurrency(e.amount)}</td>
                    <td>
                      {e.recurring ? (
                        <span className="badge" style={{ background: "rgba(79, 139, 101, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.25rem", width: "fit-content" }}>
                          <Repeat size={12} /> Rutin
                        </span>
                      ) : (
                        <span className="badge" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", gap: "0.25rem", width: "fit-content" }}>
                          <Zap size={12} /> Sekali
                        </span>
                      )}
                    </td>
                    <td style={{ paddingRight: "1.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "0.4rem", borderRadius: "0.5rem", color: "var(--primary)" }}
                          onClick={() => openDetailModal(e)}
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "0.4rem", color: "var(--warning)", borderRadius: "0.5rem" }}
                          onClick={() => openEditModal(e)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "0.4rem", color: "var(--danger)", borderRadius: "0.5rem" }}
                          onClick={() => handleDelete(e.id)}
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
            <h2 style={{ marginBottom: "1.5rem" }}>
              {isEditing ? "Edit Pengeluaran" : "Catat Pengeluaran Baru"}
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              {!isEditing && (
                <div style={{ display: "flex", gap: "0.5rem", padding: "0.25rem", background: "var(--surface-muted)", borderRadius: "0.75rem" }}>
                  <button 
                    type="button"
                    onClick={() => setExpenseType('wajib')}
                    style={{ 
                      flex: 1, 
                      padding: "0.6rem", 
                      borderRadius: "0.6rem", 
                      border: "none",
                      background: expenseType === 'wajib' ? "var(--primary)" : "transparent",
                      color: expenseType === 'wajib' ? "white" : "var(--text-secondary)",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Wajib/Rutin
                  </button>
                  <button 
                    type="button"
                    onClick={() => setExpenseType('lainnya')}
                    style={{ 
                      flex: 1, 
                      padding: "0.6rem", 
                      borderRadius: "0.6rem", 
                      border: "none",
                      background: expenseType === 'lainnya' ? "var(--primary)" : "transparent",
                      color: expenseType === 'lainnya' ? "white" : "var(--text-secondary)",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Lainnya (Manual)
                  </button>
                </div>
              )}

              {expenseType === 'wajib' && !isEditing ? (
                <div>
                  <label>Pilih Pengeluaran Wajib</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                    {Object.entries(WAJIB_OPTIONS).map(([key, opt]) => (
                      <label key={key} className="glass-card" style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "1rem", 
                        padding: "1rem", 
                        cursor: "pointer",
                        background: wajibSelection === key ? "var(--primary-soft)" : "transparent",
                        borderColor: wajibSelection === key ? "var(--primary)" : "var(--glass-border)"
                      }}>
                        <input 
                          type="radio" 
                          name="wajib_type"
                          checked={wajibSelection === key}
                          onChange={() => setWajibSelection(key)}
                          style={{ width: "auto" }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: "700", display: "block" }}>{opt.title}</span>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "0.25rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Kategori: {opt.category}</span>
                            {wajibSelection === key ? (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "600" }}>Harga (Rp)</span>
                                <input 
                                  type="number"
                                  value={formData.amount}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                  style={{ 
                                    width: "120px", 
                                    padding: "0.4rem", 
                                    textAlign: "right",
                                    fontWeight: "700",
                                    fontSize: "0.95rem",
                                    border: "1px solid var(--primary)",
                                    borderRadius: "0.5rem",
                                    background: "white",
                                    outline: "none"
                                  }}
                                />
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>Rp {formatCurrency(opt.defaultAmount)}</span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label>Judul Pengeluaran</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Perbaikan Jalan, Beli Sapu, dll"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Kategori</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Maintenance, Sosial, dll"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                {(expenseType === 'lainnya' || isEditing) && (
                  <div>
                    <label>Jumlah (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              {(expenseType === 'lainnya' || isEditing) && (
                <div>
                  <label>Keterangan / Deskripsi</label>
                  <textarea
                    placeholder="Jelaskan detail pengeluaran..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{ 
                      width: "100%", 
                      minHeight: "100px", 
                      padding: "0.75rem", 
                      borderRadius: "0.75rem",
                      border: "1px solid var(--glass-border)",
                      background: "rgba(255,255,255,0.5)",
                      fontFamily: "inherit",
                      fontSize: "0.95rem",
                      outline: "none"
                    }}
                  />
                </div>
              )}

              {expenseType === 'lainnya' && !isEditing && (
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) =>
                      setFormData({ ...formData, recurring: e.target.checked })
                    }
                    style={{ width: "auto" }}
                  />
                  <span style={{ fontSize: "0.9rem" }}>Tandai sebagai pengeluaran rutin</span>
                </label>
              )}

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan"}
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
