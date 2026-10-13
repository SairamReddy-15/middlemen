import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getUser } from '../api.js'
import { currency, formatDateTime, statusLabel, statusTone } from '../constants.js'

export default function FarmerDashboard() {
  const user = getUser()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([api.myProducts(), api.farmerOrders()])
      .then(([p, o]) => {
        if (!active) return
        setProducts(p)
        setOrders(o)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const inStock = products.filter((p) => p.inStock).length
  const lowStock = products.filter((p) => p.stockQuantity <= 5).length
  const pending = orders.filter((o) => o.status === 'PENDING').length
  const revenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  const recent = orders.slice(0, 5)

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Hi {user?.name?.split(' ')[0] || 'farmer'} 🌾</h1>
          <p>{user?.farmName || 'Your farm'} · manage listings and fulfil orders.</p>
        </div>
        <div className="row-actions">
          <Link className="btn btn-primary" to="/farmer/products">
            Manage products
          </Link>
          <Link className="btn btn-ghost" to="/farmer/orders">
            View orders
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="alert alert-info">Loading your dashboard…</div>}

      {!loading && (
        <>
          <section className="grid grid-4" style={{ marginBottom: 20 }}>
            <div className="stat">
              <div className="stat-label">Listings</div>
              <div className="stat-value">{products.length}</div>
            </div>
            <div className="stat">
              <div className="stat-label">In stock</div>
              <div className="stat-value">{inStock}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Pending orders</div>
              <div className="stat-value" style={{ color: pending ? 'var(--warn)' : undefined }}>
                {pending}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Sales value</div>
              <div className="stat-value">{currency(revenue)}</div>
            </div>
          </section>

          {lowStock > 0 && (
            <div className="alert alert-info">
              {lowStock} listing(s) have 5 or fewer units left. Update your stock to keep selling.
            </div>
          )}

          <section className="card">
            <div className="page-head" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Recent orders</h3>
              <Link className="btn btn-sm btn-ghost" to="/farmer/orders">
                Manage all
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                No orders yet. Keep your listings fresh to attract customers.
              </p>
            ) : (
              recent.map((o) => (
                <div className="deadline-item" key={o.orderId}>
                  <div className="deadline-body">
                    <div className="t">
                      Order #{o.orderId} · {o.customerName}
                    </div>
                    <div className="s">
                      {o.itemCount} item(s) · {currency(o.totalAmount)} · {o.paymentMethodLabel}
                    </div>
                    <div className="s">{formatDateTime(o.createdAt)}</div>
                  </div>
                  <span className={`badge ${statusTone(o.status)}`}>{statusLabel(o.status)}</span>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  )
}
