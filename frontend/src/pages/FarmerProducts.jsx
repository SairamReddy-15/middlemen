import { useCallback, useEffect, useState } from 'react'
import api from '../api.js'
import { PRODUCT_CATEGORIES, UNITS, currency, categoryLabel } from '../constants.js'

const blank = {
  name: '',
  category: 'VEGETABLES',
  description: '',
  price: '',
  unit: 'kg',
  stockQuantity: '',
  imageUrl: '',
  location: '',
  active: true
}

export default function FarmerProducts() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await api.myProducts())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  const change = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const openAdd = () => {
    setForm(blank)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setForm({
      name: item.name,
      category: item.category,
      description: item.description || '',
      price: item.price ?? '',
      unit: item.unit || 'kg',
      stockQuantity: item.stockQuantity ?? '',
      imageUrl: item.imageUrl || '',
      location: item.location || '',
      active: item.active
    })
    setEditingId(item.productId)
    setShowForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        price: form.price === '' ? 0 : Number(form.price),
        stockQuantity: form.stockQuantity === '' ? 0 : Number(form.stockQuantity)
      }
      if (editingId) {
        await api.updateProduct(editingId, payload)
        flash('Listing updated.')
      } else {
        await api.createProduct(payload)
        flash('Listing added.')
      }
      setShowForm(false)
      setForm(blank)
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete the listing "${item.name}"?`)) return
    try {
      await api.deleteProduct(item.productId)
      flash('Listing deleted.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>My products</h1>
          <p>List your harvest, set prices and manage stock.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add product
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>{editingId ? 'Edit listing' : 'New listing'}</h3>
          <form className="form" onSubmit={submit}>
            <div className="form-row">
              <div className="field">
                <label>Product name</label>
                <input name="name" value={form.name} onChange={change} required />
              </div>
              <div className="field">
                <label>Category</label>
                <select name="category" value={form.category} onChange={change}>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Price (₹)</label>
                <input name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={change} required />
              </div>
              <div className="field">
                <label>Unit</label>
                <select name="unit" value={form.unit} onChange={change}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Stock quantity</label>
                <input
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={change}
                  required
                />
              </div>
              <div className="field">
                <label>Location</label>
                <input name="location" value={form.location} onChange={change} />
              </div>
            </div>
            <div className="field">
              <label>Image URL (optional)</label>
              <input name="imageUrl" value={form.imageUrl} onChange={change} placeholder="https://…" />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={change} />
            </div>
            <div className="field">
              <label className="badge neutral" style={{ cursor: 'pointer' }}>
                <input type="checkbox" name="active" checked={form.active} onChange={change} /> Listing is visible in the market
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="alert alert-info">Loading your listings…</div>
      ) : items.length === 0 ? (
        <div className="empty">No listings yet. Add your first product to start selling.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.productId}>
                  <td>
                    <div className="cell-title">{p.name}</div>
                    {p.location && <div className="cell-sub">{p.location}</div>}
                  </td>
                  <td>{categoryLabel(p.category)}</td>
                  <td>
                    {currency(p.price)} / {p.unit}
                  </td>
                  <td style={{ color: p.stockQuantity <= 5 ? 'var(--danger)' : undefined }}>
                    {p.stockQuantity} {p.unit}
                  </td>
                  <td>
                    <span className={`badge ${p.active ? 'success' : 'neutral'}`}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
