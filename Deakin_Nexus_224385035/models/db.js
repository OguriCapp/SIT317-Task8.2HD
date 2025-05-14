const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const SCHEDULE_FILE = path.join(DATA_DIR, 'schedule.json');
const ATTENDANCE_FILE = path.join(DATA_DIR, 'attendance.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Function to read data files
function readDataFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Function to write data files
function writeDataFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// User operations
const users = {
  getAll: () => readDataFile(USERS_FILE),
  
  getById: (id) => {
    const users = readDataFile(USERS_FILE);
    return users.find(user => user.id === id);
  },
  
  getByEmail: (email) => {
    const users = readDataFile(USERS_FILE);
    return users.find(user => user.email === email);
  },
  
  getByUsername: (username) => {
    const users = readDataFile(USERS_FILE);
    return users.find(user => user.username === username);
  },
  
  create: (userData) => {
    const users = readDataFile(USERS_FILE);
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeDataFile(USERS_FILE, users);
    return newUser;
  },
  
  update: (id, userData) => {
    const users = readDataFile(USERS_FILE);
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    const updatedUser = { ...users[userIndex], ...userData, updatedAt: new Date().toISOString() };
    users[userIndex] = updatedUser;
    writeDataFile(USERS_FILE, users);
    return updatedUser;
  },
  
  delete: (id) => {
    const users = readDataFile(USERS_FILE);
    const newUsers = users.filter(user => user.id !== id);
    writeDataFile(USERS_FILE, newUsers);
    return newUsers.length < users.length;
  }
};

// Task operations
const tasks = {
  getAll: () => readDataFile(TASKS_FILE),
  
  getById: (id) => {
    const tasks = readDataFile(TASKS_FILE);
    return tasks.find(task => task.id === id);
  },
  
  getByUserId: (userId) => {
    const tasks = readDataFile(TASKS_FILE);
    return tasks.filter(task => task.createdBy === userId);
  },
  
  create: (taskData) => {
    const tasks = readDataFile(TASKS_FILE);
    const newTask = {
      id: uuidv4(),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    writeDataFile(TASKS_FILE, tasks);
    return newTask;
  },
  
  update: (id, taskData) => {
    const tasks = readDataFile(TASKS_FILE);
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return null;
    
    const updatedTask = { 
      ...tasks[taskIndex], 
      ...taskData, 
      updatedAt: new Date().toISOString() 
    };
    tasks[taskIndex] = updatedTask;
    writeDataFile(TASKS_FILE, tasks);
    return updatedTask;
  },
  
  delete: (id) => {
    const tasks = readDataFile(TASKS_FILE);
    const newTasks = tasks.filter(task => task.id !== id);
    writeDataFile(TASKS_FILE, newTasks);
    return newTasks.length < tasks.length;
  }
};

// Schedule operations
const schedule = {
  getAll: () => readDataFile(SCHEDULE_FILE),
  
  getById: (id) => {
    const schedules = readDataFile(SCHEDULE_FILE);
    return schedules.find(schedule => schedule.id === id);
  },
  
  getByUserId: (userId) => {
    const schedules = readDataFile(SCHEDULE_FILE);
    return schedules.filter(schedule => schedule.userId === userId);
  },
  
  create: (scheduleData) => {
    const schedules = readDataFile(SCHEDULE_FILE);
    const newSchedule = {
      id: uuidv4(),
      ...scheduleData,
      createdAt: new Date().toISOString()
    };
    schedules.push(newSchedule);
    writeDataFile(SCHEDULE_FILE, schedules);
    return newSchedule;
  },
  
  update: (id, scheduleData) => {
    const schedules = readDataFile(SCHEDULE_FILE);
    const scheduleIndex = schedules.findIndex(schedule => schedule.id === id);
    if (scheduleIndex === -1) return null;
    
    const updatedSchedule = { 
      ...schedules[scheduleIndex], 
      ...scheduleData, 
      updatedAt: new Date().toISOString() 
    };
    schedules[scheduleIndex] = updatedSchedule;
    writeDataFile(SCHEDULE_FILE, schedules);
    return updatedSchedule;
  },
  
  delete: (id) => {
    const schedules = readDataFile(SCHEDULE_FILE);
    const newSchedules = schedules.filter(schedule => schedule.id !== id);
    writeDataFile(SCHEDULE_FILE, newSchedules);
    return newSchedules.length < schedules.length;
  }
};

// Attendance operations
const attendance = {
  getAll: () => readDataFile(ATTENDANCE_FILE),
  
  getById: (id) => {
    const attendances = readDataFile(ATTENDANCE_FILE);
    return attendances.find(attendance => attendance.id === id);
  },
  
  getByUserId: (userId) => {
    const attendances = readDataFile(ATTENDANCE_FILE);
    return attendances.filter(attendance => attendance.userId === userId);
  },
  
  create: (attendanceData) => {
    const attendances = readDataFile(ATTENDANCE_FILE);
    const newAttendance = {
      id: uuidv4(),
      ...attendanceData,
      createdAt: new Date().toISOString()
    };
    attendances.push(newAttendance);
    writeDataFile(ATTENDANCE_FILE, attendances);
    return newAttendance;
  },
  
  update: (id, attendanceData) => {
    const attendances = readDataFile(ATTENDANCE_FILE);
    const attendanceIndex = attendances.findIndex(attendance => attendance.id === id);
    if (attendanceIndex === -1) return null;
    
    const updatedAttendance = { 
      ...attendances[attendanceIndex], 
      ...attendanceData, 
      updatedAt: new Date().toISOString() 
    };
    attendances[attendanceIndex] = updatedAttendance;
    writeDataFile(ATTENDANCE_FILE, attendances);
    return updatedAttendance;
  },
  
  delete: (id) => {
    const attendances = readDataFile(ATTENDANCE_FILE);
    const newAttendances = attendances.filter(attendance => attendance.id !== id);
    writeDataFile(ATTENDANCE_FILE, newAttendances);
    return newAttendances.length < attendances.length;
  }
};

module.exports = {
  users,
  tasks,
  schedule,
  attendance
}; 