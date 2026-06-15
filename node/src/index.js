const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const testimonialRoutes = require('./routes/testimonials');
const messageRoutes = require('./routes/messages');
const contentRoutes = require('./routes/content');

app.use('/api/auth', authRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/content', contentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JF Maintenance API is running' });
});

// Database Connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:JNYLpDkzop7xbcSU@cluster0.h8lgoqv.mongodb.net/jf_maintenance?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create default admin if not exists
    const User = require('./models/User');
    const adminExists = await User.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
      await admin.save();
      console.log('Default admin created');
    }

    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

module.exports = app;
