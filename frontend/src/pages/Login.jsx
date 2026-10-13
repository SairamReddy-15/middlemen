import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api.js'
import { homeFor } from '../App.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api.loginAndStore(form)
      const from = location.state?.from
      navigate(from || homeFor(data.role))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card">
        <h1>Welcome back</h1>
        <p className="sub">Sign in to buy fresh produce or manage your farm listings.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={change}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={change}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-alt">
          New to FarmDirect? <Link to="/register">Create an account</Link>
        </p>

        <div className="demo-hint">
          <strong>Demo accounts</strong>
          <br />
          Admin — admin@farmdirect.com / Admin@123
          <br />
          Farmer — ramesh.kumar@farmdirect.dev / Farmer@123
          <br />
          Customer — priya.sharma@farmdirect.dev / Customer@123
        </div>
      </div>
    </div>
  )
}
