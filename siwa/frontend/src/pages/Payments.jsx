import React, { useEffect, useState } from "react";
import { paymentService, houseService } from "../services/api";
import { CreditCard, Search } from "lucide-react";
import Swal from "sweetalert2";
import { formatCurrency } from "../utils/formatCurrency";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [houses, setHouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    house_id: "",
    resident_id: "",
    payment_type: "satpam",
    amount: 0,
    payment_period_start: "",
    payment_period_end: "",
  });
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      formData.house_id &&
      formData.payment_type &&
      formData.payment_type !== "lainnya"
    ) {
      calculateAmount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.house_id, formData.payment_type]);

  const calculateAmount = async () => {
    try {
      const res = await paymentService.calculate({
        house_id: formData.house_id,
        payment_type: formData.payment_type,
      });
      setFormData((prev) => ({
        ...prev,
        amount: res.data.amount,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPayments();
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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAll({
        page,
        per_page: perPage,
        q: searchTerm,
      });
      const { items, meta } = normalizeListResponse(res.data);
      setPayments(items);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
      setTotal(meta.total);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data pembayaran.",
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHouses = async () => {
    try {
      const res = await houseService.getAll();
      setHouses(res.data.filter((h) => h.status === "dihuni"));
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa mengambil data rumah.",
        timer: 5000,
        timerProgressBar: true,
      });
    }
  };

  const handleHouseChange = (houseId) => {
    const house = houses.find((h) => h.id == houseId);
    if (house) {
      setFormData({
        ...formData,
        house_id: houseId,
        resident_id: house.current_resident.id,
      });
    } else {
      setFormData({
        ...formData,
        house_id: "",
        resident_id: "",
        amount: 0,
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: "Hapus Terpilih?",
      text: `Anda akan menghapus ${selectedIds.length} data pembayaran.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--danger)",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await paymentService.deleteBulk(selectedIds);
        await Swal.fire({
          title: "Berhasil",
          text: "Data telah dihapus.",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
        });
        setSelectedIds([]);
        fetchPayments();
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Gagal",
          text: "Tidak bisa menghapus data.",
          icon: "error",
          timer: 5000,
          timerProgressBar: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Hapus Semua?",
      text: "Seluruh data pembayaran akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--danger)",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await paymentService.deleteBulk("all");
        await Swal.fire({
          title: "Berhasil",
          text: "Semua data telah dihapus.",
          icon: "success",
          timer: 5000,
          timerProgressBar: true,
        });
        setSelectedIds([]);
        fetchPayments();
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Gagal",
          text: "Tidak bisa menghapus data.",
          icon: "error",
          timer: 5000,
          timerProgressBar: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === payments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(payments.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      await paymentService.create(formData);
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pembayaran berhasil dicatat.",
        timer: 5000,
        timerProgressBar: true,
      });
      setShowModal(false);
      // Refresh first page after new payment
      const res = await paymentService.getAll({
        page: 1,
        per_page: perPage,
        q: searchTerm,
      });
      const { items, meta } = normalizeListResponse(res.data);
      setPayments(items);
      setPage(meta.currentPage);
      setLastPage(meta.lastPage);
      setTotal(meta.total);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak bisa menyimpan pembayaran.",
        timer: 5000,
        timerProgressBar: true,
      });
    } finally {
      setSubmitting(false);
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
            Pembayaran Iuran
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Catat dan pantau pembayaran iuran satpam & kebersihan.
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
              minWidth: "260px",
              flex: 1,
            }}
          >
            <Search size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Cari rumah / penghuni / jenis / status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <CreditCard size={20} />
              <span className="desktop-only">Input</span> Pembayaran
            </button>

            <button
              className="btn btn-outline"
              style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0 || loading}
            >
              Hapus <span className="desktop-only">Terpilih</span> (
              {selectedIds.length})
            </button>

            <button
              className="btn btn-outline"
              style={{ background: "var(--danger)", color: "#fff" }}
              onClick={handleDeleteAll}
              disabled={loading}
              title="Hapus Semua"
            >
              <span className="desktop-only">Hapus Semua</span>
              <span className="mobile-only">Hapus All</span>
            </button>
          </div>
        </div>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={
                      payments.length > 0 &&
                      selectedIds.length === payments.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Tanggal Bayar</th>
                <th>Rumah</th>
                <th>Penghuni</th>
                <th>Jenis</th>
                <th>Periode</th>
                <th>Jumlah</th>
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
                payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td>{p.house.house_number}</td>
                    <td>{p.resident.full_name}</td>
                    <td>
                      <span className="badge badge-success">
                        {p.payment_type}
                      </span>
                    </td>
                    <td>
                      {p.payment_period_start} s/d {p.payment_period_end}
                    </td>
                    <td>Rp {formatCurrency(p.amount)}</td>
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
            <h2 style={{ marginBottom: "1.5rem" }}>Input Pembayaran Baru</h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label>Pilih Rumah (Hanya yang berpenghuni)</label>
                <select
                  required
                  value={formData.house_id}
                  onChange={(e) => handleHouseChange(e.target.value)}
                >
                  <option value="">-- Pilih --</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.house_number} - {h.current_resident.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Jenis Iuran</label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      payment_type: val,
                      amount: val === "lainnya" ? 0 : formData.amount,
                    });
                  }}
                >
                  <option value="satpam">Satpam (Rp 100.000)</option>
                  <option value="kebersihan">Kebersihan (Rp 15.000)</option>
                  <option value="lainnya">Lainnya (Manual)</option>
                </select>
              </div>

              {formData.payment_type === "lainnya" && (
                <div>
                  <label>Masukkan Jumlah (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 50000"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <label>Periode Mulai</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_period_start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_period_start: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label>Periode Selesai</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_period_end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_period_end: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label>Total Bayar (Otomatis)</label>
                <input
                  type="number"
                  readOnly={formData.payment_type !== "lainnya"}
                  value={formData.amount}
                  style={{
                    background:
                      formData.payment_type === "lainnya"
                        ? "#fff"
                        : "var(--surface-muted)",
                  }}
                  onChange={(e) => {
                    if (formData.payment_type === "lainnya") {
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      });
                    }
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Memproses..." : "Proses Pembayaran"}
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

export default Payments;
