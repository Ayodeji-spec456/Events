const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  genre: {
    type: String,
    required: [true, 'Event genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['music', 'sports', 'technology', 'business', 'entertainment', 'education', 'arts', 'food', 'health', 'other'],
    default: 'other'
  },
  price: {
    type: Number,
    required: [true, 'Event price is required'],
    min: [0, 'Price cannot be negative']
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);