# School Transport Management System

A full-stack web application developed to manage school transportation, including bus routes, pickup points, vehicle capacity, student registration, authentication, and route assignments.

The project is developed as a Backend Development Case Study using Node.js, Express.js, MongoDB, and React.js.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Core Modules](#core-modules)
- [Database Design](#database-design)
- [Authentication and Authorization](#authentication-and-authorization)
- [Route and Capacity Management](#route-and-capacity-management)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Testing the API](#testing-the-api)
- [Error Handling](#error-handling)
- [Security](#security)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Learning Outcomes](#learning-outcomes)
- [Case Study Deliverables](#case-study-deliverables)
- [Project Workflow](#project-workflow)
- [Important Business Rule](#important-business-rule)
- [Conclusion](#conclusion)
- [Author](#author)

---

# Project Overview

The School Transport Management System is a web-based application designed to simplify and organize school transportation operations.

In a traditional school transportation system, information about students, routes, pickup points, buses, and available seats may be maintained manually. This can lead to problems such as:

- Difficulty managing student transport assignments
- Incorrect route assignments
- Lack of proper vehicle capacity validation
- Difficulty tracking pickup points
- Duplicate student assignments
- Manual management of transportation records
- Lack of centralized data management

This project provides a centralized system where administrators can manage transportation data and students can register and view their assigned transport information.

The backend provides a RESTful API while the frontend provides a user-friendly React-based interface.

---

# Problem Statement

A school needs to manage its transportation system efficiently.

The system should allow the school to:

1. Manage bus routes.
2. Manage pickup points.
3. Store vehicle capacity.
4. Register students.
5. Authenticate users securely.
6. Assign students to routes.
7. Prevent assignments when a route has reached its maximum capacity.
8. Allow students to view their assigned transportation information.
9. Provide administrators with centralized control over transportation records.

A major requirement of the system is that a student must not be assigned to a route after the vehicle reaches its maximum seating capacity.

---

# Objectives

The main objectives of this project are:

- To develop a centralized school transportation management system.
- To implement secure user authentication using JWT.
- To provide role-based access control.
- To allow administrators to create and manage routes.
- To maintain pickup point information.
- To maintain vehicle capacity.
- To prevent over-capacity route assignments.
- To allow students to register and log in.
- To allow students to view their transportation assignment.
- To implement a RESTful backend API.
- To connect the application with MongoDB.
- To provide a React-based frontend.
- To create a scalable structure that can be extended in the future.

---

# Key Features

## 1. User Authentication

The application supports user registration and login.

Authentication is implemented using JSON Web Tokens (JWT).

Users receive a token after successful login which is used to access protected resources.

---

## 2. Student Registration

Students can create an account and provide their required information.

Student records are stored in MongoDB.

---

## 3. Student Login

Registered students can log into the system using their credentials.

After successful authentication, the student can access protected features.

---

## 4. Admin Authentication

Administrators have access to transportation management functionality.

Admin-only operations include:

- Creating routes
- Updating routes
- Deleting routes
- Managing transportation information
- Viewing students
- Managing student assignments

---

## 5. Route Management

Administrators can perform complete CRUD operations on routes.

CRUD stands for:

- Create
- Read
- Update
- Delete

Routes can contain information such as:

- Route name
- Vehicle information
- Pickup points
- Vehicle capacity
- Assigned student count

---

## 6. Pickup Point Management

Pickup points are associated with transportation routes.

This allows the system to represent where students can be picked up.

---

## 7. Vehicle Capacity Management

Every transportation route has a defined vehicle capacity.

The system keeps track of:

```text
Vehicle Capacity
Assigned Students
Available Seats
```

This information is used when assigning students to routes.

---

## 8. Capacity Validation

The backend validates vehicle capacity before creating a student assignment.

The basic condition is:

```text
assignedCount < vehicleCapacity
```

If the route has available seats, the assignment can be created.

If the route is full, the assignment is rejected.

The API returns:

```text
HTTP 409 Conflict
```

This prevents students from being assigned beyond the available vehicle capacity.

---

## 9. One Route Assignment Per Student

A student can only have one active route assignment.

This prevents the same student from being assigned to multiple routes simultaneously.

---

## 10. Student Transportation Details

Students can retrieve their assigned route and transportation information after logging in.

---

## 11. Admin Dashboard

The React frontend provides an administrative interface for managing transportation information.

The dashboard can be used to interact with the backend API and manage routes and assignments.

---

# Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React.js | Frontend UI |
| JavaScript | Application logic |
| CSS | Styling |
| Vite | Frontend development and build tool |

---

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| JavaScript | Backend programming |
| JWT | Authentication |
| bcrypt | Password hashing |

---

## Database

| Technology | Purpose |
|---|---|
| MongoDB | Database |
| Mongoose | MongoDB object modeling |

---

## Development Tools

- Visual Studio Code
- Git
- GitHub
- MongoDB Atlas
- Postman / Thunder Client

---

# System Architecture

The application follows a client-server architecture.

```text
                  ┌─────────────────────┐
                  │        User         │
                  │   Student / Admin   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   React Frontend    │
                  │                     │
                  │   Vite + React      │
                  └──────────┬──────────┘
                             │
                         HTTP/REST
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Express Server    │
                  │                     │
                  │ Node.js + Express   │
                  └──────────┬──────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
          ┌───────────────┐     ┌───────────────┐
          │ Authentication│     │ Business      │
          │ Middleware    │     │ Logic         │
          └───────────────┘     └───────┬───────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │     MongoDB      │
                              │                  │
                              │ Users            │
                              │ Students         │
                              │ Routes           │
                              │ Assignments      │
                              └──────────────────┘
```

---

# Project Structure

```text
School-Transport-Management-System/
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │
│   │   ├── controllers/
│   │   │   ├── assignmentController.js
│   │   │   ├── authController.js
│   │   │   ├── driverController.js
│   │   │   ├── parentController.js
│   │   │   ├── routeController.js
│   │   │   └── studentController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── models/
│   │   │   ├── Assignment.js
│   │   │   ├── Driver.js
│   │   │   ├── Route.js
│   │   │   ├── Student.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── assignmentRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── driverRoutes.js
│   │   │   ├── routeRoutes.js
│   │   │   └── studentRoutes.js
│   │   │
│   │   ├── utils/
│   │   │
│   │   ├── seedAdmin.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

> `node_modules` directories are intentionally excluded from the repository. Dependencies should be installed locally using `npm install`.

---

# User Roles

The system is designed around role-based access.

## Admin

The administrator manages the transportation system.

Admin functionality includes:

- Manage routes
- Create routes
- Update routes
- Delete routes
- View students
- Manage assignments
- Monitor vehicle capacity

---

## Student

Students can:

- Register
- Log in
- View their account
- View their assigned route
- View transportation details

---

## Driver / Transport Personnel

The backend structure also provides models and routes for transport personnel such as drivers, allowing the system to be extended with additional transport-management functionality.

---

# Core Modules

## Authentication Module

Responsible for:

- Registration
- Login
- JWT generation
- Authentication
- User identification
- Role-based access

---

## Route Module

Responsible for:

- Creating routes
- Reading route information
- Updating routes
- Deleting routes
- Managing vehicle capacity
- Managing pickup points

---

## Student Module

Responsible for:

- Student records
- Student registration
- Student information
- Student route information

---

## Assignment Module

Responsible for:

- Assigning students to routes
- Checking route capacity
- Preventing duplicate assignments
- Removing assignments
- Viewing assigned students

---

## Driver Module

Responsible for maintaining driver-related transportation information and provides a foundation for future driver management functionality.

---

# Database Design

MongoDB is used as the database.

The main entities are:

```text
User
 │
 ├── Authentication
 │
 └── Role
      │
      ├── Admin
      └── Student


Student
 │
 └── Assignment
        │
        └── Route
              │
              ├── Pickup Points
              └── Vehicle Capacity


Driver
 │
 └── Transportation Information
```

---

# Main Data Models

## User

The User model is responsible for authentication and user account information.

Typical information includes:

- Name
- Email
- Password
- Role

Passwords are stored securely using password hashing.

---

## Student

The Student model stores student-specific information.

Student information can be connected with transportation assignments.

---

## Route

The Route model stores transportation information.

Important route information includes:

- Route details
- Pickup points
- Vehicle information
- Vehicle capacity
- Assigned student count

---

## Assignment

The Assignment model connects a student with a transportation route.

```text
Student ─────── Assignment ─────── Route
```

This relationship allows the application to determine which route is assigned to a student.

---

## Driver

The Driver model stores information related to drivers and transportation personnel.

---

# Authentication and Authorization

The application uses JWT-based authentication.

The authentication flow is:

```text
User
  │
  ▼
Login
  │
  ▼
Express API
  │
  ▼
Verify Credentials
  │
  ▼
Generate JWT
  │
  ▼
Return Token
  │
  ▼
Frontend Stores Token
  │
  ▼
Token Sent With Protected Requests
  │
  ▼
Authentication Middleware
  │
  ▼
Access Granted / Denied
```

Protected routes require a valid JWT.

Administrative operations additionally require the user to have the appropriate admin role.

---

# API Documentation

The backend exposes RESTful API endpoints.

Base URL during local development:

```text
http://localhost:5000
```

---

## Authentication

### Register

```http
POST /api/auth/register
```

Creates a new user account.

---

### Login

```http
POST /api/auth/login
```

Authenticates an existing user and returns an authentication token.

---

### Current User

```http
GET /api/auth/me
```

Returns information about the currently authenticated user.

---

# Route APIs

### Get All Routes

```http
GET /api/routes
```

Returns available transportation routes.

---

### Get Route

```http
GET /api/routes/:id
```

Returns information about a specific route.

---

### Create Route

```http
POST /api/routes
```

Creates a new transportation route.

Admin authentication is required.

---

### Update Route

```http
PUT /api/routes/:id
```

Updates an existing route.

Admin authentication is required.

---

### Delete Route

```http
DELETE /api/routes/:id
```

Deletes an existing route.

Admin authentication is required.

---

# Student APIs

### Get Students

```http
GET /api/students
```

Returns student information.

This endpoint is restricted to authorized administrators.

---

# Assignment APIs

### Get All Assignments

```http
GET /api/assignments
```

Returns transportation assignments.

---

### Get My Assignment

```http
GET /api/assignments/mine
```

Returns the transportation assignment associated with the authenticated student.

---

### Get Students on a Route

```http
GET /api/assignments/route/:id/students
```

Returns students assigned to a particular route.

---

### Create Assignment

```http
POST /api/assignments
```

Creates a new student-route assignment.

Before creating the assignment, the backend validates the route capacity.

---

### Delete Assignment

```http
DELETE /api/assignments/:id
```

Removes an existing assignment.

---

# Capacity Management Logic

One of the most important business rules in this project is vehicle capacity validation.

Suppose a bus has:

```text
Vehicle Capacity = 40
Assigned Students = 39
```

A new student can be assigned because:

```text
39 < 40
```

After assignment:

```text
Assigned Students = 40
```

If another student attempts to join the route:

```text
40 < 40
```

is false.

Therefore, the assignment is rejected.

The backend returns:

```text
HTTP 409 Conflict
```

This prevents overbooking and ensures that the number of assigned students cannot exceed the vehicle capacity.

---

# Environment Variables

Environment variables are used to keep sensitive configuration outside the source code.

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

---

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit `.env` files containing real credentials to GitHub.

---

# Installation and Setup

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB
- Git
- Visual Studio Code
- Modern web browser

---

# Clone the Repository

```bash
git clone https://github.com/aditya-yadav-75/School-Transport-Management-System.git
```

Move into the project:

```bash
cd School-Transport-Management-System
```

---

# Backend Setup

Open a terminal and run:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Add your MongoDB connection string and JWT secret to `.env`.

---

# Seed the Admin Account

Run:

```bash
npm run seed:admin
```

This creates the initial administrator account.

The development seed configuration currently uses:

```text
Email: admin@school.com
Password: Admin@123
```

Change these credentials before using the application in a real deployment.

---

# Start the Backend

Run:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal.

From the project root:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# Running the Complete Application

Two terminals are required.

### Terminal 1 — Backend

```bash
cd School-Transport-Management-System/backend
npm install
npm run seed:admin
npm run dev
```

### Terminal 2 — Frontend

```bash
cd School-Transport-Management-System/frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# Testing the Application

The REST API can be tested using:

- Postman
- Thunder Client
- Browser
- Frontend application

Recommended testing sequence:

```text
1. Start MongoDB
        ↓
2. Start Backend
        ↓
3. Seed Admin
        ↓
4. Start Frontend
        ↓
5. Register Student
        ↓
6. Login
        ↓
7. Login as Admin
        ↓
8. Create Route
        ↓
9. Add Pickup Information
        ↓
10. Assign Student
        ↓
11. Verify Capacity
        ↓
12. Test Full Route
```

---

# Example Capacity Test

Suppose a route has:

```text
Capacity: 2
```

Assign:

```text
Student 1 → Successful
Student 2 → Successful
Student 3 → Rejected
```

The third assignment should fail because the route has reached its maximum capacity.

Expected response:

```text
HTTP 409 Conflict
```

This demonstrates that the main business rule is being enforced by the backend.

---

# Error Handling

The backend handles common API errors such as:

- Invalid credentials
- Unauthorized requests
- Missing authentication token
- Invalid route ID
- Duplicate assignments
- Full routes
- Missing required data
- Database errors

HTTP status codes are used to communicate the result of API requests.

Examples:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---

# Security

Several security practices are implemented in the application.

## Password Hashing

Passwords should never be stored as plain text.

The application uses password hashing before storing credentials.

---

## JWT Authentication

JWT tokens are used to authenticate protected API requests.

---

## Role-Based Authorization

Administrative operations are protected using role-based authorization.

This prevents ordinary users from performing administrator-only operations.

---

## Environment Variables

Sensitive configuration such as:

```text
MongoDB URI
JWT Secret
API configuration
```

is stored using environment variables.

---

## Git Ignore

The repository excludes sensitive and unnecessary files such as:

```text
node_modules/
.env
.env.*
.DS_Store
dist/
build/
*.log
.vercel/
```

This keeps the GitHub repository clean and prevents accidental credential exposure.

---

# Deployment

The project can be deployed using separate frontend and backend services.

## Database

MongoDB Atlas can be used as the production database.

Basic setup:

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Configure network access.
4. Copy the MongoDB connection string.
5. Add the connection string to the backend environment variables.

---

# Backend Deployment

The backend can be deployed using services such as:

- Render
- Railway

Required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
CLIENT_URL=https://your-frontend-domain
```

---

# Frontend Deployment

The frontend can be deployed using services such as:

- Vercel
- Netlify

Required environment variable:

```env
VITE_API_URL=https://your-backend-domain/api
```

---

# Production Architecture

The deployed system can follow this architecture:

```text
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │     Vercel      │
              │ React Frontend  │
              └────────┬────────┘
                       │
                    HTTPS
                       │
                       ▼
              ┌─────────────────┐
              │ Render/Railway  │
              │ Node + Express  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  MongoDB Atlas  │
              │    Database     │
              └─────────────────┘
```

---

# Future Enhancements

The current system provides the core transportation management functionality. It can be extended with additional features.

## 1. Live Bus Tracking

GPS-based tracking can allow administrators and parents to view the current location of buses.

---

## 2. Parent Dashboard

A dedicated parent dashboard could provide:

- Student transport information
- Assigned bus
- Route information
- Pickup point
- Notifications

---

## 3. Driver Dashboard

Drivers could receive a dedicated dashboard for:

- Viewing assigned routes
- Viewing students
- Updating trip status
- Reporting transport issues

---

## 4. Notifications

The system could send notifications for:

- Bus arrival
- Route changes
- Pickup updates
- Transport delays
- Emergency alerts

---

## 5. QR-Based Attendance

QR codes could be implemented for student boarding and exiting.

---

## 6. Route Optimization

Future versions could use algorithms to optimize:

- Pickup order
- Route distance
- Travel time
- Vehicle utilization

---

## 7. Reports and Analytics

Administrators could generate reports such as:

- Route occupancy
- Student assignments
- Vehicle utilization
- Daily attendance
- Transportation statistics

---

# Learning Outcomes

This project provides practical experience with:

- Full-stack web development
- REST API development
- Node.js
- Express.js
- React.js
- MongoDB
- Mongoose
- JWT authentication
- Role-based authorization
- CRUD operations
- Database modeling
- API integration
- Environment configuration
- Git and GitHub
- Frontend-backend communication
- Deployment architecture

---

# Case Study Deliverables

The project demonstrates the following backend development concepts.

## Backend

- Express.js REST API
- Node.js server
- MongoDB database
- Mongoose models
- Controllers
- Routes
- Middleware
- JWT authentication
- Role-based authorization
- Business logic validation

## Frontend

- React.js application
- API integration
- Authentication flow
- Admin interface
- Student interface

## Database

- MongoDB collections
- Mongoose schemas
- Relationships between users, students, routes, and assignments

## Development

- Environment variables
- Git
- GitHub
- Separate frontend and backend applications
- Production deployment structure

---

# Project Workflow

The overall workflow of the application is:

```text
                    START
                      │
                      ▼
               User opens app
                      │
                      ▼
             Register / Login
                      │
                      ▼
              Authentication
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
        Admin                  Student
          │                       │
          ▼                       ▼
   Manage Routes            View Profile
          │                       │
          ▼                       ▼
 Manage Pickup Points       View Assignment
          │                       │
          ▼                       │
 Manage Vehicle Capacity         │
          │                       │
          ▼                       │
 Assign Students ◄───────────────┘
          │
          ▼
  Check Route Capacity
          │
      ┌───┴────┐
      │        │
      ▼        ▼
 Available   Full
      │        │
      ▼        ▼
 Assignment  HTTP 409
 Created     Conflict
      │
      ▼
     END
```

---

# Important Business Rule

The most important validation in the system is:

> A student cannot be assigned to a route when the route has reached its maximum vehicle capacity.

For example:

```text
Vehicle Capacity = 40
Assigned Students = 40

New Assignment
       │
       ▼
Capacity Check
       │
       ▼
40 < 40
       │
       ▼
FALSE
       │
       ▼
Assignment Rejected
       │
       ▼
HTTP 409 Conflict
```

This validation is handled at the backend level rather than relying only on the frontend.

This ensures that the business rule remains enforced even if requests are sent directly to the API.

---

# GitHub Repository

Repository:

https://github.com/aditya-yadav-75/School-Transport-Management-System

---

# Author

**Aditya Yadav**

B.Tech Computer Science Engineering  
ITM Skills University

GitHub:

https://github.com/aditya-yadav-75

---

# Conclusion

The School Transport Management System provides a structured digital solution for managing school transportation.

The project combines a React frontend with a Node.js and Express.js backend and uses MongoDB for persistent data storage.

The system demonstrates important full-stack development concepts including authentication, authorization, CRUD operations, database management, REST APIs, and backend business-rule validation.

The capacity-management functionality is particularly important because it ensures that student assignments respect the available seating capacity of each vehicle.

The modular architecture also makes the project suitable for future expansion into a more comprehensive school transportation platform.
