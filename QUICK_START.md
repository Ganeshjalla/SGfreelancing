# 🚀 SGNexasoft - Quick Start Guide

## One-Line Deploy

```bash
cd c:\sgnexasoft && docker compose up --build
```

## 🎯 What Happens After Deploy

✅ **Frontend** opens at: http://localhost
✅ **Backend API** at: http://localhost:8082  
✅ **MySQL Database** initialized with default data
✅ **3 Test Users Created** - ready to use

---

## 👤 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 Admin | admin@sg.com | admin123 |
| 👔 Client | client@sg.com | client123 |
| 👨‍🎓 Student | student@sg.com | student123 |

---

## 📋 Complete Workflow (Step-by-Step)

### Step 1️⃣: Client Posts Project
1. **Login** as `client@sg.com`
2. Click **"Create Project"** in sidebar
3. Fill in project details:
   - Title
   - Description  
   - Budget (₹)
   - Category
   - Required Skills
   - Deadline (optional)
4. Click **"Post Project"**
5. ✅ Project appears in Browse Projects

### Step 2️⃣: Student Finds & Bids
1. **Login** as `student@sg.com` (new browser tab)
2. Click **"Browse Projects"**
3. See the client's project in the list
4. Click on project to view details
5. Click **"Place a Bid"**
6. Fill in:
   - Bid Amount
   - Proposal Message
   - Delivery Days
7. Click **"Submit Bid"**
8. ✅ Client gets notification

### Step 3️⃣: Client Accepts Bid
1. **Switch back** to client browser tab
2. Go to **"My Projects"**
3. Click on your posted project
4. View **"Bids"** section
5. See student's bid
6. Click **"Accept Bid"**
7. ✅ Student assigned to project

### Step 4️⃣: Student Submits Work
1. **Switch** to student browser tab
2. Go to **"My Projects"**
3. Click assigned project
4. Click **"Submit Work"**
5. Fill in submission:
   - GitHub URL (optional)
   - Live URL (optional)
   - Description
6. Click **"Submit"**
7. ✅ Client gets notification

### Step 5️⃣: Client Reviews Work
1. **Switch** to client browser tab
2. Go to assigned project
3. View **"Submissions"** tab
4. See student's work
5. Click **"Review"**
6. Choose action:
   - ✅ **Approve** - Work accepted
   - ✏️ **Request Changes** - Need revisions
   - ❌ **Reject** - Not acceptable
7. Add feedback message
8. Click **"Submit Review"**
9. ✅ Student gets feedback notification

### Step 6️⃣: Send Messages
1. Click **"Messages"** in either account
2. Select conversation partner
3. Type and send messages
4. ✅ Real-time chat working

---

## ✨ Features Tested

After completing workflow above, you've tested:

✅ **Project Management**
- Create projects
- Browse projects
- Update project status

✅ **Bidding System**
- Place bids
- Accept bids
- Reject bids
- Multiple bids on one project

✅ **Work Submission**
- Submit completed work
- Attach GitHub/Live URLs
- Provide descriptions

✅ **Review System**
- Review submissions
- Provide feedback
- Approve/Request changes

✅ **Messaging**
- Send messages
- View conversation
- Mark messages as read

✅ **Notifications**
- Receive notifications
- Real-time updates
- Notification types

---

## 🛑 If Something Goes Wrong

### Projects Don't Show Up
```bash
# Restart services
docker compose down
docker compose up --build
```

### Can't Login
- Check email spelling (it's case-sensitive in some systems)
- Verify caps lock is off
- Try incognito/private mode browser

### Database Error
```bash
# Check database logs
docker compose logs db

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

### Port Already in Use
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "8080:80"      # Frontend: http://localhost:8080
  - "8083:8082"    # Backend: http://localhost:8083
  - "3307:3306"    # MySQL: localhost:3307
```

---

## 🔧 Advanced Options

### View Live Logs
```bash
docker compose logs -f
```

### Stop Services
```bash
docker compose down
```

### Clean Everything
```bash
docker compose down -v
```

### Restart Single Service
```bash
docker compose restart backend
docker compose restart db
docker compose restart frontend
```

---

## 📱 Browser Tips

1. **Use Two Tabs** - One as client, one as student for testing
2. **Clear Cache** - If pages don't update: Ctrl+Shift+Delete
3. **F12 Console** - Check for any JavaScript errors

---

## ✅ Verification Checklist

After deploying, verify:

- [ ] Frontend loads at http://localhost
- [ ] Can login with test credentials
- [ ] Can see "Browse Projects" page
- [ ] Can create a project (as client)
- [ ] Can see created project in browse
- [ ] Can place a bid (as student)
- [ ] Can accept bid (as client)
- [ ] Can see assigned student in project
- [ ] Can send message to other user
- [ ] Can see notifications
- [ ] Can submit work (as student)
- [ ] Can review work (as client)

---

## 📞 Need Help?

1. **Check DEPLOYMENT.md** for detailed troubleshooting
2. **Check Docker logs**: `docker compose logs [service]`
3. **Browser console** (F12): Check for errors
4. **Terminal errors**: Read error messages carefully

---

## 🎉 All Set!

You now have a fully functional freelance platform running locally!

**Features Working:**
- User authentication
- Project posting and browsing
- Bidding system
- Work submission and review
- Real-time messaging
- Notifications
- Admin dashboard

**Time to Explore:** 5-10 minutes with test workflow above

Enjoy! 🚀
