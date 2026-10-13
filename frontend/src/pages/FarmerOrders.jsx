import { useEffect, useState } from 'react'
import api from '../api.js'
import {
  DELIVERY_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  currency,
  formatDateTime,
  statusLabel,
  statusTone
} from '../constants.js'

function FarmerOrderCard({ order, onChanged, onError }) {
  const [deliveryStatus, setDeliveryStatus] = useState(order.deliveryStatus)
  const [deliveryAgent, setDeliveryAgent] = useState(order.deliveryAgent || '')
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [paymentReference, setPaymentReference] = useState(order.paymentReference || '')
  const [busy, setBusy] = useState(false)

  const run = async (fn) => {
    setBusy(true)
    try {
      await fn()
      onChanged()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="page-head" style={{ marginBottom: 12 }}>
        <div>
          <div className="cell-title">
            Order #{order.orderId} · {order.customerName}
          </div>
          <div className="cell-sub">
            {order.customerEmail} · {order.contactPhone || order.customerPhone || '—'}
          </div>
          <div className="cell-sub">Placed {formatDateTime(order.createdAt)}</div>
        </div>
        <div className="row-actions">
          <span className={`badge ${statusTone(order.status)}`}>{statusLabel(order.status)}</span>
          <span className={`badge ${statusTone(order.paymentStatus)}`}>
            {order.paymentMethodLabel} · {statusLabel(order.paymentStatus)}
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
            {order.items.map((it, idx) => (
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

      <div className="cell-sub" style={{ marginTop: 10 }}>
        Deliver to {order.deliveryAddress}
        {order.notes ? ` · “${order.notes}”` : ''}
      </div>

      <div className="page-head" style={{ margin: '14px 0 0', alignItems: 'flex-end' }}>
        <div className="cell-title">Total: {currency(order.totalAmount)}</div>
        <strong>{order.farmName}</strong>
      </div>

      <div className="grid grid-3" style={{ marginTop: 14 }}>
        <div className="field">
          <label>Order status</label>
          <select
            value={order.status}
            disabled={busy}
            onChange={(e) =>
              run(() => api.updateOrderStatus(order.orderId, e.target.value))
            }
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Delivery</label>
          <div className="row-actions">
            <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}>
              {DELIVERY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Agent name"
              value={deliveryAgent}
              onChange={(e) => setDeliveryAgent(e.target.value)}
            />
            <button
              className="btn btn-sm btn-ghost"
              disabled={busy}
              onClick={() => run(() => api.updateOrderDelivery(order.orderId, { deliveryStatus, deliveryAgent }))}
            >
              Save
            </button>
          </div>
        </div>

        <div className="field">
          <label>Payment</label>
          <div className="row-actions">
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Reference"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
            <button
              className="btn btn-sm btn-ghost"
              disabled={busy}
              onClick={() => run(() => api.updateOrderPayment(order.orderId, { paymentStatus, paymentReference }))}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FarmerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setOrders(await api.farmerOrders())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Orders received</h1>
          <p>Accept, pack, dispatch and update payment for your orders.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">No orders to show.</div>
      ) : (
        filtered.map((o) => (
          <FarmerOrderCard key={o.orderId} order={o} onChanged={load} onError={setError} />
        ))
      )}
    </div>
  )
}
