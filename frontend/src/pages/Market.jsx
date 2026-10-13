import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getRole, isLoggedIn } from '../api.js'
import { useCart } from '../cart.jsx'
import { PRODUCT_CATEGORIES, currency, categoryLabel } from '../constants.js'

const EMOJI = {
  VEGETABLES: '🥬',
  FRUITS: '🥭',
  GRAINS: '🌾',
  PULSES: '🫘',
  DAIRY: '🥛',
  SPICES: '🌶️',
  OTHER: '🧺'
}

export default function Market() {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const role = getRole()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [category, setCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStock, setInStock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.products({
        category,
        keyword,
        location,
        maxPrice: maxPrice === '' ? undefined : Number(maxPrice),
        inStock: inStock ? true : undefined
      })
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [category, keyword, location, maxPrice, inStock])

  useEffect(() => {
    load()
  }, [load])

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2500)
  }

  const add = (product) => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: '/market' } })
      return
    }
    if (role !== 'CUSTOMER') {
      flash('Switch to a customer account to add items to a cart.')
      return
    }
    addItem(product, 1)
    flash(`Added ${product.name} to your cart.`)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Market</h1>
          <p>Fresh produce listed directly by farmers near you.</p>
        </div>
        {role === 'CUSTOMER' && (
          <button className="btn btn-ghost" onClick={() => navigate('/cart')}>
            View cart
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="chip-row">
        <button className={`chip ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>
          All
        </button>
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`chip ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {EMOJI[c.value]} {c.label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <input placeholder="Search produce, farm or description…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input
          type="number"
          min="0"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ minWidth: 120, flex: 'none' }}
        />
        <label className="badge neutral" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only
        </label>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading the market…</div>
      ) : items.length === 0 ? (
        <div className="empty">No produce matches your filters yet.</div>
      ) : (
        <div className="product-grid">
          {items.map((p) => (
            <div className="product-card" key={p.productId}>
              <div className="product-img">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : EMOJI[p.category] || '🧺'}
              </div>
              <div className="product-body">
                <div className="product-name">{p.name}</div>
                <div className="product-meta">
                  <span>{categoryLabel(p.category)}</span>
                  {p.location && <span>· {p.location}</span>}
                </div>
                <div className="product-meta">
                  <span>🌾 {p.farmName || p.farmerName}</span>
                </div>
                <div className="product-price">
                  {currency(p.price)} <span>/ {p.unit}</span>
                </div>
                {p.inStock ? (
                  <div className="product-meta">
                    <span>{p.stockQuantity} {p.unit} available</span>
                  </div>
                ) : (
                  <div className="stock-out">Out of stock</div>
                )}
                <div className="product-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!p.inStock}
                    onClick={() => add(p)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
