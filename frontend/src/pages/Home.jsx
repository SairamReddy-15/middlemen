import { Link } from 'react-router-dom'
import { getRole, isLoggedIn } from '../api.js'
import { homeFor } from '../App.jsx'

const features = [
  {
    icon: '01',
    title: 'Farm-fresh, straight from the source',
    text: 'Customers browse vegetables, fruits, grains, dairy and spices listed directly by local farmers — no wholesalers, no middlemen.'
  },
  {
    icon: '02',
    title: 'Fair prices for every farmer',
    text: 'Farmers set their own price and stock, and keep the full value of every sale instead of losing margin to intermediaries.'
  },
  {
    icon: '03',
    title: 'Search, cart and checkout',
    text: 'Filter by category, location or price, add produce to the cart and place an order with cash-on-delivery or online payment.'
  },
  {
    icon: '04',
    title: 'Track every order',
    text: 'Farmers accept, pack and dispatch orders; customers follow the status from pending to delivered. Admins see the whole marketplace.'
  }
]

export default function Home() {
  const loggedIn = isLoggedIn()
  const role = getRole()

  const primary = loggedIn
    ? { to: homeFor(role), label: role === 'ADMIN' ? 'Open admin dashboard' : role === 'FARMER' ? 'Open farmer dashboard' : 'Browse the market' }
    : { to: '/register', label: 'Create free account' }

  return (
    <div>
      <section className="hero">
        <span className="badge progress" style={{ marginBottom: 14 }}>
          Farmer-to-customer direct marketplace
        </span>
        <h1>
          Fresh from the farm, <span>direct to your door</span>
        </h1>
        <p>
          FarmDirect connects farmers and customers without middlemen. Farmers sell their harvest at
          fair prices, and customers buy affordable, fresh farm produce with full transparency.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to={primary.to}>
            {primary.label}
          </Link>
          <Link className="btn btn-ghost" to="/market">
            Explore the market
          </Link>
        </div>
      </section>

      <section className="grid grid-2">
        {features.map((f) => (
          <div className="card" key={f.icon}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
              {f.text}
            </p>
          </div>
        ))}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h3>How it works</h3>
        <ol className="muted" style={{ lineHeight: 1.9, margin: 0, paddingLeft: 20 }}>
          <li>Farmers register, list their produce with a price and stock, and manage availability.</li>
          <li>Customers sign up, browse the market and add items to their cart.</li>
          <li>At checkout an order is created per farmer; stock is verified and updated.</li>
          <li>Farmers accept and fulfil orders while customers track the status to delivery.</li>
        </ol>
      </section>
    </div>
  )
}
