<div align="center">

# 🛒 E-Commerce Microservices Platform

![GitHub stars](https://img.shields.io/github/stars/utkarshpan/ecommerce-microservices?style=social)
![GitHub forks](https://img.shields.io/github/forks/utkarshpan/ecommerce-microservices?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/utkarshpan/ecommerce-microservices?style=social)

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

### A Production-Ready Cloud-Native E-Commerce Platform

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Docker Commands](#-docker-commands)
- [Kubernetes Commands](#-kubernetes-commands)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 📌 Project Overview

This is a **production-ready, cloud-native e-commerce platform** built with microservices architecture. It demonstrates modern software development practices including:

- ✅ Containerization with Docker
- ✅ Orchestration with Kubernetes
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Microservices design pattern
- ✅ JWT authentication
- ✅ Database per service pattern

---

## 🏗️ Architecture

### System Architecture Diagram
Client Browser (Port 3000)
        |
        v
API Gateway (Port 8000)
        |
        +------> Product Service (Port 8081) -----> Product DB (5433)
        |
        +------> Order Service (Port 8082) -----> Order DB (5434)
        |
        +------> User Service (Port 8083) -----> User DB (5435)

### Request Flow
User Request → API Gateway → Service Discovery → Microservice → Database → Response


---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|:---|:---|:---|
| React | 18.x | UI Framework |
| Material UI | 5.x | Component Library |
| Axios | 1.x | HTTP Client |
| React Router | 6.x | Navigation |

### Backend
| Technology | Version | Purpose |
|:---|:---|:---|
| Node.js | 18.x | Runtime Environment |
| Express | 4.x | Web Framework |
| PostgreSQL | 15.x | Database |
| JWT | 9.x | Authentication |
| bcrypt | 5.x | Password Hashing |

### DevOps
| Technology | Version | Purpose |
|:---|:---|:---|
| Docker | Latest | Containerization |
| Kubernetes | 1.28+ | Orchestration |
| Minikube | Latest | Local K8s Cluster |
| GitHub Actions | Latest | CI/CD Pipeline |

---

## ✨ Features

### Implemented Features

| Feature | Status | Description |
|:---|:---|:---|
| User Registration | ✅ | Sign up with email and password |
| User Login | ✅ | JWT token based authentication |
| Product Listing | ✅ | View all products |
| Product Search | ✅ | Search products by name |
| Category Filter | ✅ | Filter products by category |
| Price Filter | ✅ | Filter by price range |
| Shopping Cart | ✅ | Add, remove, update quantities |
| Checkout Process | ✅ | Place orders |
| Order History | ✅ | View all past orders |
| Order Status | ✅ | Track order status |
| Admin Panel | ✅ | Add new products |

### Planned Features

| Feature | Status | Priority |
|:---|:---|:---|
| Payment Gateway | 📋 Planned | High |
| Product Reviews | 📋 Planned | Medium |
| Wishlist | 📋 Planned | Medium |
| Email Notifications | 📋 Planned | High |
| Real-time Tracking | 📋 Planned | Low |
| Mobile App | 📋 Planned | Low |

---

## 📁 Project Structure
ecommerce-microservices/

- frontend/
  - src/
    - components/
    - pages/
    - App.js
  - Dockerfile
  - package.json

- product-service/
  - index.js
  - Dockerfile
  - package.json

- order-service/
  - index.js
  - Dockerfile
  - package.json

- api-gateway/
  - index.js
  - Dockerfile
  - package.json

- k8s/
  - postgres-deployment.yaml
  - backend-deployment.yaml
  - frontend-deployment.yaml

- .github/workflows/
  - ci-cd.yml

- docker-compose.yml
- README.md

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Installation Command |
|:---|:---|:---|
| Node.js | 18+ | [Download](https://nodejs.org/) |
| Docker Desktop | Latest | [Download](https://docker.com) |
| PostgreSQL | 15+ | [Download](https://postgresql.org) |
| Git | Latest | [Download](https://git-scm.com) |
| Minikube | Latest | `winget install minikube` |

### Option 1: Docker Compose (Easiest)

```bash
# Clone the repository
git clone https://github.com/utkarshpan/ecommerce-microservices.git
cd ecommerce-microservices

# Start all services
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8000
# Product Service: http://localhost:8081
# Order Service: http://localhost:8082

Option 2: Local Development
Step 1: Setup Databases
bash
# Product Database
docker run -d --name product-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=productdb \
  -p 5433:5432 postgres:15

# Order Database
docker run -d --name order-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=orderdb \
  -p 5434:5432 postgres:15

# User Database
docker run -d --name user-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=userdb \
  -p 5435:5432 postgres:15
Step 2: Start Microservices
Open 4 separate terminals:

Terminal 1 - Product Service

bash
cd product-service
npm install
npm start
# Running on http://localhost:8081
Terminal 2 - Order Service

bash
cd order-service
npm install
npm start
# Running on http://localhost:8082
Terminal 3 - API Gateway

bash
cd api-gateway
npm install
npm start
# Running on http://localhost:8000
Terminal 4 - Frontend

bash
cd frontend
npm install
npm start
# Running on http://localhost:3000
Option 3: Kubernetes (Minikube)
bash
# Start Minikube
minikube start --driver=docker

# Load Docker images
minikube image load product-service:latest
minikube image load order-service:latest
minikube image load frontend:latest

# Deploy to Kubernetes
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services

# Access the application
minikube service frontend --url
📚 API Documentation
Product Service Endpoints (Port 8081)
Method	Endpoint	Description	Auth Required
GET	/api/products	Get all products	No
GET	/api/products/:id	Get product by ID	No
POST	/api/products	Create new product	Yes
PUT	/api/products/:id/stock	Update product stock	Yes
Order Service Endpoints (Port 8082)
Method	Endpoint	Description	Auth Required
GET	/api/orders	Get all orders	Yes
GET	/api/orders/:id	Get order by ID	Yes
POST	/api/orders	Create new order	Yes
PUT	/api/orders/:id/status	Update order status	Yes
API Gateway Endpoints (Port 8000)
Method	Endpoint	Forwards To
GET	/api/products	Product Service
POST	/api/products	Product Service
GET	/api/orders	Order Service
POST	/api/orders	Order Service
GET	/health	Gateway Health Check
🔐 Authentication
Register a New User
Request:

http
POST /api/auth/signup
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
Response:

json
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
Login User
Request:

http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
Response:

json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
Access Protected Routes
Add the JWT token to your request headers:

http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
🐳 Docker Commands
Building Images
bash
# Build individual services
docker build -t product-service ./product-service
docker build -t order-service ./order-service
docker build -t frontend ./frontend

# Build all services with Docker Compose
docker compose build
Running Containers
bash
# Run all services
docker compose up

# Run in background
docker compose up -d

# Run specific service
docker compose up product-service
Managing Containers
bash
# List running containers
docker ps

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
☸️ Kubernetes Commands
Cluster Management
bash
# Start Minikube
minikube start --driver=docker

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete

# Check cluster status
kubectl cluster-info
Deployment Commands
bash
# Deploy all services
kubectl apply -f k8s/

# Delete all services
kubectl delete -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
Debugging
bash
# View pod logs
kubectl logs -f <pod-name>

# Describe pod (for troubleshooting)
kubectl describe pod <pod-name>

# Execute command in pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward for local access
kubectl port-forward service/frontend 3000:3000
Scaling
bash
# Scale product service to 3 replicas
kubectl scale deployment product-service --replicas=3

# Scale order service to 2 replicas
kubectl scale deployment order-service --replicas=2
🔄 CI/CD Pipeline
GitHub Actions Workflow
The project uses GitHub Actions for continuous integration and deployment.

Trigger: Push to main branch

Pipeline Stages:

Test Backend

Install dependencies

Run unit tests

Check code style

Test Frontend

Install dependencies

Run build

Check for errors

Build Docker Images

Build backend image

Build frontend image

Tag images

Deploy (Optional)

Push to registry

Deploy to Kubernetes

Workflow File: .github/workflows/ci-cd.yml

Pipeline Status
https://github.com/utkarshpan/ecommerce-microservices/actions/workflows/ci-cd.yml/badge.svg

🧪 Testing
Backend Tests
bash
# Test Product Service
cd product-service
npm test

# Test Order Service
cd order-service
npm test
Frontend Tests
bash
cd frontend
npm test

# Run tests with coverage
npm test -- --coverage
Sample Test Output
text
PASS  src/App.test.js
  ✓ renders app without crashing (100ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.5s
🐛 Troubleshooting
Common Issues and Solutions
Issue	Likely Cause	Solution
Port already in use	Another process using the port	netstat -ano | findstr :PORT then taskkill /PID <PID> /F
Database connection failed	Database not running	docker ps | findstr postgres and start missing containers
Docker daemon not running	Docker Desktop not started	Start Docker Desktop from Start Menu
Minikube won't start	Previous cluster not cleaned	minikube delete then minikube start
Pods stuck in Pending	Insufficient resources	Increase Docker Desktop resources
npm install fails	Network issues	npm cache clean --force then retry
Debug Commands
bash
# Check if services are running
curl http://localhost:8000/health

# Check database connection
docker exec -it product-db psql -U postgres -d productdb -c "SELECT 1"

# View Docker logs
docker logs product-service

# View Kubernetes events
kubectl get events --sort-by='.lastTimestamp'

# Check port availability
netstat -ano | findstr 8081
📈 Future Enhancements
Short Term (Next 3 months)
Add Redis caching for product catalog

Implement message queue (Kafka/RabbitMQ)

Add monitoring with Prometheus + Grafana

Implement distributed tracing with Jaeger

Add end-to-end tests with Cypress

Medium Term (3-6 months)
Deploy to cloud (AWS EKS / GCP GKE)

Add payment gateway integration (Stripe/Razorpay)

Implement WebSocket for real-time order tracking

Add Elasticsearch for advanced search

Implement rate limiting per user

Long Term (6-12 months)
Build mobile app (React Native)

Implement AI product recommendations

Add multi-language support (i18n)

Implement service mesh (Istio)

Add chaos engineering practices

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/amazing)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing)

Open a Pull Request

Guidelines
Follow existing code style

Add tests for new features

Update documentation

Write meaningful commit messages

👨‍💻 Author
Utkarsh Pandey

GitHub: @utkarshpan

Project Link: https://github.com/utkarshpan/ecommerce-microservices

📄 License
This project is for educational purposes.

🌟 Show Your Support
If you found this project helpful, please give it a ⭐️ on GitHub!

📞 Contact
For questions, suggestions, or support, please open an issue on GitHub.

<div align="center">
Built with ❤️ using modern software engineering practices
Thank you for visiting!

</div> ```
