import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Market from './pages/Market.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import FarmerDashboard from './pages/FarmerDashboard.jsx'
import FarmerProducts from './pages/FarmerProducts.jsx'
import FarmerOrders from './pages/FarmerOrders.jsx'
import Admin from './pages/Admin.jsx'
import { getRole, isLoggedIn } from './api.js'

export function homeFor(role) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'FARMER') return '/farmer'
  if (role === 'CUSTOMER') return '/market'
  return '/'
}

function RequireRole({ roles, children }) {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  const role = getRole()
  if (roles && !roles.includes(role)) {
    return <Navigate to={homeFor(role)} replace />
  }
  return children
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/market" element={<Market />} />
          <Route
            path="/cart"
            element={
              <RequireRole roles={['CUSTOMER']}>
                <Cart />
              </RequireRole>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireRole roles={['CUSTOMER']}>
                <Orders />
              </RequireRole>
            }
          />
          <Route
            path="/farmer"
            element={
              <RequireRole roles={['FARMER']}>
                <FarmerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/farmer/products"
            element={
              <RequireRole roles={['FARMER']}>
                <FarmerProducts />
              </RequireRole>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <RequireRole roles={['FARMER']}>
                <FarmerOrders />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole roles={['ADMIN']}>
                <Admin />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        FarmDirect · Farmer-to-Customer Direct Marketplace
      </footer>
    </div>
  )
}
