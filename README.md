# LMS Backend

Backend API for a tuition-class Learning Management System. Built with Express, Prisma (PostgreSQL), and JWT authentication.

## Tech Stack

- **Node.js / Express 5** — HTTP server and routing
- **Prisma 6 / PostgreSQL** — ORM and database
- **jsonwebtoken** — access/refresh token auth
- **bcryptjs** — password hashing
- **nodemon** — dev auto-reload

## Project Structure

```
prisma/
  schema.prisma        # Data models (TuitionClass, Admin, Student)
src/
  controllers/          # Route handlers
  routes/                # Express routers
  middleware/            # requireAuth (JWT verification)
  utils/                 # prisma client, hashing, token helpers
  server.js              # App entry point
postman/
  LMS_Backend.postman_collection.json  # Importable API test collection
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   JWT_ACCESS_SECRET="a-long-random-string"
   JWT_REFRESH_SECRET="a-different-long-random-string"
   PORT=5000
   FRONTEND_URL="http://localhost:5173"
   ```

3. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

The server listens on `http://localhost:5000` by default.

## Data Model

- **TuitionClass** — created when an admin registers; has many admins and students.
- **Admin** — belongs to a tuition class; roles: `ADMIN`, `SUPER_ADMIN`.
- **Student** — belongs to a tuition class; unique `username` globally, unique `studentNumber` per class.

## API Endpoints

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require an `Authorization: Bearer <accessToken>` header.

| Method | Endpoint              | Description                                  | Auth |
|--------|------------------------|-----------------------------------------------|------|
| GET    | `/health`              | Health check                                  |      |
| POST   | `/auth/register`       | Register a new tuition class + admin          |      |
| POST   | `/auth/login`          | Log in as an admin                            |      |
| POST   | `/students`            | Register a student in the admin's class       | 🔒   |
| GET    | `/students`            | List all students in the admin's class        | 🔒   |
| GET    | `/students/:id`        | Get a single student by id                    | 🔒   |

### POST /api/auth/register

```json
{
  "tuitionClassName": "Sample Tuition Class",
  "adminName": "Jane Admin",
  "email": "admin@example.com",
  "password": "password123"
}
```

### POST /api/auth/login

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Both auth endpoints return `{ admin, accessToken, refreshToken }` (register also returns `tuitionClass`).

### POST /api/students 🔒

```json
{
  "studentNumber": "S001",
  "fullName": "John Student",
  "username": "john.student",
  "password": "password123",
  "school": "Example High School",
  "phone": "0771234567",
  "parentPhone": "0777654321"
}
```

## API Testing

A ready-to-import Postman collection is available at [`postman/LMS_Backend.postman_collection.json`](postman/LMS_Backend.postman_collection.json). It includes:

- A `baseUrl` collection variable (defaults to `http://localhost:5000`)
- Auto-saved `accessToken` / `refreshToken` after login or registration
- Auto-saved `studentId` after registering a student

Import the file into Postman, run **Auth → Login Admin** (or **Register Admin**) first, then the student endpoints will authenticate automatically.
