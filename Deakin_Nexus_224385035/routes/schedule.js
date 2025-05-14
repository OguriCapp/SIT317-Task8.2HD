const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware to verify if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Get all schedules
router.get('/', isLoggedIn, (req, res) => {
  try {
    const user = db.users.getById(req.session.user.id);
    const schedules = db.schedule.getByUserId(user.id);
    
    res.render('schedule/index', {
      title: 'My Schedule',
      user,
      schedules
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving schedule'
    });
  }
});

// Display create schedule entry form
router.get('/new', isLoggedIn, (req, res) => {
  const user = db.users.getById(req.session.user.id);
  res.render('schedule/new', {
    title: 'Create New Schedule Entry',
    user
  });
});

// Process create schedule entry request
router.post('/', isLoggedIn, (req, res) => {
  try {
    const { courseCode, courseName, dayOfWeek, startTime, endTime, location, notes } = req.body;
    
    // Validate required fields
    if (!courseCode || !courseName || !dayOfWeek || !startTime || !endTime) {
      return res.render('schedule/new', {
        title: 'Create New Schedule Entry',
        error: 'Course code, course name, day of week, start time and end time are required',
        formData: req.body,
        user: db.users.getById(req.session.user.id)
      });
    }
    
    // Create new schedule entry
    const newSchedule = db.schedule.create({
      courseCode,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      location: location || '',
      notes: notes || '',
      userId: req.session.user.id
    });
    
    res.redirect('/schedule');
  } catch (err) {
    console.error(err);
    res.render('schedule/new', {
      title: 'Create New Schedule Entry',
      error: 'Error creating schedule entry',
      formData: req.body,
      user: db.users.getById(req.session.user.id)
    });
  }
});

// Display single schedule entry details
router.get('/:id', isLoggedIn, (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = db.schedule.getById(scheduleId);
    
    if (!schedule) {
      return res.status(404).render('404', { title: 'Schedule Entry Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to access this schedule entry
    if (schedule.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this schedule entry'
      });
    }
    
    res.render('schedule/show', {
      title: schedule.courseName,
      schedule,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving schedule entry details'
    });
  }
});

// Display edit schedule entry form
router.get('/:id/edit', isLoggedIn, (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = db.schedule.getById(scheduleId);
    
    if (!schedule) {
      return res.status(404).render('404', { title: 'Schedule Entry Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to edit this schedule entry
    if (schedule.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to edit this schedule entry'
      });
    }
    
    res.render('schedule/edit', {
      title: 'Edit Schedule Entry',
      schedule,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving schedule entry edit form'
    });
  }
});

// Process update schedule entry request
router.put('/:id', isLoggedIn, (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = db.schedule.getById(scheduleId);
    
    if (!schedule) {
      return res.status(404).render('404', { title: 'Schedule Entry Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to update this schedule entry
    if (schedule.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to update this schedule entry'
      });
    }
    
    const { courseCode, courseName, dayOfWeek, startTime, endTime, location, notes } = req.body;
    
    // Validate required fields
    if (!courseCode || !courseName || !dayOfWeek || !startTime || !endTime) {
      return res.render('schedule/edit', {
        title: 'Edit Schedule Entry',
        schedule,
        error: 'Course code, course name, day of week, start time and end time are required',
        user
      });
    }
    
    // Update schedule entry
    const updatedSchedule = db.schedule.update(scheduleId, {
      courseCode,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      location: location || '',
      notes: notes || ''
    });
    
    res.redirect(`/schedule/${scheduleId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error updating schedule entry'
    });
  }
});

// Delete schedule entry
router.delete('/:id', isLoggedIn, (req, res) => {
  try {
    const scheduleId = req.params.id;
    const schedule = db.schedule.getById(scheduleId);
    
    if (!schedule) {
      return res.status(404).render('404', { title: 'Schedule Entry Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to delete this schedule entry
    if (schedule.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to delete this schedule entry'
      });
    }
    
    // Delete schedule entry
    db.schedule.delete(scheduleId);
    
    res.redirect('/schedule');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error deleting schedule entry'
    });
  }
});

module.exports = router; 