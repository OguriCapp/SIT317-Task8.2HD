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

// Display user profile
router.get('/profile', isLoggedIn, (req, res) => {
  try {
    const user = db.users.getById(req.session.user.id);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    res.render('users/profile', {
      title: 'User Profile',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving user profile'
    });
  }
});

// Display edit user profile form
router.get('/profile/edit', isLoggedIn, (req, res) => {
  try {
    const user = db.users.getById(req.session.user.id);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    res.render('users/edit', {
      title: 'Edit Profile',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving edit profile form'
    });
  }
});

// Process update user profile request
router.put('/profile', isLoggedIn, (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = db.users.getById(userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    const { displayName, course } = req.body;
    
    // Validate required fields
    if (!displayName) {
      return res.render('users/edit', {
        title: 'Edit Profile',
        user,
        error: 'Display name is required'
      });
    }
    
    // Update user profile
    const updatedUser = db.users.update(userId, {
      displayName,
      course: course || user.course
    });
    
    // Update user info in session
    req.session.user.displayName = updatedUser.displayName;
    
    res.redirect('/users/profile');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error updating user profile'
    });
  }
});

// Display change password form
router.get('/change-password', isLoggedIn, (req, res) => {
  try {
    const user = db.users.getById(req.session.user.id);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    res.render('users/change-password', {
      title: 'Change Password',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving change password form'
    });
  }
});

// Process change password request
router.put('/change-password', isLoggedIn, (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = db.users.getById(userId);
    
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate current password
    if (currentPassword !== user.password) {
      return res.render('users/change-password', {
        title: 'Change Password',
        user,
        error: 'Current password is incorrect'
      });
    }
    
    // Validate new password matches confirmation
    if (newPassword !== confirmPassword) {
      return res.render('users/change-password', {
        title: 'Change Password',
        user,
        error: 'New password and confirmation do not match'
      });
    }
    
    // Validate new password length
    if (newPassword.length < 6) {
      return res.render('users/change-password', {
        title: 'Change Password',
        user,
        error: 'New password must be at least 6 characters'
      });
    }
    
    // Update password
    db.users.update(userId, {
      password: newPassword
    });
    
    res.redirect('/users/profile');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error changing password'
    });
  }
});

module.exports = router; 