# RouteFlow — School Transport Management System

RouteFlow is a full-stack School Transport Management System designed to simplify the management of school buses, routes, students, drivers, pickup points, and student transport assignments.

The system provides a centralized admin dashboard where transport administrators can manage the complete school transportation workflow.

---

## Live Deployment

### Frontend

https://school-transport-management-system.vercel.app/

### Backend API

https://school-transport-management-system.onrender.com/

### Backend Health Endpoint

https://school-transport-management-system.onrender.com/api/health

> Note: The backend health endpoint is available for checking the deployed API service. API routes are accessed through the `/api` base path.

---

## GitHub Repository

https://github.com/aditya-yadav-75/school-transport-management-system

---

## Project Overview

Managing school transportation manually can become difficult when dealing with multiple buses, routes, drivers, students, pickup points, and seat capacities.

RouteFlow provides a centralized web-based solution for managing these operations.

The system allows administrators to:

- Manage school transport routes
- Manage buses and seat capacities
- Manage drivers
- Register and manage students
- Configure pickup points
- Assign students to routes
- Monitor seat occupancy
- Track available and assigned drivers
- View transport statistics
- Manage transport assignments
- Switch between light and dark appearance modes

---

## Features

### Admin Dashboard

The dashboard provides an overview of the complete transportation system.

It displays:

- Active buses
- Total and vacant seats
- Registered students
- Parent accounts
- Total drivers
- Available drivers
- Assigned drivers
- Transport assignments
- Overall transport capacity

---

### Route Management

Administrators can create and manage transportation routes.

Each route can contain:

- Route name
- Route status
- Assigned bus
- Assigned driver
- Seat capacity
- Occupied seats
- Vacant seats
- Pickup points
- Pickup point addresses

Example routes include:

- Route A — Dombivli
- Route B — Kalyan
- Route C — Navi Mumbai

---

### Bus Management

The system keeps track of buses operating in the school transportation network.

Bus information includes:

- Registration number
- Driver assignment
- Seat capacity
- Current occupancy
- Vacant seats
- Associated route

---

### Student Management

Administrators can manage student transport information.

Student records can be associated with:

- Student name
- Roll number
- Parent account
- Route
- Pickup point
- Transport assignment

---

### Driver Management

The driver module manages the school's transport driver pool.

The system tracks:

- Driver name
- Contact information
- Assigned bus
- Driver availability
- Assignment status

---

### Student Assignment

Students can be assigned to available routes and pickup points.

The assignment workflow checks route capacity before allowing students to be assigned.

The administrator selects:

1. Student
2. Route
3. Pickup point

and then assigns the student to the selected transport route.

---

### Pickup Point Management

Each route can contain multiple pickup points.

A pickup point includes:

- Point name
- Address
- Route association

Students can only be assigned to pickup points belonging to their selected route.

---

### Capacity Monitoring

RouteFlow provides real-time transport capacity information.

The dashboard displays:

```text
Total Seats
Occupied Seats
Vacant Seats
Capacity Percentage
