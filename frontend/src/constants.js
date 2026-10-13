export const PRODUCT_CATEGORIES = [
  { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'FRUITS', label: 'Fruits' },
  { value: 'GRAINS', label: 'Grains & Cereals' },
  { value: 'PULSES', label: 'Pulses & Legumes' },
  { value: 'DAIRY', label: 'Dairy & Milk' },
  { value: 'SPICES', label: 'Spices & Herbs' },
  { value: 'OTHER', label: 'Other' }
]

export const UNITS = ['kg', 'gram', 'litre', 'dozen', 'bunch', 'piece', 'quintal']

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending', tone: 'info' },
  { value: 'ACCEPTED', label: 'Accepted', tone: 'progress' },
  { value: 'PROCESSING', label: 'Processing', tone: 'progress' },
  { value: 'PACKED', label: 'Packed', tone: 'soon' },
  { value: 'DISPATCHED', label: 'Dispatched', tone: 'soon' },
  { value: 'DELIVERED', label: 'Delivered', tone: 'success' },
  { value: 'COMPLETED', label: 'Completed', tone: 'success' },
  { value: 'REJECTED', label: 'Rejected', tone: 'danger' },
  { value: 'CANCELLED', label: 'Cancelled', tone: 'neutral' }
]

export const DELIVERY_STATUSES = [
  { value: 'PENDING', label: 'Pending', tone: 'neutral' },
  { value: 'ASSIGNED', label: 'Assigned', tone: 'info' },
  { value: 'IN_TRANSIT', label: 'In transit', tone: 'soon' },
  { value: 'DELIVERED', label: 'Delivered', tone: 'success' }
]

export const PAYMENT_METHODS = [
  { value: 'CASH_ON_DELIVERY', label: 'Cash on delivery' },
  { value: 'ONLINE', label: 'Online payment' }
]

export const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending', tone: 'soon' },
  { value: 'PAID', label: 'Paid', tone: 'success' },
  { value: 'FAILED', label: 'Failed', tone: 'danger' },
  { value: 'REFUNDED', label: 'Refunded', tone: 'neutral' }
]

const ALL = [...ORDER_STATUSES, ...DELIVERY_STATUSES, ...PAYMENT_STATUSES]

export function statusTone(status) {
  const found = ALL.find((s) => s.value === status)
  return found ? found.tone : 'neutral'
}

export function statusLabel(status) {
  const found = ALL.find((s) => s.value === status)
  return found ? found.label : status
}

export function categoryLabel(value) {
  const found = PRODUCT_CATEGORIES.find((c) => c.value === value)
  return found ? found.label : value
}

export const currency = (value) =>
  value === null || value === undefined ? '' : `₹${Number(value).toLocaleString('en-IN')}`

export const currencyOrNa = (value) => (value === null || value === undefined ? '—' : currency(value))

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const today = () => new Date().toISOString().split('T')[0]
