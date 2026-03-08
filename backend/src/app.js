require('dotenv').config();
const express = require('express');
const cors = require('cors');
const emergencyRoutes = require('./routes/emergencyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ Routes ที่เราแยกไว้
app.use('/api', emergencyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CareTag Server running on port ${PORT}`);
});