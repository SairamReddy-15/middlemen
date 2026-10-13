const BASE = '/api'

function getToken() {
  return localStorage.getItem('fd_token') || ''
}

function setAuth(token, role, user) {
  localStorage.setItem('fd_token', token)
  localStorage.setItem('fd_role', role)
  if (user) localStorage.setItem('fd_user', JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem('fd_token')
  localStorage.removeItem('fd_role')
  localStorage.removeItem('fd_user')
}

export function isLoggedIn() {
  return !!localStorage.getItem('fd_token')
}

export function getRole() {
  return localStorage.getItem('fd_role') || ''
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('fd_user') || 'null')
  } catch {
    return null
  }
}

export { clearAuth }

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }
  if (!res.ok) {
    if (res.status === 401) clearAuth()
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data
}

function qs(params = {}) {
  return new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString()
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  me: () => request('/auth/me'),
  registerAndStore: async (body) => {
    const data = await api.register(body)
    setAuth(data.token, data.role, data.user)
    return data
  },
  loginAndStore: async (body) => {
    const data = await api.login(body)
    setAuth(data.token, data.role, data.user)
    return data
  },

  // marketplace (public)
  products: (params = {}) => {
    const q = qs(params)
    return request(`/products${q ? `?${q}` : ''}`, { auth: false })
  },
  product: (id) => request(`/products/${id}`, { auth: false }),

  // farmer product management
  myProducts: () => request('/products/mine'),
  createProduct: (body) => request('/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // customer orders
  checkout: (body) => request('/orders', { method: 'POST', body }),
  myOrders: () => request('/orders'),
  order: (id) => request(`/orders/${id}`),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),

  // farmer order management
  farmerOrders: () => request('/orders/farmer'),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  updateOrderDelivery: (id, body) => request(`/orders/${id}/delivery`, { method: 'PATCH', body }),
  updateOrderPayment: (id, body) => request(`/orders/${id}/payment`, { method: 'PATCH', body }),

  // admin
  adminStats: () => request('/admin/stats'),
  adminUsers: () => request('/admin/users'),
  setUserActive: (id, active) => request(`/admin/users/${id}/status?active=${active}`, { method: 'PATCH' }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminProducts: () => request('/admin/products'),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  adminOrders: () => request('/admin/orders'),
  adminUpdateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  adminUpdateOrderDelivery: (id, body) => request(`/admin/orders/${id}/delivery`, { method: 'PATCH', body }),
  adminUpdateOrderPayment: (id, body) => request(`/admin/orders/${id}/payment`, { method: 'PATCH', body })
}

export default api
