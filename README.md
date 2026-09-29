# School Transport Management System

Backend Development Case Study — Node.js, Express.js and MongoDB

## Problem

A school needs to manage bus routes, pickup points, vehicle capacity and student assignments. A student must not be assigned to a route after the route reaches its seat capacity.

## Features

- JWT authentication
- Student registration and login
- Admin-only transport management
- Route CRUD operations
- Pickup point management
- Vehicle capacity tracking
- Capacity validation before assignment
- One route assignment per student
- Student route details
- React admin dashboard
- MongoDB Atlas compatible
- Ready for Render/Railway + Vercel/Netlify deployment

## Project Structure

```text
school-transport-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── seedAdmin.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
└── README.md
```

## Run Backend

```bash
cd backend
npm install
cp .env.example .env
```

Add your MongoDB Atlas connection string and JWT secret to `.env`.

Then:

```bash
npm run seed:admin
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

## Run Frontend

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Default Admin

The seed command uses:

```text
Email: admin@school.com
Password: Admin@123
```

Change these in `.env` before deployment.

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Routes

```text
GET    /api/routes
GET    /api/routes/:id
POST   /api/routes
PUT    /api/routes/:id
DELETE /api/routes/:id
```

POST/PUT/DELETE require an admin JWT.

### Students

```text
GET /api/students
```

Admin only.

### Assignments

```text
GET    /api/assignments
GET    /api/assignments/mine
GET    /api/assignments/route/:id/students
POST   /api/assignments
DELETE /api/assignments/:id
```

## Capacity Logic

Before an assignment is created, the backend performs an atomic update:

```text
assignedCount < vehicleCapacity
```

Only when this condition is true is `assignedCount` increased.

If the route is full, the API returns HTTP 409 and the assignment is not created.

## Deployment

### MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Add the deployment IP/network access.
4. Copy the MongoDB connection string.
5. Put it into the backend `MONGO_URI`.

### Backend

Deploy `backend` to Render or Railway.

Environment variables:

```text
PORT=5000
MONGO_URI=your_atlas_connection_string
JWT_SECRET=your_secret
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend

Deploy `frontend` to Vercel or Netlify.

Environment variable:

```text
VITE_API_URL=https://your-backend-domain/api
```

## Case Study Deliverables

- Express.js REST API
- MongoDB/Mongoose schemas
- JWT authentication
- Role-based authorization middleware
- Capacity validation
- React frontend
- Environment configuration
- Postman/Thunder Client-ready endpoints
