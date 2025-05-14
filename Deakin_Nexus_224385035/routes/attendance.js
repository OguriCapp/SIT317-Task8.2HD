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

// Get all attendance records
router.get('/', isLoggedIn, (req, res) => {
  try {
    const user = db.users.getById(req.session.user.id);
    const attendances = db.attendance.getByUserId(user.id);
    
    res.render('attendance/index', {
      title: 'My Attendance Records',
      user,
      attendances
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving attendance records'
    });
  }
});

// Display create attendance record form
router.get('/new', isLoggedIn, (req, res) => {
  const user = db.users.getById(req.session.user.id);
  res.render('attendance/new', {
    title: 'Create New Attendance Record',
    user
  });
});

// Process create attendance record request
router.post('/', isLoggedIn, (req, res) => {
  try {
    const { courseCode, courseName, date, status, remarks } = req.body;
    
    // Validate required fields
    if (!courseCode || !courseName || !date || !status) {
      return res.render('attendance/new', {
        title: 'Create New Attendance Record',
        error: 'Course code, course name, date and status are required',
        formData: req.body,
        user: db.users.getById(req.session.user.id)
      });
    }
    
    // Create new attendance record
    const newAttendance = db.attendance.create({
      courseCode,
      courseName,
      date,
      status,
      remarks: remarks || '',
      userId: req.session.user.id
    });
    
    res.redirect('/attendance');
  } catch (err) {
    console.error(err);
    res.render('attendance/new', {
      title: 'Create New Attendance Record',
      error: 'Error creating attendance record',
      formData: req.body,
      user: db.users.getById(req.session.user.id)
    });
  }
});

// Display single attendance record details
router.get('/:id', isLoggedIn, (req, res) => {
  try {
    const attendanceId = req.params.id;
    const attendance = db.attendance.getById(attendanceId);
    
    if (!attendance) {
      return res.status(404).render('404', { title: 'Attendance Record Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to access this attendance record
    if (attendance.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this attendance record'
      });
    }
    
    res.render('attendance/show', {
      title: `${attendance.courseName} Attendance`,
      attendance,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving attendance record details'
    });
  }
});

// Display edit attendance record form
router.get('/:id/edit', isLoggedIn, (req, res) => {
  try {
    const attendanceId = req.params.id;
    const attendance = db.attendance.getById(attendanceId);
    
    if (!attendance) {
      return res.status(404).render('404', { title: 'Attendance Record Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to edit this attendance record
    if (attendance.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to edit this attendance record'
      });
    }
    
    res.render('attendance/edit', {
      title: 'Edit Attendance Record',
      attendance,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving attendance record edit form'
    });
  }
});

// Process update attendance record request
router.put('/:id', isLoggedIn, (req, res) => {
  try {
    const attendanceId = req.params.id;
    const attendance = db.attendance.getById(attendanceId);
    
    if (!attendance) {
      return res.status(404).render('404', { title: 'Attendance Record Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to update this attendance record
    if (attendance.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to update this attendance record'
      });
    }
    
    const { courseCode, courseName, date, status, remarks } = req.body;
    
    // Validate required fields
    if (!courseCode || !courseName || !date || !status) {
      return res.render('attendance/edit', {
        title: 'Edit Attendance Record',
        attendance,
        error: 'Course code, course name, date and status are required',
        user
      });
    }
    
    // Update attendance record
    const updatedAttendance = db.attendance.update(attendanceId, {
      courseCode,
      courseName,
      date,
      status,
      remarks: remarks || ''
    });
    
    res.redirect(`/attendance/${attendanceId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error updating attendance record'
    });
  }
});

// Delete attendance record
router.delete('/:id', isLoggedIn, (req, res) => {
  try {
    const attendanceId = req.params.id;
    const attendance = db.attendance.getById(attendanceId);
    
    if (!attendance) {
      return res.status(404).render('404', { title: 'Attendance Record Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to delete this attendance record
    if (attendance.userId !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to delete this attendance record'
      });
    }
    
    // Delete attendance record
    db.attendance.delete(attendanceId);
    
    res.redirect('/attendance');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error deleting attendance record'
    });
  }
});

module.exports = router; 