# FarmDirect — Abstract & System Flow

## Abstract

Farmers typically depend on wholesalers and middlemen to reach customers,
which shrinks their margins and gives buyers little visibility into price or
origin. **FarmDirect** is a web-based direct marketplace where farmers list
their produce at prices they set, and customers buy fresh farm products
directly — with transparent pricing, verified stock and order tracking. An
administrator role manages users, listings and orders across the platform.

## Objectives

1. Give farmers a direct channel to sell without intermediaries.
2. Let customers discover affordable, fresh produce with clear pricing.
3. Provide secure, role-based accounts for farmers, customers and admins.
4. Process cart checkout, stock updates and delivery in one workflow.
5. Give administrators platform-wide visibility and control.

## Backend flow

1. **Authentication**
   - A farmer or customer registers or logs in at `/api/auth/*`.
   - Passwords are hashed with BCrypt; the server issues a signed **JWT**.
   - Each request carries `Authorization: Bearer <token>`, validated by
     `JwtAuthFilter`. Roles gate access (`FARMER`, `CUSTOMER`, `ADMIN`).

2. **Farmer product management**
   - A farmer adds name, category, price, unit, stock, description, image and
     location. The listing is validated and stored against the farmer.
   - Listings can be updated, hidden or removed; stock is editable.

3. **Customer browsing**
   - `GET /api/products` returns active listings and supports filters for
     category, keyword, location, price range and availability.

4. **Cart & checkout**
   - The cart lives in the browser; checkout posts the lines to
     `POST /api/orders`.
   - The backend verifies availability, recalculates prices from the database,
     reduces stock, and creates **one order per farmer** so each farmer fulfils
     their own part of the basket.

5. **Payment**
   - Customers choose cash-on-delivery or online payment.
   - Online payments are marked paid with a transaction reference; cash payments
     stay pending until the farmer records collection.

6. **Farmer order management**
   - Farmers see their received orders and move them through
     Pending → Accepted → Processing → Packed → Dispatched → Delivered, with
     delivery-agent and payment updates.

7. **Delivery & completion**
   - Delivery status is tracked (pending, assigned, in transit, delivered) and
     the delivered timestamp is recorded when an order completes.

8. **Administration**
   - `/api/admin/**` (ADMIN only) exposes platform statistics, all users,
     listings and orders for management and reporting.

## Data model

- **User** — name, email (unique), password (BCrypt), role, phone, address,
  location, farm name, active flag.
- **Product** — belongs to a farmer; name, category, price, unit, stock,
  description, image, location, active flag.
- **Order** — belongs to a customer and a farmer; status, payment method/status,
  delivery details, total, and its line items.
- **OrderItem** — product snapshot (name, unit, unit price), quantity, subtotal.

## Technologies

React, Vite, Spring Boot, Java 17, Spring Security, JWT, Spring Data JPA, MySQL.

## Non-functional notes

- Stateless JWT authentication; passwords hashed with BCrypt.
- CORS enabled for the SPA; role-based authorization on product, order and
  admin routes.
- Centralised exception handling returns consistent JSON error payloads.
