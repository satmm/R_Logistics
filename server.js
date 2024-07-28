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

const entrySchema = new mongoose.Schema({
  driverName: String,
  vehicleNumber: String,
  date: String,
  present: Boolean,
  advance: Number,
  cngCost: Number,
  driverSalary: Number,
  remark: String,
});

const Entry = mongoose.model('Entry', entrySchema);

app.get('/entries', async (req, res) => {
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (error) {
    res.status(500).send('Error fetching entries');
  }
});

app.post('/add-entry', async (req, res) => {
  try {
    const newEntry = new Entry(req.body);
    await newEntry.save();
    res.json(newEntry);
  } catch (error) {
    res.status(500).send('Error adding entry');
  }
});

app.put('/edit-entry/:id', async (req, res) => {
  try {
    const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEntry) {
      return res.status(404).send('Entry not found');
    }
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).send('Error updating entry');
  }
});

app.delete('/delete-entry/:id', async (req, res) => {
  try {
    const deletedEntry = await Entry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).send('Entry not found');
    res.json(deletedEntry);
  } catch (error) {
    res.status(500).send('Error deleting entry');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
