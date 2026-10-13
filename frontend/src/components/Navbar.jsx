import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearAuth, getRole, getUser, isLoggedIn } from '../api.js'
import { useCart } from '../cart.jsx'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const role = getRole()
  const user = getUser()
  const { count } = useCart()

  const logout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">FD</span>
          <span className="brand-text">
            Farm<strong>Direct</strong>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/market">Market</NavLink>
          {loggedIn && role === 'CUSTOMER' && (
            <>
              <NavLink to="/cart">
                Cart{count > 0 && <span className="nav-badge">{count}</span>}
              </NavLink>
              <NavLink to="/orders">My orders</NavLink>
            </>
          )}
          {loggedIn && role === 'FARMER' && (
            <>
              <NavLink to="/farmer">Dashboard</NavLink>
              <NavLink to="/farmer/products">My products</NavLink>
              <NavLink to="/farmer/orders">Orders</NavLink>
            </>
          )}
          {loggedIn && role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="nav-actions">
          {loggedIn ? (
            <>
              <span className="nav-user" title={user?.email || ''}>
                {user?.name || 'Account'}
              </span>
              <button className="btn btn-ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/register">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
