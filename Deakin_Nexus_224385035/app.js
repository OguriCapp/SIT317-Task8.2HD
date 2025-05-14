const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Ensure data files exist
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const SCHEDULE_FILE = path.join(DATA_DIR, 'schedule.json');
const ATTENDANCE_FILE = path.join(DATA_DIR, 'attendance.json');

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(SCHEDULE_FILE)) {
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify([]));
}
if (!fs.existsSync(ATTENDANCE_FILE)) {
  fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify([]));
}

// Import routes
const indexRoutes = require('./routes/index');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const scheduleRoutes = require('./routes/schedule');
const attendanceRoutes = require('./routes/attendance');

// Create Express app
const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method')); // Support PUT and DELETE requests
app.use(session({
  secret: 'deakin-nexus-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Set local variables
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Use routes
app.use('/', indexRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/attendance', attendanceRoutes);

// Error handling middleware
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Set server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 