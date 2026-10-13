# FarmDirect

**Farmer-to-Customer Direct Marketplace**

FarmDirect is a full-stack web application that connects farmers directly with
customers, removing wholesalers and middlemen from the supply chain. Farmers
list their produce at fair prices; customers browse, order and track fresh farm
products; administrators manage the whole marketplace.

---

## Tech stack

| Layer     | Technology                                                |
| --------- | --------------------------------------------------------- |
| Frontend  | React 18, Vite, React Router                              |
| Backend   | Spring Boot 3, Spring Security, Spring Data JPA, JWT      |
| Language  | Java 17                                                   |
| Database  | MySQL 8                                                   |
| Build     | Maven (backend), npm/Vite (frontend)                      |

## Features

**Farmers**
- Register / log in with JWT-based authentication.
- Add, edit and delete product listings (name, category, price, unit, stock,
  description, image, location) and hide or show a listing.
- Receive orders, then accept/reject and move them through
  **Pending → Accepted → Processing → Packed → Dispatched → Delivered**.
- Assign a delivery agent and record cash/online payment status.
- A dashboard with listings, stock alerts, pending orders and sales value.

**Customers**
- Register / log in, browse the market and filter by category, location, price
  or availability.
- Add produce to a cart and check out with cash-on-delivery or online payment.
- Track every order's status and delivery, and cancel before dispatch.

**Admin**
- Platform statistics (users, farmers, customers, products, orders, sales value).
- Manage all accounts (activate / deactivate / delete) and listings.
- View and update every order across the marketplace.

## Project structure

```
sairam/
├── backend/            Spring Boot API (Java 17)
│   ├── Dockerfile
│   └── src/main/java/com/farmdirect/
│       ├── config/      SecurityConfig, DataSeeder
│       ├── controller/  Auth, Product, Order, Admin, Health
│       ├── dto/         request/response models
│       ├── exception/   ApiException + global handler
│       ├── model/       User, Product, Order, OrderItem, enums
│       ├── repository/  Spring Data JPA repositories
│       ├── security/    JWT filter, service, user details
│       └── service/     business logic
├── frontend/           React + Vite single-page app
│   └── src/{components,pages}
├── database/           farmdirect_db.sql (reference schema)
├── render.yaml         Render backend deployment
├── start-backend.bat   Run the API locally
└── start-frontend.bat  Run the UI locally
```

## Running locally

Prerequisites: **Java 17+**, **Maven 3.9+**, **Node 18+**, **MySQL 8**.

1. **Database** — create an empty MySQL database (the app creates tables on
   first run):
   ```sql
   CREATE DATABASE farmdirect_db;
   ```
   Default credentials used by the backend are `root` / `root`. Override them
   with the `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`
   environment variables (or edit `backend/src/main/resources/application.properties`).

2. **Backend**
   ```bat
   start-backend.bat
   ```
   API runs at `http://localhost:8080` (health check: `/api/health`).

3. **Frontend**
   ```bat
   start-frontend.bat
   ```
   UI runs at `http://localhost:5173` and proxies `/api` to the backend.

## Demo accounts

Seeded automatically on first start:

| Role     | Email                            | Password      |
| -------- | -------------------------------- | ------------- |
| Admin    | admin@farmdirect.com             | Admin@123     |
| Farmer   | ramesh.kumar@farmdirect.dev      | Farmer@123    |
| Farmer   | sunita.patel@farmdirect.dev      | Farmer@123    |
| Farmer   | mohammed.ali@farmdirect.dev      | Farmer@123    |
| Customer | priya.sharma@farmdirect.dev      | Customer@123  |
| Customer | arjun.reddy@farmdirect.dev       | Customer@123  |

> Change the admin password and `JWT_SECRET` before deploying to production.

## API overview

| Method | Endpoint                     | Description                              |
| ------ | ---------------------------- | ---------------------------------------- |
| POST   | `/api/auth/register`         | Register a farmer or customer            |
| POST   | `/api/auth/login`            | Log in, returns a JWT                    |
| GET    | `/api/auth/me`               | Current user                             |
| GET    | `/api/products`              | Browse products (filters, public)        |
| GET    | `/api/products/{id}`         | Product detail                           |
| GET    | `/api/products/mine`         | Farmer's own listings                    |
| POST   | `/api/products`              | Add a product (farmer)                   |
| PUT    | `/api/products/{id}`         | Update a product (farmer)                |
| DELETE | `/api/products/{id}`         | Delete a product (farmer)                |
| POST   | `/api/orders`                | Checkout the cart (customer)             |
| GET    | `/api/orders`                | My orders (customer)                     |
| GET    | `/api/orders/{id}`           | Order detail (customer)                  |
| POST   | `/api/orders/{id}/cancel`    | Cancel an order (customer)               |
| GET    | `/api/orders/farmer`         | Orders received (farmer)                 |
| PATCH  | `/api/orders/{id}/status`    | Update order status (farmer)             |
| PATCH  | `/api/orders/{id}/delivery`  | Update delivery (farmer)                 |
| PATCH  | `/api/orders/{id}/payment`   | Record payment (farmer)                  |
| GET    | `/api/admin/stats`           | Platform statistics (admin)              |
| GET    | `/api/admin/users`           | All users (admin)                        |
| PATCH  | `/api/admin/users/{id}/status` | Activate/deactivate a user (admin)     |
| DELETE | `/api/admin/users/{id}`      | Delete a user (admin)                    |
| GET    | `/api/admin/products`        | All products (admin)                     |
| DELETE | `/api/admin/products/{id}`   | Delete a product (admin)                 |
| GET    | `/api/admin/orders`          | All orders (admin)                       |
| PATCH  | `/api/admin/orders/{id}/status` | Update any order status (admin)       |
| PATCH  | `/api/admin/orders/{id}/payment` | Update any payment (admin)            |
| GET    | `/api/health`                | Health check                             |

See [DEPLOYMENT.md](DEPLOYMENT.md) to publish the app, and
[PROJECT.md](PROJECT.md) for the abstract and system flow.
