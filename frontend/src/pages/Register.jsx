import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api.js'
import { homeFor } from '../App.jsx'

const initial = {
  role: 'CUSTOMER',
  name: '',
  email: '',
  password: '',
  phone: '',
  location: '',
  address: '',
  farmName: ''
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const isFarmer = form.role === 'FARMER'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api.registerAndStore(form)
      navigate(homeFor(data.role))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card">
        <h1>Create your account</h1>
        <p className="sub">Join as a farmer to sell, or as a customer to buy fresh produce.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="role-picker" style={{ marginBottom: 18 }}>
          <button
            type="button"
            className={`role-option ${form.role === 'CUSTOMER' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'CUSTOMER' })}
          >
            <div className="r-title">🛒 Customer</div>
            <div className="r-sub">Buy fresh farm produce</div>
          </button>
          <button
            type="button"
            className={`role-option ${form.role === 'FARMER' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'FARMER' })}
          >
            <div className="r-title">🌾 Farmer</div>
            <div className="r-sub">Sell your harvest directly</div>
          </button>
        </div>

        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={change} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={change} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              value={form.password}
              onChange={change}
              required
            />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={change} />
            </div>
            <div className="field">
              <label htmlFor="location">City / region</label>
              <input id="location" name="location" value={form.location} onChange={change} />
            </div>
          </div>
          {isFarmer && (
            <div className="field">
              <label htmlFor="farmName">Farm name</label>
              <input
                id="farmName"
                name="farmName"
                value={form.farmName}
                onChange={change}
                placeholder="e.g. Kumar Organic Farm"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="address">{isFarmer ? 'Farm address' : 'Delivery address'}</label>
            <textarea id="address" name="address" value={form.address} onChange={change} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : `Create ${isFarmer ? 'farmer' : 'customer'} account`}
          </button>
        </form>

        <p className="auth-alt">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
