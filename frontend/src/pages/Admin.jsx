import { useEffect, useState } from 'react'
import api from '../api.js'
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PRODUCT_CATEGORIES,
  categoryLabel,
  currency,
  formatDateTime,
  statusLabel,
  statusTone
} from '../constants.js'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'users', label: 'Users' },
  { value: 'products', label: 'Products' },
  { value: 'orders', label: 'Orders' }
]

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  const loadTab = async (which) => {
    setLoading(true)
    setError('')
    try {
      if (which === 'overview') setStats(await api.adminStats())
      if (which === 'users') setUsers(await api.adminUsers())
      if (which === 'products') setProducts(await api.adminProducts())
      if (which === 'orders') setOrders(await api.adminOrders())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTab(tab)
  }, [tab])

  const toggleUser = async (u) => {
    try {
      await api.setUserActive(u.userId, !u.active)
      flash(`User ${u.active ? 'deactivated' : 'activated'}.`)
      loadTab('users')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return
    try {
      await api.deleteUser(u.userId)
      flash('User deleted.')
      loadTab('users')
    } catch (err) {
      setError(err.message)
    }
  }

  const removeProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return
    try {
      await api.adminDeleteProduct(p.productId)
      flash('Product deleted.')
      loadTab('products')
    } catch (err) {
      setError(err.message)
    }
  }

  const changeOrderStatus = async (o, status) => {
    try {
      await api.adminUpdateOrderStatus(o.orderId, status)
      loadTab('orders')
    } catch (err) {
      setError(err.message)
    }
  }

  const changeOrderPayment = async (o, paymentStatus) => {
    try {
      await api.adminUpdateOrderPayment(o.orderId, { paymentStatus, paymentReference: o.paymentReference })
      loadTab('orders')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Admin dashboard</h1>
          <p>Manage users, products and orders across the marketplace.</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.value} className={tab === t.value ? 'active' : ''} onClick={() => setTab(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}
      {loading && <div className="alert alert-info">Loading…</div>}

      {tab === 'overview' && stats && !loading && (
        <>
          <section className="grid grid-4" style={{ marginBottom: 20 }}>
            <div className="stat">
              <div className="stat-label">Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Farmers</div>
              <div className="stat-value">{stats.totalFarmers}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Customers</div>
              <div className="stat-value">{stats.totalCustomers}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Orders</div>
              <div className="stat-value">{stats.totalOrders}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Products</div>
              <div className="stat-value">{stats.totalProducts}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Active listings</div>
              <div className="stat-value">{stats.activeProducts}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Pending orders</div>
              <div className="stat-value" style={{ color: stats.pendingOrders ? 'var(--warn)' : undefined }}>
                {stats.pendingOrders}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Sales value</div>
              <div className="stat-value">{currency(stats.totalRevenue)}</div>
            </div>
          </section>

          <section className="card" style={{ marginBottom: 20 }}>
            <h3>Orders by status</h3>
            <div className="pipeline">
              {ORDER_STATUSES.map((s) => (
                <div key={s.value} className="stat" style={{ boxShadow: 'none' }}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{stats.ordersByStatus?.[s.value] ?? 0}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>Products by category</h3>
            <div className="pipeline">
              {PRODUCT_CATEGORIES.map((c) => (
                <div key={c.value} className="stat" style={{ boxShadow: 'none' }}>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value">{stats.productsByCategory?.[c.value] ?? 0}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === 'users' && !loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Location</th>
                <th>Farm</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td>
                    <div className="cell-title">{u.name}</div>
                    <div className="cell-sub">{u.email}</div>
                  </td>
                  <td>
                    <span className="badge neutral">{u.role}</span>
                  </td>
                  <td>{u.location || '—'}</td>
                  <td>{u.farmName || '—'}</td>
                  <td>{u.productCount}</td>
                  <td>{u.orderCount}</td>
                  <td>
                    <span className={`badge ${u.active ? 'success' : 'danger'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => toggleUser(u)}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                      {u.role !== 'ADMIN' && (
                        <button className="btn btn-sm btn-danger" onClick={() => removeUser(u)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && !loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Farmer</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId}>
                  <td>
                    <div className="cell-title">{p.name}</div>
                    {p.location && <div className="cell-sub">{p.location}</div>}
                  </td>
                  <td>
                    <div className="cell-title">{p.farmName || p.farmerName}</div>
                    <div className="cell-sub">{p.farmerName}</div>
                  </td>
                  <td>{categoryLabel(p.category)}</td>
                  <td>
                    {currency(p.price)} / {p.unit}
                  </td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <span className={`badge ${p.active ? 'success' : 'neutral'}`}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => removeProduct(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && !loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Farmer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId}>
                  <td>
                    <div className="cell-title">#{o.orderId}</div>
                    <div className="cell-sub">{o.itemCount} item(s)</div>
                  </td>
                  <td>
                    <div className="cell-title">{o.customerName}</div>
                    <div className="cell-sub">{o.customerEmail}</div>
                  </td>
                  <td>{o.farmName || o.farmerName}</td>
                  <td>{currency(o.totalAmount)}</td>
                  <td>
                    <select
                      className="badge"
                      value={o.paymentStatus}
                      onChange={(e) => changeOrderPayment(o, e.target.value)}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="badge"
                      value={o.status}
                      onChange={(e) => changeOrderStatus(o, e.target.value)}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
