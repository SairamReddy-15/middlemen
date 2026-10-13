# Deploying FarmDirect

The recommended free setup:

- **Database** — MySQL on [Aiven](https://aiven.io) (or Railway / PlanetScale-compatible MySQL)
- **Backend** — Spring Boot (Docker) on [Render](https://render.com)
- **Frontend** — React/Vite on [Vercel](https://vercel.com)

Deploy the database first, then the backend, then the frontend (the frontend
needs the backend URL).

---

## 1. Create the MySQL database

1. Create a MySQL service (Aiven "MySQL" free plan works well).
2. Note the connection details: **host**, **port**, **database name**,
   **user**, **password**. Aiven requires TLS; in the connection string use
   `useSSL=true` (or download the CA certificate).
3. The backend creates its tables automatically on first start.

Your JDBC URL will look like:

```
jdbc:mysql://HOST:PORT/DATABASE?useSSL=true&serverTimezone=UTC
```

## 2. Deploy the backend on Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repo. Render reads
   [`render.yaml`](../render.yaml) and creates the `farmdirect-backend`
   Docker web service. (Alternatively, create a **Web Service**, runtime
   **Docker**, Dockerfile path `backend/Dockerfile`, context `backend`.)
3. Set the environment variables:

   | Key                          | Value                                             |
   | ---------------------------- | ------------------------------------------------- |
   | `SPRING_DATASOURCE_URL`      | `jdbc:mysql://HOST:PORT/DATABASE?useSSL=true&serverTimezone=UTC` |
   | `SPRING_DATASOURCE_USERNAME` | database user                                     |
   | `SPRING_DATASOURCE_PASSWORD` | database password                                 |
   | `JWT_SECRET`                 | a long random string (32+ characters)             |
   | `ADMIN_EMAIL`                | `admin@farmdirect.com` (or your own)              |
   | `ADMIN_PASSWORD`             | a strong admin password                           |

   `PORT` is provided by Render automatically.
4. Deploy. The health check `/api/health` should return
   `{"status":"UP","application":"farm-direct"}`.
5. Copy the service URL, e.g. `https://farmdirect-backend.onrender.com`.

> If the database requires a CA certificate, add it to `backend/src/main/resources`
> and append `&ssl-ca=/app/classes/...` to the JDBC URL, or set `useSSL=false` for
> providers that allow it.

## 3. Deploy the frontend on Vercel

1. In Vercel, **Add New → Project** and import the same repository.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Vite
   (build `npm run build`, output `dist`).
3. **Before deploying**, edit [`frontend/vercel.json`](../frontend/vercel.json)
   and replace the backend host in the rewrite with your Render URL:

   ```json
   {
     "source": "/api/:path*",
     "destination": "https://YOUR-BACKEND.onrender.com/api/:path*"
   }
   ```

4. Deploy. Open the Vercel URL and log in with the admin or demo accounts.

> The backend has CORS enabled for all origins, so the Vercel domain works
> without extra configuration. Tighten this in
> `backend/src/main/java/com/farmdirect/config/SecurityConfig.java` once you
> have a fixed domain.

## 4. Verify

- `GET https://YOUR-BACKEND.onrender.com/api/health` → `{"status":"UP",...}`
- Register a customer, add produce to the cart and place an order.
- Log in as a farmer, accept an order and update its status.
- Log in as the admin account and open `/admin`.

## Updating

- **Backend** — push to the default branch; Render redeploys.
- **Frontend** — push to the default branch; Vercel redeploys.

## Local production build (optional)

```bat
cd backend && mvn clean package -DskipTests
cd ..\frontend && npm run build
```

The backend JAR is `backend/target/farm-direct-1.0.0.jar`; run it with
`java -jar farm-direct-1.0.0.jar`.
