const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Room name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Room name must be at least 3 characters'],
    maxlength: [30, 'Room name cannot exceed 30 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: 200
  },
  isPrivate: { 
    type: Boolean, 
    default: false 
  },
  password: {
    type: String,
    select: false,
    minlength: [5, 'Password must be at least 4 characters'],
    default: null // null means no password required
  },
  requiresPassword: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: String, 
  }],
  activeUsers: [{
    username: String,
    socketId: String
  }],
  createdBy: { 
    type: String, 
    required: false
  },
  topic: {
    type: String,
    default: 'General Chat'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user count
roomSchema.virtual('userCount').get(function() {
  return this.activeUsers.length;
});

// Pre-save hook to format name and handle password logic
roomSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  
  // Automatically set requiresPassword based on password presence
  if (this.isModified('password')) {
    this.requiresPassword = this.password !== null && this.password !== '';
  }
  
  next();
});

module.exports = mongoose.model('Room', roomSchema);