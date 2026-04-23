const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests (Frontend to Backend)
app.use(express.json()); // Parse incoming JSON payloads

// Mount Routes
app.use('/api/auth', authRoutes);

// Simple route to check server status
app.get('/', (req, res) => {
    res.send('Jaipur Railway Station Navigation API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
