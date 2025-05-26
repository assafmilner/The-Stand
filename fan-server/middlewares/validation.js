// fan-server/middlewares/validation.js - SIMPLE VERSION
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate message content
const validateMessageContent = (content) => {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= 1000;
};

module.exports = {
  validateObjectId,
  validateMessageContent
};