const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Home route
router.get('/', (req, res) => {
  // Check if user is logged in
  if (req.session.user) {
    // Redirect to dashboard
    return res.redirect('/dashboard');
  }
  
  // Show landing page
  res.render('index', { title: 'Deakin Nexus' });
});

// Dashboard route
router.get('/dashboard', async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    // Get user info
    const user = db.users.getById(req.session.user.id);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    // Get user's tasks
    const allTasks = db.tasks.getByUserId(user.id);
    const tasks = allTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);
    
    // Get tasks by status
    const todoCount = allTasks.filter(task => task.status === 'TODO').length;
    const inProgressCount = allTasks.filter(task => task.status === 'IN_PROGRESS').length;
    const reviewCount = allTasks.filter(task => task.status === 'REVIEW').length;
    const completedCount = allTasks.filter(task => task.status === 'COMPLETED').length;
    
    // Get user schedule
    const schedules = db.schedule.getByUserId(user.id);
    
    // Get user attendance
    const attendances = db.attendance.getByUserId(user.id);
    
    // Render dashboard
    res.render('dashboard', { 
      title: 'Dashboard', 
      user: user,
      tasks,
      schedules,
      attendances,
      taskCounts: {
        todo: todoCount,
        inProgress: inProgressCount,
        review: reviewCount,
        completed: completedCount,
        total: todoCount + inProgressCount + reviewCount + completedCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      title: 'Error', 
      message: 'Internal server error'
    });
  }
});

// Login page route
router.get('/login', (req, res) => {
  // If user is logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  res.render('login', { title: 'Login' });
});

// Login process route
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = db.users.getByEmail(email);
    
    // Check if user exists and password matches
    // Note: In real projects, bcrypt should be used to encrypt passwords
    if (!user || password !== user.password) {
      return res.render('login', { 
        title: 'Login',
        error: 'Invalid email or password'
      });
    }
    
    // Save user to session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };
    
    // Login success, redirect to dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { 
      title: 'Login',
      error: 'Internal server error'
    });
  }
});

// Register page route
router.get('/register', (req, res) => {
  // If user is logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  res.render('register', { title: 'Register' });
});

// Register process route
router.post('/register', (req, res) => {
  try {
    const { username, email, password, displayName, studentId, course } = req.body;
    
    // Check if user already exists
    const existingUser = db.users.getByEmail(email) || db.users.getByUsername(username);
    
    if (existingUser) {
      return res.render('register', { 
        title: 'Register',
        error: 'User with this email or username already exists',
        formData: req.body
      });
    }
    
    // Create new user
    // Note: In real projects, bcrypt should be used to encrypt passwords
    const newUser = db.users.create({
      username,
      email,
      password,
      displayName,
      studentId,
      course,
      role: 'STUDENT',
      isActive: true
    });
    
    // Auto login
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role
    };
    
    // Register success, redirect to dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('register', { 
      title: 'Register',
      error: 'Internal server error',
      formData: req.body
    });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Destroy session
  req.session.destroy();
  
  // Redirect to home
  res.redirect('/');
});

module.exports = router; 