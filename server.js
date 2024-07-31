const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Log the URI for debugging

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Define the schema to match the fields in your form
const entrySchema = new mongoose.Schema({
  driverName: String,
  vehicleNumber: String,
  date: String,
  present: Boolean,
  advance: Number,
  cngCost: Number,
  driverSalary: Number,
  shiftTo: String,
  billTo: String,
  partyRate: Number,
  gstPercent: Number,
  vehicleRate: Number,
  remark: String
}, { strict: true });

const Entry = mongoose.model('Entry', entrySchema);

// Route to fetch all entries
app.get('/api/entries', async (req, res) => {
  console.log('GET /api/entries request received'); // Log the request for debugging
  try {
    const entries = await Entry.find();
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error); // Log the error
    res.status(500).json({ error: 'Error fetching entries' });
  }
});

// Route to add a new entry
app.post('/api/add-entry', async (req, res) => {
  console.log('POST /api/add-entry request received with data:', req.body); // Log the request data for debugging

  try {
    const newEntry = new Entry({
      ...req.body,
      advance: Number(req.body.advance),
      cngCost: Number(req.body.cngCost),
      driverSalary: Number(req.body.driverSalary),
      partyRate: Number(req.body.partyRate),
      gstPercent: Number(req.body.gstPercent),
      vehicleRate: Number(req.body.vehicleRate)
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding entry:', error); // Log the error
    res.status(500).json({ error: 'Error adding entry' });
  }
});

// Route to update an existing entry
app.put('/api/edit-entry/:id', async (req, res) => {
  console.log('PUT /api/edit-entry request received with data:', req.body); // Log the request data for debugging
  try {
    const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error); // Log the error
    res.status(500).json({ error: 'Error updating entry' });
  }
});

// Route to delete an entry
app.delete('/api/delete-entry/:id', async (req, res) => {
  console.log('DELETE /api/delete-entry request received for ID:', req.params.id); // Log the request ID for debugging
  try {
    const deletedEntry = await Entry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ error: 'Entry not found' });
    res.status(200).json(deletedEntry);
  } catch (error) {
    console.error('Error deleting entry:', error); // Log the error
    res.status(500).json({ error: 'Error deleting entry' });
  }
});

// Serve static files from the React frontend app (if applicable)
app.use(express.static(path.join(__dirname, 'Frontend', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
