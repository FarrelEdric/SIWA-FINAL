import React, { useEffect, useState } from "react";
import { paymentService, houseService } from "../services/api";
import { CreditCard, Search, Calendar } from "lucide-react";
import Swal from "sweetalert2";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
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

  useEffect(() => {
    fetchHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPayments();
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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAll({ page, per_page: perPage });
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
      });
    }
  };

  const handleHouseChange = async (houseId) => {
    const house = houses.find((h) => h.id == houseId);
    if (house) {
      try {
        const res = await paymentService.calculate({
          house_id: houseId,
          payment_type: formData.payment_type,
        });
        setFormData({
          ...formData,
          house_id: houseId,
          resident_id: house.current_resident.id,
          amount: res.data.amount,
        });
      } catch (error) {
        console.error(error);
        await Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Tidak bisa menghitung tagihan.",
        });
      }
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
      });
      setShowModal(false);
      // Refresh first page after new payment
      const res = await paymentService.getAll({ page: 1, per_page: perPage });
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <CreditCard size={20} />
          Input Pembayaran
        </button>
      </header>

      <div className="glass-card">
        <table>
          <thead>
            <tr>
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
                  <td>Rp {p.amount.toLocaleString()}</td>
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
                  onChange={(e) =>
                    setFormData({ ...formData, payment_type: e.target.value })
                  }
                >
                  <option value="satpam">Satpam (Rp 100.000)</option>
                  <option value="kebersihan">Kebersihan (Rp 15.000)</option>
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
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
                  readOnly
                  value={formData.amount}
                  style={{ background: "var(--surface-muted)" }}
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
