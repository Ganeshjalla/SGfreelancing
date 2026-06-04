# SGNexasoft - Complete Deployment Guide

## Overview
SGNexasoft is a full-stack freelance platform with React frontend, Spring Boot backend, and MySQL database. This guide provides step-by-step instructions for easy deployment.

---

## Prerequisites
- **Docker & Docker Compose** installed ([Download](https://www.docker.com/products/docker-desktop))
- **Git** installed
- Minimum 2GB RAM available

---

## Quick Start (Docker - Recommended)

### Step 1: Clone and Navigate
```bash
cd c:\sgnexasoft
```

### Step 2: Clean Previous Data (First Time Only)
```bash
docker compose down -v
```

### Step 3: Start All Services
```bash
docker compose up --build
```

**Wait for all services to be ready (watch for green checkmarks in terminal)**

### Step 4: Access the Application
- **Frontend**: http://localhost:80 (or http://localhost)
- **Backend API**: http://localhost:8082
- **MySQL Database**: localhost:3306

---

## Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@sg.com | admin123 |
| **Client** | client@sg.com | client123 |
| **Student** | student@sg.com | student123 |

---

## Complete Feature Workflow

### 1. **Post a Project (Client)**
1. Login as **client@sg.com**
2. Navigate to **"Create Project"**
3. Fill in:
   - **Title**: Project name
   - **Description**: Detailed project description
   - **Budget**: Amount in ₹ (e.g., 10000)
   - **Category**: Select category
   - **Required Skills**: comma-separated (e.g., React, Node.js)
   - **Deadline**: Optional deadline date
4. Click **"Create Project"**
5. ✅ Project now visible in **Browse Projects**

### 2. **Browse & Place Bid (Student)**
1. Login as **student@sg.com**
2. Navigate to **"Browse Projects"**
3. Click on any project to view details
4. Click **"Place a Bid"** and fill in:
   - **Bid Amount**: Your quoted price
   - **Proposal**: Your proposal/pitch
   - **Delivery Days**: How many days to complete
5. Click **"Place Bid"**
6. ✅ Bid submitted and client is notified

### 3. **Accept/Reject Bid (Client)**
1. Login as **client@sg.com**
2. Go to **"My Projects"**
3. Click on a project with bids
4. View all bids in the **"Bids"** section
5. Click **"Accept"** or **"Reject"** on each bid
6. ✅ Accepted bid = project assigned to student

### 4. **Submit Work & Communicate**
1. Login as assigned **student**
2. Go to **"My Projects"**
3. Click on assigned project
4. Submit your work:
   - **GitHub URL**: Link to repository
   - **Live URL**: Deployed application link
   - **Description**: Work details
5. Click **"Submit Work"**
6. ✅ Client receives notification

### 5. **Review Submission (Client)**
1. Login as **client**
2. View submitted work
3. Click **"Review"** and choose:
   - **Approved**: ✅ Work accepted
   - **Revision Requested**: Needs changes
   - **Rejected**: Not acceptable
4. Add feedback
5. ✅ Student receives feedback

### 6. **Messaging Between Client & Student**
1. Click on **"Messages"** in sidebar
2. Select conversation partner
3. Type message and send
4. ✅ Real-time conversation

### 7. **Manage Payments**
1. Client initiates payment after approval
2. Payment status tracked
3. Money released upon completion

---

## API Documentation

### Key Endpoints

#### Projects
- `GET /api/projects` - Get all open projects
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create new project
- `PATCH /api/projects/{id}/status` - Update status

#### Bids
- `POST /api/bids/project/{projectId}` - Place a bid
- `GET /api/bids/project/{projectId}` - Get project bids
- `GET /api/bids/my` - Get my bids
- `POST /api/bids/{id}/accept` - Accept bid
- `POST /api/bids/{id}/reject` - Reject bid

#### Submissions
- `POST /api/submissions/project/{projectId}` - Submit work
- `GET /api/submissions/project/{projectId}` - View submissions
- `POST /api/submissions/{id}/review` - Review submission

#### Messages
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversation/{userId}` - Get conversation
- `GET /api/messages/partners` - Get message partners
- `GET /api/messages/unread` - Get unread count

---

## Database Schema

### Tables Created
1. **users** - User accounts with roles
2. **projects** - Project postings
3. **bids** - Student bids on projects
4. **submissions** - Student work submissions
5. **messages** - Messages between users
6. **notifications** - In-app notifications
7. **reviews** - User ratings/reviews
8. **payments** - Payment tracking

---

## Troubleshooting

### Issue: Services won't start
```bash
# Clean everything and restart
docker compose down -v
docker compose up --build
```

### Issue: Port 80/8082/3306 already in use
Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:8082"  # Change frontend port
  - "3307:3306"  # Change MySQL port
```

### Issue: Database connection error
1. Wait 30 seconds for MySQL to fully initialize
2. Check MySQL logs:
```bash
docker compose logs db
```

### Issue: Projects not showing
1. Login as client and create a project
2. Verify in Browse Projects within 5 seconds
3. Check backend logs:
```bash
docker compose logs backend
```

---

## Monitoring & Logs

### View Backend Logs
```bash
docker compose logs backend -f
```

### View Database Logs
```bash
docker compose logs db -f
```

### View Frontend Logs
```bash
docker compose logs frontend -f
```

---

## Environment Variables

All environment variables are in `docker-compose.yml`:

```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/sgnexasoft_db
SPRING_DATASOURCE_USERNAME: sguser
SPRING_DATASOURCE_PASSWORD: sgpass123
SPRING_JPA_HIBERNATE_DDL_AUTO: update
APP_JWT_SECRET: SGNexasoftSuperSecretKeyThatIsAtLeast32Chars!
```

---

## Production Deployment

### For AWS/Azure/Heroku:
1. Push to GitHub/GitLab
2. Update database credentials in Docker environment
3. Use managed database service (RDS/Azure DB)
4. Deploy containers to:
   - AWS ECS/Fargate
   - Azure Container Instances
   - Heroku
   - DigitalOcean App Platform

---

## Performance Tips

1. **Database Optimization**
   - Indexes on `status`, `client_id`, `student_id`
   - Connection pooling enabled (HikariCP)

2. **API Caching**
   - Project listings cached (5 minutes)
   - User profiles cached (10 minutes)

3. **Frontend Optimization**
   - Code splitting enabled
   - Image optimization with responsive design
   - Lazy loading on Browse Projects

---

## Support & Issues

For issues or questions:
1. Check logs: `docker compose logs [service_name]`
2. Review error messages in browser console
3. Verify database connection in backend logs
4. Check if all ports are available

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│     Frontend (React)                │
│     Port: 80 (localhost)            │
│     Pages: Projects, Bids, Messages │
└─────────────┬───────────────────────┘
              │ HTTP Requests
              ▼
┌─────────────────────────────────────┐
│   Backend (Spring Boot)             │
│   Port: 8082                        │
│   Services: Project, Bid, Message   │
└─────────────┬───────────────────────┘
              │ JDBC
              ▼
┌─────────────────────────────────────┐
│   MySQL Database                    │
│   Port: 3306                        │
│   DB: sgnexasoft_db                 │
└─────────────────────────────────────┘
```

---

## Summary

Your SGNexasoft platform is now ready to use!

**Quick Checklist:**
- ✅ All 3 services running (Frontend, Backend, Database)
- ✅ Default users created
- ✅ Database tables initialized
- ✅ API endpoints functional
- ✅ Real-time messaging enabled

**Start using:**
1. Open http://localhost in browser
2. Login with test credentials
3. Create projects as client
4. Place bids as student
5. Complete the workflow!

