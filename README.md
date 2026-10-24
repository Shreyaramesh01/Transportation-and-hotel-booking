# 🚀 SmartTrip — Transportation & Booking System

---

## 📋 Project Overview

SmartTrip is a unified, web-based Transportation & Hotel Booking System that allows users to:
- 🚌 Search & book **Buses, Trains, Flights, and Cabs**
- 🏨 Search & book **Hotels** across multiple cities
- 📋 View & manage **booking history**
- 👤 Register/Login with **user authentication**
- 🎫 Get instant **e-ticket / booking confirmation**

---

## 🛠️ Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Frontend   | React 19 + Vite 8   |
| Backend    | Node.js + Express 5 |
| Styling    | Custom CSS          |
| Database   | In-Memory (JSON)    |

---

## 🚀 How to Run the Project

### Step 1 — Start the Backend Server

Open a terminal in the `backend/` folder:

```bash
cd backend
node server.js
```

✅ Server starts at: **http://localhost:5000**

---

### Step 2 — Start the Frontend

Open a **second terminal** in the `frontend/` folder:

```bash
cd frontend
npm run dev
```

✅ App opens at: **http://localhost:5173**

---

## 🔑 Demo Login Credentials

| Email                   | Password  |
|-------------------------|-----------|
| demo@smarttrip.com      | demo123   |

---

## 🌐 API Endpoints

| Method | Endpoint                    | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | `/`                         | Health check                   |
| POST   | `/api/register`             | Register new user              |
| POST   | `/api/login`                | User login                     |
| GET    | `/api/search`               | Search transportation          |
| GET    | `/api/hotels`               | Search hotels                  |
| POST   | `/api/bookings`             | Create transport booking       |
| POST   | `/api/hotel-bookings`       | Create hotel booking           |
| GET    | `/api/bookings?email=...`   | Get bookings by email          |
| DELETE | `/api/bookings/:bookingId`  | Cancel a booking               |
| GET    | `/api/popular-routes`       | Get popular routes             |
| GET    | `/api/stats`                | Platform statistics            |

---

## 🏙️ Supported Cities & Routes

| From        | To          | Available Modes           |
|-------------|-------------|---------------------------|
| Hassan      | Bengaluru   | 🚌 Bus, 🚆 Train, 🚕 Cab  |
| Hassan      | Mysuru      | 🚌 Bus, 🚆 Train, 🚕 Cab  |
| Bengaluru   | Mangaluru   | 🚌 Bus, 🚆 Train, ✈️ Flight |
| Bengaluru   | Mysuru      | 🚆 Train                  |
| Bengaluru   | Mumbai      | ✈️ Flight                 |
| Bengaluru   | Delhi       | ✈️ Flight                 |

### Hotels in:
Hassan | Bengaluru | Mysuru | Mangaluru (2-5 star options)

---

## 📁 Project Structure

```
transport-booking-system/
├── backend/
│   ├── server.js          ← Express API server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx        ← Complete React application
│   │   ├── App.css        ← All styles
│   │   ├── index.css      ← Global reset
│   │   └── main.jsx       ← React entry point
│   ├── public/
│   └── package.json
└── README.md
```

---

## ✨ Features Implemented

- [x] Multi-modal transport search (Bus, Train, Flight, Cab)
- [x] Hotel search with date range & rooms
- [x] Real-time seat/room availability & inventory deduction
- [x] Booking form with passenger/guest details
- [x] Multi-method simulated payment gateway (UPI QR, Card, NetBanking, On-Board)
- [x] Unique booking ID generation (TKT-xxxx / HTL-xxxx) & Payment reference (PAY-xxxxxx)
- [x] Authentic printable e-ticket & hotel voucher with barcode / QR styling
- [x] Booking history by email with direct ticket view & PDF print
- [x] Booking cancellation with automatic seat/room inventory restoral
- [x] User registration & login with persistent LocalStorage session
- [x] One-click demo login credentials button
- [x] Quick city swap (⇄) and 30 Karnataka cities autocomplete datalist
- [x] Search filters (AC, Sleeper, WiFi, Star rating) & dynamic sorting (Price, Duration, Rating)
- [x] Popular routes quick-fill
- [x] Live platform statistics
- [x] Academic project modal with BCS403 guidelines & guide details
- [x] Fully responsive UI with dedicated print stylesheet
