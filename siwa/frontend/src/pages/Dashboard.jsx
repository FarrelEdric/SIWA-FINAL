import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Users, Home } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card" style={{ flex: 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
          Rp {value.toLocaleString('id-ID')}
        </h3>
      </div>
      <div style={{ padding: '0.75rem', background: `${color}20`, borderRadius: '0.75rem', color: color }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await dashboardService.getData();
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Pak RT. Here's what's happening with the neighborhood funds.</p>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <StatCard title="Pemasukan Bulan Ini" value={data.summary.total_income} icon={TrendingUp} color="#10b981" />
        <StatCard title="Pengeluaran Bulan Ini" value={data.summary.total_expense} icon={TrendingDown} color="#ef4444" />
        <StatCard title="Saldo Akhir" value={data.summary.balance} icon={Wallet} color="#6366f1" />
      </div>

      <div className="glass-card" style={{ height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Cashflow (12 Bulan Terakhir)</h3>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={data.chart}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip 
              contentStyle={{ background: '#1e1b4b', border: '1px solid var(--glass-border)', borderRadius: '0.5rem' }}
              itemStyle={{ color: 'white' }}
            />
            <Area type="monotone" dataKey="income" stroke="#6366f1" fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Transaksi Pemasukan Terbaru</h3>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Rumah</th>
                <th>Tipe</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.details.income.slice(0, 5).map(item => (
                <tr key={item.id}>
                  <td>{new Date(item.payment_date).toLocaleDateString()}</td>
                  <td>{item.house.house_number}</td>
                  <td><span className="badge badge-success">{item.payment_type}</span></td>
                  <td>Rp {item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Transaksi Pengeluaran Terbaru</h3>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.details.expense.slice(0, 5).map(item => (
                <tr key={item.id}>
                  <td>{new Date(item.expense_date).toLocaleDateString()}</td>
                  <td>{item.title}</td>
                  <td><span className="badge badge-warning">{item.category}</span></td>
                  <td>Rp {item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
