import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../api.js'
import { currency, formatDateTime, statusLabel, statusTone } from '../constants.js'

const CANCELLABLE = ['PENDING', 'ACCEPTED', 'PROCESSING', 'PACKED']

export default function Orders() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setOrders(await api.myOrders())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location.state?.placed) {
      setNotice(`Order placed — sent to ${location.state.placed} farmer(s).`)
      setTimeout(() => setNotice(''), 4000)
    }
    load()
  }, [location.state])

  const cancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.orderId}?`)) return
    try {
      await api.cancelOrder(order.orderId)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>My orders</h1>
          <p>Track every order from placement to delivery.</p>
        </div>
        <Link className="btn btn-ghost" to="/market">
          Shop more
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}
      {loading && <div className="alert alert-info">Loading your orders…</div>}

      {!loading && orders.length === 0 && (
        <div className="empty">
          You have not placed any orders yet. <Link to="/market">Go to the market →</Link>
        </div>
      )}

      {!loading &&
        orders.map((o) => (
          <div className="card" key={o.orderId} style={{ marginBottom: 16 }}>
            <div className="page-head" style={{ marginBottom: 12 }}>
              <div>
                <div className="cell-title">
                  Order #{o.orderId} · {o.farmName || o.farmerName}
                </div>
                <div className="cell-sub">Placed {formatDateTime(o.createdAt)}</div>
              </div>
              <div className="row-actions">
                <span className={`badge ${statusTone(o.status)}`}>{statusLabel(o.status)}</span>
                <span className={`badge ${statusTone(o.paymentStatus)}`}>
                  {o.paymentMethodLabel} · {statusLabel(o.paymentStatus)}
                </span>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.productName}</td>
                      <td>
                        {it.quantity} {it.unit}
                      </td>
                      <td>{currency(it.unitPrice)}</td>
                      <td>{currency(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="page-head" style={{ margin: '12px 0 0' }}>
              <div className="cell-sub">
                Deliver to {o.deliveryAddress}
                {o.deliveryAgent ? ` · ${o.deliveryAgent}` : ''}
                {o.deliveredAt ? ` · delivered ${formatDateTime(o.deliveredAt)}` : ''}
              </div>
              <div className="row-actions">
                <span className="badge neutral">Delivery: {o.deliveryStatusLabel}</span>
                <strong>{currency(o.totalAmount)}</strong>
                {CANCELLABLE.includes(o.status) && (
                  <button className="btn btn-sm btn-danger" onClick={() => cancel(o)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
