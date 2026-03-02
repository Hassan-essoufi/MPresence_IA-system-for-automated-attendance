# 🚀 FacePresence

### AI-Powered Real-Time Attendance Management Platform

> A full-stack deep learning system that transforms face recognition into a scalable attendance solution.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-High%20Performance-009688)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![PyTorch](https://img.shields.io/badge/PyTorch-DeepLearning-red)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 🎯 Project Impact

FacePresence demonstrates the ability to:

* Deploy deep learning models in production APIs
* Design modular backend architectures
* Build real-time computer vision systems
* Integrate ML with full-stack dashboards
* Transform raw embeddings into actionable analytics

This project bridges **AI research and real-world system engineering**.

---

# 🖥 Live System Overview

## 🔷 Dashboard

📊 Real-time attendance metrics
📈 Weekly trend visualization
📉 Attendance rate analysis
📋 Absentee tracking

### 📸 Screenshot – Dashboard

`docs/screenshots/dashboard-overview.png`

<img src="docs/screenshots/dashboard-overview.png" width="800"/>

---

## 👤 Person Management

* Register new individuals
* Upload or capture face images
* Automatic face cropping
* Embedding generation and storage

### 📸 Screenshot – Person Management

`docs/screenshots/person-management.png`

<img src="docs/screenshots/person-management.png" width="800"/>

---

## 🎥 Real-Time Recognition

* Live webcam detection
* Face embedding extraction
* Cosine similarity matching
* Automatic attendance marking

### 📸 Screenshot – Real-Time Stream

`docs/screenshots/real-time-recognition.png`

<img src="docs/screenshots/real-time-recognition.png" width="800"/>

---

## 📹 Video Recognition Pipeline

* Upload recorded video
* Frame-by-frame face detection
* Recognition across video stream
* Batch attendance generation

### 📸 Screenshot – Video Processing

`docs/screenshots/video-recognition.png`

<img src="docs/screenshots/video-recognition.png" width="800"/>

---

## 📁 CSV Export & Analytics

* Export attendance by selected date
* Generate structured CSV reports
* Dashboard statistics from CSV

### 📸 Screenshot – CSV Export

`docs/screenshots/csv-export.png`

<img src="docs/screenshots/csv-export.png" width="800"/>

---

# 🧠 Machine Learning Pipeline

### Step 1 – Face Detection

MTCNN detects and aligns faces.

### Step 2 – Face Embedding

FaceNet generates 128-d embedding vectors using:

* PyTorch
* OpenCV

### Step 3 – Recognition Logic

* Cosine similarity comparison
* Threshold-based validation
* Confidence scoring

---

# 🏗 Architecture

```
React (Frontend)
        ↓ REST API
FastAPI Backend
        ↓
Face Recognition Engine
        ↓
SQL Database (SQLAlchemy ORM)
```

Built with:

* FastAPI
* SQLAlchemy
* React
* Vite
* Recharts

---

# 🔌 API Documentation

Interactive Swagger UI available at:

```
/docs
```

### Main Endpoints

```
GET    /attendance/all
GET    /attendance/absent
POST   /attendance/real_time_stream
POST   /attendance/real_time_stream/stop
POST   /attendance/video_recognition
GET    /attendance/export_csv
GET    /attendance/stats_from_csv
```

---

# 🚀 How to Run

## Backend

```bash
pip install -r requirements.txt
uvicorn backend.src.api.main:app --reload
```

## Frontend

```bash
npm install
npm run dev
```

---

# 📊 Engineering Decisions

* Model loaded once at startup
* Modular service-layer architecture
* CSV-driven lightweight analytics
* Controlled stream lifecycle
* Separation of ML pipeline and API layer

---

# 📈 Future Enhancements

* JWT authentication
* Role-based access control
* Docker containerization
* Cloud deployment (AWS / GCP)
* Liveness detection
* WebSocket real-time dashboard

---

# 👤 Author

Hassan Essoufi
Machine Learning Engineer

---

# 📄 License

MIT License

---

# 📂 How to Add Your Screenshots

Create this structure:

```
docs/
 └── screenshots/
```

Add images with these names:

```
dashboard-overview.png
person-management.png
real-time-recognition.png
video-recognition.png
csv-export.png
```

# FacePresence - Attendance Management System

## Overview
FacePresence is a full-stack attendance platform with:
- Frontend dashboard (React + Vite)
- FastAPI backend
- Real-time and video-based face recognition workflows
- Attendance export to CSV

## Tech Stack

### Backend (Python)
- FastAPI
- SQLAlchemy
- OpenCV / FaceNet / PyTorch

### Frontend (Web)
- React
- React Router
- Vite
- Recharts
- MUI + Emotion

## Main Features
- Person management (upload or camera capture)
- Face crop before augmentation (camera flow)
- Attendance dashboard with analytics
- Weekly attendance and attendance-rate charts
- Video recognition pipeline
- CSV export for attendance by selected date

## API (FastAPI)
- `/attendance/all`
- `/attendance/absent`
- `/attendance/real_time_stream`
- `/attendance/real_time_stream/stop`
- `/attendance/video_recognition`
- `/attendance/export_csv`
- `/attendance/stats_from_csv` (currently used for dashboard chart data)

## Run the Project

### 1) Backend
```bash
pip install -r requirements.txt
uvicorn backend.src.api.main:app --reload
```

### 2) Frontend
```bash
npm install
npm run dev
```

## Screenshots (placeholders)

### Frontend Screenshots
> Replace the image paths below with your real screenshots.

![Frontend - Dashboard](docs/screenshots/frontend-dashboard.png)
![Frontend - Person Management](docs/screenshots/frontend-person-management.png)

### FastAPI Screenshots
![FastAPI - Swagger UI](docs/screenshots/fastapi-swagger.png)
![FastAPI - Endpoint Test](docs/screenshots/fastapi-endpoint-test.png)

### Video Recognition Example
![Video Recognition Example](docs/screenshots/video-recognition-example.png)

### CSV Generation Example
![CSV Generation Example](docs/screenshots/csv-generation-example.png)

## Notes
- Frontend package versions are listed in `package.json`.
- Backend dependencies are pinned in `requirements.txt`.
- Create `docs/screenshots/` and add your images using the same filenames (or update links).
