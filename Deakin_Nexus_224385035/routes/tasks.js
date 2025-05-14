const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Authentication middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Get all tasks
router.get('/', isLoggedIn, (req, res) => {
  try {
    const user = db.users.getById(req.session.user.id);
    const tasks = db.tasks.getByUserId(user.id);
    
    res.render('tasks/index', {
      title: 'My Tasks',
      user,
      tasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving tasks'
    });
  }
});

// Show create task form
router.get('/new', isLoggedIn, (req, res) => {
  const user = db.users.getById(req.session.user.id);
  res.render('tasks/new', {
    title: 'Create New Task',
    user
  });
});

// Handle create task request
router.post('/', isLoggedIn, (req, res) => {
  try {
    const { title, description, dueDate, priority, status, progress, course } = req.body;
    
    // Validate required fields
    if (!title || !dueDate) {
      return res.render('tasks/new', {
        title: 'Create New Task',
        error: 'Title and due date are required',
        formData: req.body,
        user: db.users.getById(req.session.user.id)
      });
    }
    
    // Create new task
    const newTask = db.tasks.create({
      title,
      description: description || '',
      dueDate,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      progress: progress ? parseInt(progress) : 0,
      course: course || '',
      createdBy: req.session.user.id
    });
    
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.render('tasks/new', {
      title: 'Create New Task',
      error: 'Error creating task',
      formData: req.body,
      user: db.users.getById(req.session.user.id)
    });
  }
});

// Show single task details
router.get('/:id', isLoggedIn, (req, res) => {
  try {
    const taskId = req.params.id;
    const task = db.tasks.getById(taskId);
    
    if (!task) {
      return res.status(404).render('404', { title: 'Task Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has access to this task
    if (task.createdBy !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this task'
      });
    }
    
    res.render('tasks/show', {
      title: task.title,
      task,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving task details'
    });
  }
});

// Show edit task form
router.get('/:id/edit', isLoggedIn, (req, res) => {
  try {
    const taskId = req.params.id;
    const task = db.tasks.getById(taskId);
    
    if (!task) {
      return res.status(404).render('404', { title: 'Task Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to edit this task
    if (task.createdBy !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to edit this task'
      });
    }
    
    res.render('tasks/edit', {
      title: 'Edit Task',
      task,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error retrieving task edit form'
    });
  }
});

// Handle update task request
router.put('/:id', isLoggedIn, (req, res) => {
  try {
    const taskId = req.params.id;
    const task = db.tasks.getById(taskId);
    
    if (!task) {
      return res.status(404).render('404', { title: 'Task Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to update this task
    if (task.createdBy !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to update this task'
      });
    }
    
    const { title, description, dueDate, status, progress, priority, course } = req.body;
    
    // Validate required fields
    if (!title || !dueDate) {
      return res.render('tasks/edit', {
        title: 'Edit Task',
        task,
        error: 'Title and due date are required',
        user
      });
    }
    
    // Update task
    const updatedTask = db.tasks.update(taskId, {
      title,
      description: description || '',
      dueDate,
      status: status || task.status,
      progress: progress !== undefined ? parseInt(progress) : task.progress,
      priority: priority || task.priority,
      course: course || task.course
    });
    
    res.redirect(`/tasks/${taskId}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error updating task'
    });
  }
});

// Delete task
router.delete('/:id', isLoggedIn, (req, res) => {
  try {
    const taskId = req.params.id;
    const task = db.tasks.getById(taskId);
    
    if (!task) {
      return res.status(404).render('404', { title: 'Task Not Found' });
    }
    
    const user = db.users.getById(req.session.user.id);
    
    // Verify current user has permission to delete this task
    if (task.createdBy !== user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to delete this task'
      });
    }
    
    // Delete task
    db.tasks.delete(taskId);
    
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error deleting task'
    });
  }
});

module.exports = router; 