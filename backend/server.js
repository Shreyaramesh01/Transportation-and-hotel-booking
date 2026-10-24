const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// Karnataka Cities
// ─────────────────────────────────────────────
const KARNATAKA_CITIES = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru", "Bidar",
  "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
  "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Hubli",
  "Kalaburagi", "Karwar", "Kolar", "Kodagu (Madikeri)", "Koppal",
  "Mandya", "Mangaluru", "Mysuru", "Raichur", "Ramanagara",
  "Shivamogga", "Tumakuru", "Udupi", "Vijayapura", "Yadgir"
];

// ─────────────────────────────────────────────
// Transport Data
// ─────────────────────────────────────────────
const transportData = [
  // ── Buses (34 entries) ──────────────────────
  {
    id: "B001", type: "Bus", name: "KSRTC Airavat",
    from: "Bengaluru", to: "Mysuru",
    departure: "06:00", arrival: "09:00", duration: "3h",
    price: 350, seats: 45, rating: 4.3,
    amenities: ["AC", "WiFi", "Charging Point"]
  },
  {
    id: "B002", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Hassan",
    departure: "07:30", arrival: "11:00", duration: "3.5h",
    price: 280, seats: 40, rating: 4.0,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B003", type: "Bus", name: "Orange Travels Sleeper",
    from: "Bengaluru", to: "Mangaluru",
    departure: "21:00", arrival: "04:00", duration: "7h",
    price: 750, seats: 36, rating: 4.2,
    amenities: ["AC", "Sleeper", "WiFi", "Blanket"]
  },
  {
    id: "B004", type: "Bus", name: "KSRTC Airavat",
    from: "Bengaluru", to: "Hubli",
    departure: "22:00", arrival: "05:00", duration: "7h",
    price: 650, seats: 45, rating: 4.1,
    amenities: ["AC", "WiFi", "Charging Point"]
  },
  {
    id: "B005", type: "Bus", name: "KSRTC Sleeper",
    from: "Bengaluru", to: "Belagavi",
    departure: "20:00", arrival: "05:00", duration: "9h",
    price: 850, seats: 36, rating: 4.0,
    amenities: ["AC", "Sleeper", "Blanket"]
  },
  {
    id: "B006", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Shivamogga",
    departure: "08:00", arrival: "13:00", duration: "5h",
    price: 380, seats: 40, rating: 4.0,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B007", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Davanagere",
    departure: "07:00", arrival: "12:00", duration: "5h",
    price: 420, seats: 40, rating: 3.9,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B008", type: "Bus", name: "KSRTC City",
    from: "Bengaluru", to: "Tumakuru",
    departure: "09:00", arrival: "10:30", duration: "1.5h",
    price: 120, seats: 55, rating: 3.8,
    amenities: ["AC"]
  },
  {
    id: "B009", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Kolar",
    departure: "08:30", arrival: "10:30", duration: "2h",
    price: 150, seats: 45, rating: 3.9,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B010", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Chikkaballapur",
    departure: "07:00", arrival: "09:30", duration: "2.5h",
    price: 180, seats: 45, rating: 3.9,
    amenities: ["AC"]
  },
  {
    id: "B011", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Mandya",
    departure: "08:00", arrival: "10:00", duration: "2h",
    price: 180, seats: 45, rating: 4.0,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B012", type: "Bus", name: "KSRTC City",
    from: "Bengaluru", to: "Ramanagara",
    departure: "06:30", arrival: "07:30", duration: "1h",
    price: 80, seats: 55, rating: 3.7,
    amenities: ["AC"]
  },
  {
    id: "B013", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Chitradurga",
    departure: "07:30", arrival: "12:00", duration: "4.5h",
    price: 380, seats: 45, rating: 3.9,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B014", type: "Bus", name: "KSRTC Airavat",
    from: "Bengaluru", to: "Udupi",
    departure: "20:30", arrival: "04:00", duration: "7.5h",
    price: 700, seats: 45, rating: 4.2,
    amenities: ["AC", "WiFi", "Charging Point"]
  },
  {
    id: "B015", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Chikkamagaluru",
    departure: "08:00", arrival: "13:30", duration: "5.5h",
    price: 480, seats: 40, rating: 4.1,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B016", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Kalaburagi",
    departure: "21:00", arrival: "05:00", duration: "8h",
    price: 650, seats: 40, rating: 3.8,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B017", type: "Bus", name: "KSRTC Sleeper",
    from: "Bengaluru", to: "Raichur",
    departure: "20:00", arrival: "05:00", duration: "9h",
    price: 750, seats: 36, rating: 3.8,
    amenities: ["AC", "Sleeper", "Blanket"]
  },
  {
    id: "B018", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Ballari",
    departure: "21:30", arrival: "04:00", duration: "6.5h",
    price: 550, seats: 40, rating: 3.9,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B019", type: "Bus", name: "KSRTC Sleeper",
    from: "Bengaluru", to: "Vijayapura",
    departure: "19:00", arrival: "05:00", duration: "10h",
    price: 900, seats: 36, rating: 3.9,
    amenities: ["AC", "Sleeper", "Blanket"]
  },
  {
    id: "B020", type: "Bus", name: "KSRTC Sleeper",
    from: "Bengaluru", to: "Bidar",
    departure: "19:30", arrival: "05:00", duration: "9.5h",
    price: 800, seats: 36, rating: 3.8,
    amenities: ["AC", "Sleeper", "Blanket"]
  },
  {
    id: "B021", type: "Bus", name: "KSRTC Express",
    from: "Bengaluru", to: "Kodagu (Madikeri)",
    departure: "07:00", arrival: "12:00", duration: "5h",
    price: 500, seats: 40, rating: 4.1,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B022", type: "Bus", name: "KSRTC Airavat",
    from: "Bengaluru", to: "Karwar",
    departure: "19:00", arrival: "05:00", duration: "10h",
    price: 900, seats: 45, rating: 4.0,
    amenities: ["AC", "WiFi", "Charging Point"]
  },
  {
    id: "B023", type: "Bus", name: "KSRTC City",
    from: "Mysuru", to: "Chamarajanagar",
    departure: "08:00", arrival: "09:30", duration: "1.5h",
    price: 120, seats: 55, rating: 3.8,
    amenities: ["AC"]
  },
  {
    id: "B024", type: "Bus", name: "KSRTC Express",
    from: "Mysuru", to: "Mandya",
    departure: "07:00", arrival: "08:00", duration: "1h",
    price: 150, seats: 45, rating: 4.0,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B025", type: "Bus", name: "Rajahamsa Deluxe",
    from: "Mysuru", to: "Hassan",
    departure: "09:00", arrival: "12:00", duration: "3h",
    price: 280, seats: 40, rating: 4.2,
    amenities: ["AC", "WiFi", "Recliner Seats"]
  },
  {
    id: "B026", type: "Bus", name: "KSRTC City",
    from: "Hubli", to: "Dharwad",
    departure: "07:00", arrival: "07:30", duration: "30m",
    price: 40, seats: 60, rating: 3.7,
    amenities: []
  },
  {
    id: "B027", type: "Bus", name: "KSRTC Express",
    from: "Hubli", to: "Belagavi",
    departure: "08:00", arrival: "11:00", duration: "3h",
    price: 280, seats: 45, rating: 4.0,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B028", type: "Bus", name: "KSRTC Express",
    from: "Hubli", to: "Gadag",
    departure: "09:00", arrival: "10:30", duration: "1.5h",
    price: 120, seats: 45, rating: 3.8,
    amenities: ["AC"]
  },
  {
    id: "B029", type: "Bus", name: "KSRTC City",
    from: "Mangaluru", to: "Udupi",
    departure: "07:30", arrival: "09:00", duration: "1.5h",
    price: 120, seats: 55, rating: 3.9,
    amenities: ["AC"]
  },
  {
    id: "B030", type: "Bus", name: "KSRTC Express",
    from: "Hassan", to: "Chikkamagaluru",
    departure: "08:30", arrival: "10:30", duration: "2h",
    price: 180, seats: 45, rating: 4.0,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B031", type: "Bus", name: "KSRTC Express",
    from: "Hassan", to: "Shivamogga",
    departure: "09:00", arrival: "12:00", duration: "3h",
    price: 280, seats: 45, rating: 4.0,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B032", type: "Bus", name: "KSRTC Express",
    from: "Shivamogga", to: "Davanagere",
    departure: "08:00", arrival: "10:00", duration: "2h",
    price: 150, seats: 45, rating: 3.9,
    amenities: ["AC", "Charging Point"]
  },
  {
    id: "B033", type: "Bus", name: "KSRTC City",
    from: "Kalaburagi", to: "Bidar",
    departure: "09:00", arrival: "11:00", duration: "2h",
    price: 180, seats: 55, rating: 3.8,
    amenities: ["AC"]
  },
  {
    id: "B034", type: "Bus", name: "KSRTC Express",
    from: "Kalaburagi", to: "Raichur",
    departure: "08:30", arrival: "11:00", duration: "2.5h",
    price: 200, seats: 45, rating: 3.9,
    amenities: ["AC", "Charging Point"]
  },

  // ── Trains (20 entries) ──────────────────────
  {
    id: "T001", type: "Train", name: "Hassan Express 16023",
    from: "Hassan", to: "Bengaluru",
    departure: "06:20", arrival: "10:05", duration: "3.75h",
    price: 180, seats: 200, rating: 4.2,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T002", type: "Train", name: "Mysuru Express 12008",
    from: "Hassan", to: "Mysuru",
    departure: "08:00", arrival: "10:30", duration: "2.5h",
    price: 150, seats: 200, rating: 4.1,
    amenities: ["Pantry Car", "Sleeper"]
  },
  {
    id: "T003", type: "Train", name: "Shatabdi Express 12007",
    from: "Bengaluru", to: "Mysuru",
    departure: "11:00", arrival: "13:00", duration: "2h",
    price: 340, seats: 150, rating: 4.6,
    amenities: ["AC", "Meals Included", "WiFi"]
  },
  {
    id: "T004", type: "Train", name: "Mangaluru Express 16584",
    from: "Bengaluru", to: "Mangaluru",
    departure: "21:30", arrival: "06:00", duration: "8.5h",
    price: 420, seats: 200, rating: 4.3,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T005", type: "Train", name: "Hubli Express 11303",
    from: "Bengaluru", to: "Hubli",
    departure: "22:00", arrival: "06:00", duration: "8h",
    price: 380, seats: 200, rating: 4.1,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T006", type: "Train", name: "Bengaluru-Belagavi Express",
    from: "Bengaluru", to: "Belagavi",
    departure: "19:45", arrival: "07:00", duration: "11.25h",
    price: 450, seats: 200, rating: 4.0,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T007", type: "Train", name: "Hampi Express 17301",
    from: "Bengaluru", to: "Ballari",
    departure: "22:30", arrival: "05:30", duration: "7h",
    price: 350, seats: 200, rating: 4.2,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T008", type: "Train", name: "Kalaburagi Express",
    from: "Bengaluru", to: "Kalaburagi",
    departure: "20:15", arrival: "06:00", duration: "9.75h",
    price: 480, seats: 200, rating: 3.9,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T009", type: "Train", name: "Intercity Express",
    from: "Bengaluru", to: "Tumakuru",
    departure: "06:15", arrival: "07:45", duration: "1.5h",
    price: 120, seats: 250, rating: 4.0,
    amenities: ["Pantry Car"]
  },
  {
    id: "T010", type: "Train", name: "Mysuru-Chamarajanagar Passenger",
    from: "Mysuru", to: "Chamarajanagar",
    departure: "08:00", arrival: "09:45", duration: "1.75h",
    price: 80, seats: 250, rating: 3.7,
    amenities: []
  },
  {
    id: "T011", type: "Train", name: "Malgudi Express",
    from: "Bengaluru", to: "Shivamogga",
    departure: "06:00", arrival: "10:30", duration: "4.5h",
    price: 280, seats: 200, rating: 4.1,
    amenities: ["Pantry Car", "Sleeper"]
  },
  {
    id: "T012", type: "Train", name: "Amaravathi Express",
    from: "Bengaluru", to: "Davanagere",
    departure: "23:00", arrival: "04:30", duration: "5.5h",
    price: 320, seats: 200, rating: 4.0,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T013", type: "Train", name: "Rani Chennamma Express",
    from: "Bengaluru", to: "Belagavi",
    departure: "22:00", arrival: "09:00", duration: "11h",
    price: 420, seats: 200, rating: 4.2,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T014", type: "Train", name: "Hubli-Dharwad Passenger",
    from: "Hubli", to: "Dharwad",
    departure: "07:00", arrival: "07:30", duration: "0.5h",
    price: 30, seats: 300, rating: 3.6,
    amenities: []
  },
  {
    id: "T015", type: "Train", name: "Goa Express",
    from: "Hubli", to: "Karwar",
    departure: "10:00", arrival: "16:00", duration: "6h",
    price: 280, seats: 200, rating: 4.0,
    amenities: ["Pantry Car", "Sleeper"]
  },
  {
    id: "T016", type: "Train", name: "Mangaluru-Udupi Passenger",
    from: "Mangaluru", to: "Udupi",
    departure: "08:30", arrival: "10:00", duration: "1.5h",
    price: 80, seats: 300, rating: 3.8,
    amenities: []
  },
  {
    id: "T017", type: "Train", name: "Vijayapura Express",
    from: "Bengaluru", to: "Vijayapura",
    departure: "20:00", arrival: "08:00", duration: "12h",
    price: 520, seats: 200, rating: 3.9,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T018", type: "Train", name: "Bidar Express",
    from: "Bengaluru", to: "Bidar",
    departure: "19:30", arrival: "07:30", duration: "12h",
    price: 480, seats: 200, rating: 3.8,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },
  {
    id: "T019", type: "Train", name: "Yesvantpur-Kolar Passenger",
    from: "Bengaluru", to: "Kolar",
    departure: "07:00", arrival: "09:00", duration: "2h",
    price: 120, seats: 250, rating: 3.8,
    amenities: ["Pantry Car"]
  },
  {
    id: "T020", type: "Train", name: "Raichur Express",
    from: "Bengaluru", to: "Raichur",
    departure: "20:30", arrival: "06:30", duration: "10h",
    price: 520, seats: 200, rating: 3.9,
    amenities: ["Pantry Car", "Sleeper", "AC Coach"]
  },

  // ── Flights (10 entries) ─────────────────────
  {
    id: "F001", type: "Flight", name: "IndiGo 6E-501",
    from: "Bengaluru", to: "Mangaluru",
    departure: "06:00", arrival: "07:00", duration: "1h",
    price: 2500, seats: 180, rating: 4.3,
    amenities: ["Snacks", "Carry-on Baggage"]
  },
  {
    id: "F002", type: "Flight", name: "Air India IX-301",
    from: "Bengaluru", to: "Mangaluru",
    departure: "10:00", arrival: "11:05", duration: "1.08h",
    price: 2800, seats: 160, rating: 4.4,
    amenities: ["Meal", "Check-in Baggage", "Entertainment"]
  },
  {
    id: "F003", type: "Flight", name: "SpiceJet SG-112",
    from: "Bengaluru", to: "Mumbai",
    departure: "08:00", arrival: "09:45", duration: "1.75h",
    price: 3500, seats: 180, rating: 4.1,
    amenities: ["Snacks", "Carry-on Baggage"]
  },
  {
    id: "F004", type: "Flight", name: "IndiGo 6E-804",
    from: "Bengaluru", to: "Delhi",
    departure: "07:00", arrival: "09:30", duration: "2.5h",
    price: 4200, seats: 180, rating: 4.3,
    amenities: ["Snacks", "Carry-on Baggage", "USB Charging"]
  },
  {
    id: "F005", type: "Flight", name: "IndiGo 6E-201",
    from: "Bengaluru", to: "Hubli",
    departure: "09:00", arrival: "10:00", duration: "1h",
    price: 2200, seats: 150, rating: 4.2,
    amenities: ["Snacks", "Carry-on Baggage"]
  },
  {
    id: "F006", type: "Flight", name: "Air India AI-411",
    from: "Bengaluru", to: "Belagavi",
    departure: "11:00", arrival: "12:00", duration: "1h",
    price: 2400, seats: 150, rating: 4.3,
    amenities: ["Meal", "Check-in Baggage"]
  },
  {
    id: "F007", type: "Flight", name: "IndiGo 6E-321",
    from: "Hubli", to: "Bengaluru",
    departure: "13:00", arrival: "14:00", duration: "1h",
    price: 2200, seats: 150, rating: 4.2,
    amenities: ["Snacks", "Carry-on Baggage"]
  },
  {
    id: "F008", type: "Flight", name: "SpiceJet SG-901",
    from: "Hubli", to: "Mumbai",
    departure: "07:30", arrival: "09:15", duration: "1.75h",
    price: 3000, seats: 180, rating: 4.0,
    amenities: ["Snacks", "Carry-on Baggage"]
  },
  {
    id: "F009", type: "Flight", name: "Air India AI-601",
    from: "Mangaluru", to: "Mumbai",
    departure: "09:00", arrival: "10:45", duration: "1.75h",
    price: 2800, seats: 160, rating: 4.3,
    amenities: ["Meal", "Check-in Baggage", "Entertainment"]
  },
  {
    id: "F010", type: "Flight", name: "IndiGo 6E-721",
    from: "Bengaluru", to: "Mysuru",
    departure: "08:30", arrival: "09:10", duration: "0.67h",
    price: 1800, seats: 70, rating: 4.0,
    amenities: ["Snacks", "Carry-on Baggage"]
  },

  // ── Cabs (10 entries) ────────────────────────
  {
    id: "C001", type: "Cab", name: "Ola Prime",
    from: "Hassan", to: "Bengaluru",
    departure: "Flexible", arrival: "Flexible", duration: "3.5h",
    price: 2200, seats: 4, rating: 4.1,
    amenities: ["AC", "GPS Tracking", "Driver Rating"]
  },
  {
    id: "C002", type: "Cab", name: "Uber Go",
    from: "Hassan", to: "Mysuru",
    departure: "Flexible", arrival: "Flexible", duration: "3h",
    price: 2000, seats: 4, rating: 4.0,
    amenities: ["AC", "GPS Tracking"]
  },
  {
    id: "C003", type: "Cab", name: "Ola SUV",
    from: "Bengaluru", to: "Mysuru",
    departure: "Flexible", arrival: "Flexible", duration: "3h",
    price: 2500, seats: 6, rating: 4.3,
    amenities: ["AC", "GPS Tracking", "Music System"]
  },
  {
    id: "C004", type: "Cab", name: "Rapido Cab",
    from: "Bengaluru", to: "Tumakuru",
    departure: "Flexible", arrival: "Flexible", duration: "1.5h",
    price: 900, seats: 4, rating: 3.9,
    amenities: ["AC", "GPS Tracking"]
  },
  {
    id: "C005", type: "Cab", name: "Uber Outstation",
    from: "Bengaluru", to: "Mangaluru",
    departure: "Flexible", arrival: "Flexible", duration: "7h",
    price: 5500, seats: 4, rating: 4.2,
    amenities: ["AC", "GPS Tracking", "Toll Included"]
  },
  {
    id: "C006", type: "Cab", name: "Ola Prime",
    from: "Mysuru", to: "Kodagu (Madikeri)",
    departure: "Flexible", arrival: "Flexible", duration: "3h",
    price: 2200, seats: 4, rating: 4.2,
    amenities: ["AC", "GPS Tracking", "Music System"]
  },
  {
    id: "C007", type: "Cab", name: "Uber Go",
    from: "Mangaluru", to: "Udupi",
    departure: "Flexible", arrival: "Flexible", duration: "1.5h",
    price: 900, seats: 4, rating: 4.0,
    amenities: ["AC", "GPS Tracking"]
  },
  {
    id: "C008", type: "Cab", name: "Rapido Cab",
    from: "Hubli", to: "Dharwad",
    departure: "Flexible", arrival: "Flexible", duration: "30m",
    price: 250, seats: 4, rating: 3.8,
    amenities: ["AC", "GPS Tracking"]
  },
  {
    id: "C009", type: "Cab", name: "Ola Prime",
    from: "Shivamogga", to: "Davanagere",
    departure: "Flexible", arrival: "Flexible", duration: "2h",
    price: 1400, seats: 4, rating: 4.1,
    amenities: ["AC", "GPS Tracking"]
  },
  {
    id: "C010", type: "Cab", name: "Uber Outstation",
    from: "Bengaluru", to: "Chikkaballapur",
    departure: "Flexible", arrival: "Flexible", duration: "2.5h",
    price: 1600, seats: 4, rating: 4.0,
    amenities: ["AC", "GPS Tracking", "Toll Included"]
  }
];

// ─────────────────────────────────────────────
// Hotels (26 hotels across 15+ cities)
// ─────────────────────────────────────────────
const hotels = [
  // Bengaluru (3)
  {
    id: "H001", name: "The Leela Palace Bengaluru", city: "Bengaluru",
    stars: 5, pricePerNight: 12000, rooms: 50, rating: 4.8,
    amenities: ["Pool", "Spa", "Restaurant", "WiFi", "Gym", "Valet Parking"],
    image: null
  },
  {
    id: "H002", name: "Lemon Tree Premier Bengaluru", city: "Bengaluru",
    stars: 4, pricePerNight: 5500, rooms: 80, rating: 4.3,
    amenities: ["Restaurant", "WiFi", "Gym", "Bar", "Parking"],
    image: null
  },
  {
    id: "H003", name: "Hotel Aishwarya Bengaluru", city: "Bengaluru",
    stars: 3, pricePerNight: 2500, rooms: 40, rating: 3.9,
    amenities: ["Restaurant", "WiFi", "Parking"],
    image: null
  },
  // Mysuru (2)
  {
    id: "H004", name: "Radisson Blu Plaza Hotel Mysuru", city: "Mysuru",
    stars: 5, pricePerNight: 8500, rooms: 60, rating: 4.7,
    amenities: ["Pool", "Spa", "Restaurant", "WiFi", "Gym", "Bar"],
    image: null
  },
  {
    id: "H005", name: "Hotel Roopa Mysuru", city: "Mysuru",
    stars: 3, pricePerNight: 2200, rooms: 35, rating: 4.0,
    amenities: ["Restaurant", "WiFi", "Parking", "AC"],
    image: null
  },
  // Mangaluru (2)
  {
    id: "H006", name: "Gateway Hotel Mangaluru", city: "Mangaluru",
    stars: 5, pricePerNight: 7500, rooms: 55, rating: 4.6,
    amenities: ["Pool", "Spa", "Restaurant", "WiFi", "Gym", "Bar"],
    image: null
  },
  {
    id: "H007", name: "Hotel Moti Mahal Mangaluru", city: "Mangaluru",
    stars: 3, pricePerNight: 2000, rooms: 30, rating: 3.9,
    amenities: ["Restaurant", "WiFi", "Parking"],
    image: null
  },
  // Hassan (2)
  {
    id: "H008", name: "Hotel Southern Star Hassan", city: "Hassan",
    stars: 4, pricePerNight: 3500, rooms: 40, rating: 4.2,
    amenities: ["Restaurant", "WiFi", "Parking", "AC", "Gym"],
    image: null
  },
  {
    id: "H009", name: "Hotel Suvarna Regency Hassan", city: "Hassan",
    stars: 3, pricePerNight: 1800, rooms: 25, rating: 3.8,
    amenities: ["Restaurant", "WiFi", "Parking"],
    image: null
  },
  // Hubli (2)
  {
    id: "H010", name: "Zostel Hubli", city: "Hubli",
    stars: 3, pricePerNight: 1200, rooms: 20, rating: 4.1,
    amenities: ["WiFi", "Common Area", "Lockers", "AC"],
    image: null
  },
  {
    id: "H011", name: "Hotel Naveen Hubli", city: "Hubli",
    stars: 4, pricePerNight: 3200, rooms: 35, rating: 4.2,
    amenities: ["Restaurant", "WiFi", "Parking", "AC", "Bar"],
    image: null
  },
  // Belagavi (2)
  {
    id: "H012", name: "Hotel Sanman Residency Belagavi", city: "Belagavi",
    stars: 3, pricePerNight: 1800, rooms: 30, rating: 3.9,
    amenities: ["Restaurant", "WiFi", "Parking", "AC"],
    image: null
  },
  {
    id: "H013", name: "The Monarch Hotel Belagavi", city: "Belagavi",
    stars: 4, pricePerNight: 4000, rooms: 45, rating: 4.3,
    amenities: ["Pool", "Restaurant", "WiFi", "Gym", "Bar"],
    image: null
  },
  // Shivamogga (1)
  {
    id: "H014", name: "Hotel Woodlands Shivamogga", city: "Shivamogga",
    stars: 3, pricePerNight: 1600, rooms: 28, rating: 3.8,
    amenities: ["Restaurant", "WiFi", "Parking"],
    image: null
  },
  // Chikkamagaluru (2)
  {
    id: "H015", name: "Taj Madikeri Resort Chikkamagaluru", city: "Chikkamagaluru",
    stars: 5, pricePerNight: 9500, rooms: 40, rating: 4.7,
    amenities: ["Pool", "Spa", "Restaurant", "WiFi", "Yoga", "Nature Walks"],
    image: null
  },
  {
    id: "H016", name: "Hotel Mayura Chikkamagaluru", city: "Chikkamagaluru",
    stars: 3, pricePerNight: 1900, rooms: 22, rating: 3.9,
    amenities: ["Restaurant", "WiFi", "Parking"],
    image: null
  },
  // Udupi (1)
  {
    id: "H017", name: "Hotel Kediyoor Udupi", city: "Udupi",
    stars: 3, pricePerNight: 2000, rooms: 30, rating: 4.1,
    amenities: ["Restaurant", "WiFi", "Parking", "AC"],
    image: null
  },
  // Kodagu/Madikeri (2)
  {
    id: "H018", name: "Club Mahindra Madikeri Resort", city: "Kodagu (Madikeri)",
    stars: 5, pricePerNight: 10000, rooms: 50, rating: 4.8,
    amenities: ["Pool", "Spa", "Restaurant", "WiFi", "Trekking", "Bonfire"],
    image: null
  },
  {
    id: "H019", name: "Hotel Coorg International", city: "Kodagu (Madikeri)",
    stars: 3, pricePerNight: 2500, rooms: 25, rating: 4.0,
    amenities: ["Restaurant", "WiFi", "Parking", "Garden"],
    image: null
  },
  // Ballari / Hampi region (1)
  {
    id: "H020", name: "Hampi's Boulders Resort", city: "Ballari",
    stars: 4, pricePerNight: 5000, rooms: 20, rating: 4.5,
    amenities: ["Pool", "Restaurant", "WiFi", "Cultural Programs", "Bonfire"],
    image: null
  },
  // Davanagere (1)
  {
    id: "H021", name: "Hotel Swagath Davanagere", city: "Davanagere",
    stars: 3, pricePerNight: 1500, rooms: 25, rating: 3.8,
    amenities: ["Restaurant", "WiFi", "Parking", "AC"],
    image: null
  },
  // Kalaburagi (1)
  {
    id: "H022", name: "Hotel Aditya International Kalaburagi", city: "Kalaburagi",
    stars: 3, pricePerNight: 1700, rooms: 28, rating: 3.8,
    amenities: ["Restaurant", "WiFi", "Parking", "AC"],
    image: null
  },
  // Tumakuru (1)
  {
    id: "H023", name: "Hotel Mayura Tumakuru", city: "Tumakuru",
    stars: 3, pricePerNight: 1400, rooms: 20, rating: 3.7,
    amenities: ["Restaurant", "WiFi", "Parking"],
    image: null
  },
  // Vijayapura (1)
  {
    id: "H024", name: "Hotel Madhuvan International Vijayapura", city: "Vijayapura",
    stars: 3, pricePerNight: 1600, rooms: 22, rating: 3.8,
    amenities: ["Restaurant", "WiFi", "Parking", "AC"],
    image: null
  },
  // Mysuru extra (already counted above)
  // Dharwad (1)
  {
    id: "H025", name: "Hotel Navaratna Dharwad", city: "Dharwad",
    stars: 3, pricePerNight: 1500, rooms: 20, rating: 3.9,
    amenities: ["Restaurant", "WiFi", "Parking", "AC"],
    image: null
  },
  // Karwar (1)
  {
    id: "H026", name: "Ocean Pearl Hotel Karwar", city: "Karwar",
    stars: 4, pricePerNight: 4500, rooms: 35, rating: 4.4,
    amenities: ["Pool", "Restaurant", "WiFi", "Beach Access", "Water Sports"],
    image: null
  }
];

// ─────────────────────────────────────────────
// Users & Bookings
// ─────────────────────────────────────────────
let users = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@smarttrip.com",
    phone: "9999999999",
    password: "demo123",
    role: "user"
  },
  {
    id: 2,
    name: "System Creator / Admin",
    email: "admin@smarttrip.com",
    phone: "9876500000",
    password: "admin123",
    role: "creator"
  }
];

let bookings = [];
let bookingCounter = 1000;

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────
function generateBookingId(type) {
  bookingCounter++;
  return type === "hotel" ? `HTL-${bookingCounter}` : `TKT-${bookingCounter}`;
}

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// GET /api/health — health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ SmartTrip API Server is running!',
    version: '2.0.0',
    endpoints: [
      'GET  /api/health',
      'GET  /api/cities',
      'POST /api/register',
      'POST /api/login',
      'GET  /api/search',
      'GET  /api/hotels',
      'POST /api/bookings',
      'POST /api/hotel-bookings',
      'GET  /api/bookings',
      'DELETE /api/bookings/:bookingId',
      'GET  /api/popular-routes',
      'GET  /api/stats',
      'POST /api/payment'
    ]
  });
});

// GET /api/cities
app.get('/api/cities', (req, res) => {
  res.json({ success: true, cities: KARNATAKA_CITIES });
});

// POST /api/register
app.post('/api/register', (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User with this email already exists.' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    phone,
    password
  };
  users.push(newUser);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, message: 'Registration successful!', user: safeUser });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, message: 'Login successful!', user: safeUser });
});

// GET /api/search?from=&to=&transport=
app.get('/api/search', (req, res) => {
  const { from = '', to = '', transport = '' } = req.query;

  let results = transportData;

  if (from.trim()) {
    const fromLower = from.trim().toLowerCase();
    results = results.filter(t => t.from.toLowerCase().includes(fromLower));
  }

  if (to.trim()) {
    const toLower = to.trim().toLowerCase();
    results = results.filter(t => t.to.toLowerCase().includes(toLower));
  }

  if (transport.trim() && transport.trim().toLowerCase() !== 'all') {
    const typeLower = transport.trim().toLowerCase();
    results = results.filter(t => t.type.toLowerCase() === typeLower);
  }

  res.json({ success: true, count: results.length, results });
});

// GET /api/hotels?city=&checkIn=&checkOut=&rooms=
app.get('/api/hotels', (req, res) => {
  const { city = '', checkIn, checkOut, rooms } = req.query;

  let results = hotels;

  if (city.trim()) {
    const cityLower = city.trim().toLowerCase();
    results = results.filter(h => h.city.toLowerCase().includes(cityLower));
  }

  if (rooms) {
    const roomCount = parseInt(rooms);
    if (!isNaN(roomCount)) {
      results = results.filter(h => h.rooms >= roomCount);
    }
  }

  // Calculate nights if check-in / check-out provided
  let nights = 1;
  if (checkIn && checkOut) {
    const diff = new Date(checkOut) - new Date(checkIn);
    if (diff > 0) {
      nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  }

  const enriched = results.map(h => ({
    ...h,
    totalPrice: h.pricePerNight * nights,
    nights
  }));

  res.json({ success: true, count: enriched.length, hotels: enriched, results: enriched });
});

// POST /api/bookings — transport booking
app.post('/api/bookings', (req, res) => {
  const { passengerName, phone, email, seats, transportationId, travelDate, userId } = req.body;

  if (!passengerName || !phone || !email || !seats || !transportationId || !travelDate) {
    return res.status(400).json({ success: false, message: 'All booking fields are required.' });
  }

  const transport = transportData.find(t => t.id === transportationId);
  if (!transport) {
    return res.status(404).json({ success: false, message: 'Transport not found.' });
  }

  const numSeats = parseInt(seats);
  if (isNaN(numSeats) || numSeats < 1) {
    return res.status(400).json({ success: false, message: 'Invalid number of seats.' });
  }

  if (transport.seats < numSeats) {
    return res.status(400).json({ success: false, message: `Only ${transport.seats} seat(s) available for ${transport.name}.` });
  }

  transport.seats -= numSeats;

  const bookingId = generateBookingId('transport');
  const totalPrice = transport.price * numSeats;
  const now = new Date().toISOString();

  const booking = {
    bookingId,
    type: 'transport',
    passengerName,
    phone,
    email,
    seats: numSeats,
    transportationId,
    transportDetails: transport,
    transportation: transport,
    travelDate,
    userId: userId || null,
    totalPrice,
    status: 'Confirmed',
    paymentStatus: 'Pending',
    createdAt: now,
    bookedAt: now
  };

  bookings.push(booking);
  res.status(201).json({ success: true, message: 'Booking confirmed!', booking });
});

// POST /api/hotel-bookings — hotel booking
app.post('/api/hotel-bookings', (req, res) => {
  const { guestName, phone, email, hotelId, checkIn, checkOut, rooms, userId } = req.body;

  if (!guestName || !phone || !email || !hotelId || !checkIn || !checkOut || !rooms) {
    return res.status(400).json({ success: false, message: 'All hotel booking fields are required.' });
  }

  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  const numRooms = parseInt(rooms);
  if (isNaN(numRooms) || numRooms < 1) {
    return res.status(400).json({ success: false, message: 'Invalid number of rooms.' });
  }

  if (hotel.rooms < numRooms) {
    return res.status(400).json({ success: false, message: `Only ${hotel.rooms} room(s) available at ${hotel.name}.` });
  }

  const diff = new Date(checkOut) - new Date(checkIn);
  if (diff <= 0) {
    return res.status(400).json({ success: false, message: 'Check-out must be after check-in.' });
  }
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const totalPrice = hotel.pricePerNight * numRooms * nights;

  hotel.rooms -= numRooms;

  const bookingId = generateBookingId('hotel');
  const now = new Date().toISOString();

  const booking = {
    bookingId,
    type: 'hotel',
    guestName,
    phone,
    email,
    hotelId,
    hotelDetails: hotel,
    hotel: hotel,
    checkIn,
    checkOut,
    nights,
    rooms: numRooms,
    userId: userId || null,
    totalPrice,
    status: 'Confirmed',
    paymentStatus: 'Pending',
    createdAt: now,
    bookedAt: now
  };

  bookings.push(booking);
  res.status(201).json({ success: true, message: 'Hotel booking confirmed!', booking });
});

// GET /api/bookings?email=
app.get('/api/bookings', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email query parameter is required.' });
  }

  const userBookings = bookings.filter(
    b => (b.email || '').toLowerCase() === email.toLowerCase()
  );

  res.json({ success: true, count: userBookings.length, bookings: userBookings });
});

// DELETE /api/bookings/:bookingId — cancel booking
app.delete('/api/bookings/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const booking = bookings.find(b => b.bookingId === bookingId);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (booking.status === 'Cancelled') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
  }

  booking.status = 'Cancelled';
  booking.cancelledAt = new Date().toISOString();

  // Restore inventory
  if (booking.type === 'transport' && booking.transportDetails) {
    booking.transportDetails.seats += (booking.seats || 1);
  } else if (booking.type === 'hotel' && booking.hotelDetails) {
    booking.hotelDetails.rooms += (booking.rooms || 1);
  }

  res.json({ success: true, message: 'Booking cancelled successfully.', booking });
});

// GET /api/popular-routes
app.get('/api/popular-routes', (req, res) => {
  const popularRoutes = [
    { from: "Bengaluru", to: "Mysuru", trips: 1240, avgPrice: 340, topTransport: "Train", types: ["Train", "Bus", "Cab"] },
    { from: "Bengaluru", to: "Mangaluru", trips: 980, avgPrice: 700, topTransport: "Bus", types: ["Bus", "Train", "Flight"] },
    { from: "Bengaluru", to: "Hubli", trips: 870, avgPrice: 600, topTransport: "Bus", types: ["Bus", "Train"] },
    { from: "Bengaluru", to: "Belagavi", trips: 750, avgPrice: 800, topTransport: "Bus", types: ["Bus", "Flight"] },
    { from: "Bengaluru", to: "Hassan", trips: 680, avgPrice: 280, topTransport: "Bus", types: ["Bus", "Train", "Cab"] },
    { from: "Mysuru", to: "Hassan", trips: 540, avgPrice: 280, topTransport: "Bus", types: ["Bus", "Train", "Cab"] },
    { from: "Bengaluru", to: "Shivamogga", trips: 520, avgPrice: 380, topTransport: "Bus", types: ["Bus", "Train"] },
    { from: "Hubli", to: "Dharwad", trips: 490, avgPrice: 40, topTransport: "Bus", types: ["Bus", "Cab"] },
    { from: "Bengaluru", to: "Chikkamagaluru", trips: 430, avgPrice: 480, topTransport: "Bus", types: ["Bus", "Cab"] },
    { from: "Mangaluru", to: "Udupi", trips: 380, avgPrice: 120, topTransport: "Bus", types: ["Bus", "Cab"] }
  ];

  res.json({ success: true, routes: popularRoutes });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const totalTransport = transportData.length;
  const totalHotels = hotels.length;
  const totalCities = KARNATAKA_CITIES.length;
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;

  const byType = transportData.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    stats: {
      totalTransportOptions: totalTransport,
      transportByType: byType,
      totalHotels,
      totalCities,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalUsers: users.length,
      cities: KARNATAKA_CITIES
    }
  });
});

// POST /api/payment
app.post('/api/payment', (req, res) => {
  const { bookingId, paymentMethod, paymentDetails, amount } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'bookingId is required.' });
  }

  const booking = bookings.find(b => b.bookingId === bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const paymentRef = `PAY-${Date.now().toString().slice(-6)}`;

  booking.paymentStatus = 'Paid';
  booking.paymentRef = paymentRef;
  booking.paymentMethod = paymentMethod || 'Online';
  booking.paidAt = new Date().toISOString();
  if (amount !== undefined) booking.paidAmount = amount;

  res.json({
    success: true,
    paymentRef,
    message: 'Payment successful!',
    booking
  });
});

// ─────────────────────────────────────────────
// Admin / Creator Endpoints
// ─────────────────────────────────────────────

// POST /api/admin/login — dedicated admin portal authentication
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Administrator credentials required.' });
  }

  const admin = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === 'creator'
  );

  if (!admin) {
    return res.status(401).json({ success: false, message: 'Access Denied: Invalid administrator credentials.' });
  }

  const { password: _, ...safeAdmin } = admin;
  res.json({
    success: true,
    message: 'Admin authorization granted.',
    token: `ADM_TOKEN_${Date.now()}`,
    admin: safeAdmin
  });
});

// GET /api/admin/bookings — all bookings across platform
app.get('/api/admin/bookings', (req, res) => {
  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  res.json({
    success: true,
    count: bookings.length,
    totalRevenue,
    bookings: [...bookings].reverse()
  });
});

// GET /api/admin/users — all registered users
app.get('/api/admin/users', (req, res) => {
  const safeUsers = users.map(({ password: _, ...u }) => u);
  res.json({ success: true, count: safeUsers.length, users: safeUsers });
});

// POST /api/admin/transport — add new transport schedule
app.post('/api/admin/transport', (req, res) => {
  const { type, name, from, to, departure, arrival, duration, price, seats, rating, amenities } = req.body;
  if (!type || !name || !from || !to || !departure || !price || !seats) {
    return res.status(400).json({ success: false, message: 'All transport fields are required.' });
  }

  const prefix = type === 'Bus' ? 'B' : type === 'Train' ? 'T' : type === 'Flight' ? 'F' : 'C';
  const newId = `${prefix}${String(transportData.length + 1).padStart(3, '0')}`;

  const newTransport = {
    id: newId,
    type,
    name,
    from,
    to,
    departure,
    arrival: arrival || departure,
    duration: duration || '2h',
    price: Number(price),
    seats: Number(seats),
    rating: Number(rating) || 4.2,
    amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(s => s.trim()) : ['AC'])
  };

  transportData.unshift(newTransport);
  res.status(201).json({ success: true, message: 'Transport schedule added!', transport: newTransport });
});

// DELETE /api/admin/transport/:id — delete transport schedule
app.delete('/api/admin/transport/:id', (req, res) => {
  const { id } = req.params;
  const index = transportData.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Transport schedule not found.' });
  }
  const removed = transportData.splice(index, 1)[0];
  res.json({ success: true, message: 'Transport schedule deleted.', removed });
});

// POST /api/admin/hotels — add new hotel
app.post('/api/admin/hotels', (req, res) => {
  const { name, city, stars, pricePerNight, rooms, rating, amenities, image } = req.body;
  if (!name || !city || !pricePerNight || !rooms) {
    return res.status(400).json({ success: false, message: 'Name, city, pricePerNight and rooms are required.' });
  }

  const newId = `H${String(hotels.length + 1).padStart(3, '0')}`;
  const newHotel = {
    id: newId,
    name,
    city,
    stars: Number(stars) || 3,
    pricePerNight: Number(pricePerNight),
    rooms: Number(rooms),
    rating: Number(rating) || 4.0,
    amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(s => s.trim()) : ['WiFi', 'Restaurant', 'AC']),
    image: image || '🏨'
  };

  hotels.unshift(newHotel);
  res.status(201).json({ success: true, message: 'Hotel added successfully!', hotel: newHotel });
});

// DELETE /api/admin/hotels/:id — delete hotel
app.delete('/api/admin/hotels/:id', (req, res) => {
  const { id } = req.params;
  const index = hotels.findIndex(h => h.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }
  const removed = hotels.splice(index, 1)[0];
  res.json({ success: true, message: 'Hotel deleted.', removed });
});

// ─────────────────────────────────────────────
// Serve Frontend Static Files (Production / Render)
// ─────────────────────────────────────────────
const distCandidates = [
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, 'dist')
];
const frontendDist = distCandidates.find(p => fs.existsSync(path.join(p, 'index.html')));

if (frontendDist) {
  console.log(`📦 Serving frontend static build from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: '✅ SmartTrip API Server is running! (Frontend dist not built yet)',
      version: '2.0.0'
    });
  });
}

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ SmartTrip API Server running at http://localhost:${PORT}`);
});

module.exports = { app, KARNATAKA_CITIES };
