# QuantumCrew-DevHack
# Project Vrishabhavathi - Real-Time Water Circulation Monitor

A comprehensive IoT hackathon project visualizing Bengaluru as a living circulatory system for water management.

## 🏗️ Project Structure

```
project-vrishabhavathi/
├── frontend/          # React + TailwindCSS + D3.js dashboard
├── backend/           # Flask API + WebSocket server
├── iot-simulator/     # Python IoT sensor simulator
├── README.md          # This file
└── package.json       # Root package configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### 🎯 **One-Click Setup (Recommended)**

**Option 1: Python Script (Cross-platform)**
```bash
python setup_and_run.py
```

**Option 2: Windows Batch File**
```bash
start_system.bat
```

**Option 3: PowerShell Script (Windows)**
```powershell
.\start_system.ps1
```

### Manual Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd project-vrishabhavathi
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

2. **Start the system:**
```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start IoT simulator
cd iot-simulator
python simulator.py

# Terminal 3: Start frontend
cd frontend
npm start
```

3. **Access the dashboard:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- WebSocket: ws://localhost:5000

## 🎯 Demo Instructions

1. **One-Click Demo:**
```bash
python iot-simulator/simulator.py
```
This starts sending live mock sensor data every 5 seconds.

2. **Interactive Features:**
- Watch real-time sensor updates on the dashboard
- See animated flow lines on the Bengaluru map
- Monitor alerts when capacity exceeds 80%
- Control valves through the AI brain interface

## 🏛️ Architecture

### Frontend (React + TailwindCSS)
- **Real-time Dashboard:** Live sensor data cards with neumorphic design
- **Interactive Map:** Bengaluru visualization with Leaflet showing sensors, lakes, and flow lines
- **Charts:** Rainfall vs storage trends using Chart.js
- **Alerts:** Overflow risk notifications with visual indicators

### Backend (Flask + WebSocket)
- **REST API:** Sensor data, forecasts, and control endpoints
- **WebSocket:** Real-time data streaming to frontend
- **SQLite:** Persistent storage for AI decisions and historical data

### IoT Simulator (Python)
- **Mock Sensors:** Rain gauge, water level, flow sensors
- **Realistic Data:** Simulates actual Bengaluru weather patterns
- **REST Integration:** Sends data to backend every 5 seconds

### AI Brain (Python)
- **Smart Decisions:** Automated water routing based on rainfall and storage
- **Predictive Logic:** Optimizes water flow to recharge wells, lakes, and overflow areas
- **Control Interface:** Manual valve control with AI recommendations

## 🎨 Features

### Real-Time Monitoring
- Live rainfall data (mm)
- Sponge bed water levels (%)
- Flow rates in drainage veins (L/min)
- Storage tank capacity (lungs) (%)
- Valve/heart status (Open/Closed)

### Interactive Visualization
- Bengaluru map with sensor locations
- Color-coded sensor status (green/yellow/red)
- Animated flow lines representing water circulation
- Lake and recharge well nodes

### Smart Alerts
- Overflow risk warnings (>80% capacity)
- Rainfall predictions
- System health monitoring
- Emergency notifications

## 🔧 API Endpoints

- `GET /api/sensors` - Live sensor data
- `GET /api/forecast` - Rainfall forecast
- `POST /api/control` - Valve control
- `GET /api/ai-decision` - AI recommendations
- `WebSocket /` - Real-time updates

## 📱 Mobile Responsive

The dashboard is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- Smart displays

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd backend
# Deploy with Procfile
```

### Database
- SQLite for development
- PostgreSQL for production

## 🎯 Hackathon Highlights

- **Real-time:** Live data updates every 5 seconds
- **Interactive:** Clickable map with sensor details
- **Smart:** AI-powered water management decisions
- **Beautiful:** Neumorphic UI with smooth animations
- **Scalable:** Modular architecture for easy extension

## 🤝 Contributing

This is a hackathon project showcasing:
- IoT sensor simulation
- Real-time web applications
- Smart city water management
- Creative data visualization

## 📄 License

MIT License - Feel free to use for educational and hackathon purposes.
