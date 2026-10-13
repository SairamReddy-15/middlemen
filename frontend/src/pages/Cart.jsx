import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getUser } from '../api.js'
import { useCart } from '../cart.jsx'
import { PAYMENT_METHODS, currency } from '../constants.js'

export default function Cart() {
  const navigate = useNavigate()
  const { items, setQuantity, removeItem, clear, total, count } = useCart()
  const user = getUser()
  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    contactPhone: user?.phone || '',
    paymentMethod: 'CASH_ON_DELIVERY',
    notes: ''
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const orders = await api.checkout({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: form.deliveryAddress,
        contactPhone: form.contactPhone,
        paymentMethod: form.paymentMethod,
        notes: form.notes
      })
      clear()
      navigate('/orders', { state: { placed: orders.length } })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (count === 0) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1>Your cart</h1>
            <p>Add fresh produce from the market to get started.</p>
          </div>
        </div>
        <div className="empty">
          Your cart is empty. <Link to="/market">Browse the market →</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Your cart</h1>
          <p>{count} item(s) ready for checkout.</p>
        </div>
        <Link className="btn btn-ghost" to="/market">
          Continue shopping
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="cart-layout">
        <div className="card">
          {items.map((i) => (
            <div className="cart-line" key={i.productId}>
              <div className="cart-thumb">🧺</div>
              <div className="cart-info">
                <div className="cell-title">{i.name}</div>
                <div className="cell-sub">
                  {i.farmName || i.farmerName} · {currency(i.price)} / {i.unit}
                </div>
              </div>
              <div className="qty">
                <button type="button" onClick={() => setQuantity(i.productId, i.quantity - 1)}>
                  −
                </button>
                <input
                  value={i.quantity}
                  onChange={(e) => setQuantity(i.productId, Number(e.target.value) || 0)}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(i.productId, Math.min(i.stockQuantity ?? 9999, i.quantity + 1))}
                >
                  +
                </button>
              </div>
              <div style={{ minWidth: 90, textAlign: 'right', fontWeight: 700 }}>
                {currency(i.price * i.quantity)}
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => removeItem(i.productId)}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="card summary">
          <h3>Delivery &amp; payment</h3>
          <form className="form" onSubmit={submit}>
            <div className="field">
              <label>Delivery address</label>
              <textarea
                name="deliveryAddress"
                value={form.deliveryAddress}
                onChange={change}
                required
              />
            </div>
            <div className="field">
              <label>Contact phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={change} />
            </div>
            <div className="field">
              <label>Payment method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={change}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Notes for the farmer (optional)</label>
              <input name="notes" value={form.notes} onChange={change} />
            </div>

            <div className="summary-row">
              <span>Items</span>
              <span>{count}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>Calculated by farmer</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{currency(total)}</span>
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? 'Placing order…' : 'Place order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
