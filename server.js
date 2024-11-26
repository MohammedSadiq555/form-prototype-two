require('dotenv').config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const port = process.env.PORT || 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

// Log start time
console.time('Server startup');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connection Successful");
    // Log successful connection time
    console.timeEnd('Server startup');
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

const db = mongoose.connection;
db.once('open', () => {
    console.log("MongoDB connected");
});

const userSchema = new mongoose.Schema({
    text: String,
    image: Buffer,
});

const Users = mongoose.model("data", userSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/post', upload.single('image'), async (req, res) => {
    const { text } = req.body;
    const image = req.file.buffer;

    console.time('Save to MongoDB'); // Log start of save operation
    const user = new Users({
        text,
        image,
    });

    try {
        await user.save();
        console.log(user);
        res.send("Form Submission Successful");
        console.timeEnd('Save to MongoDB'); // Log end of save operation
    } catch (error) {
        console.error("Error saving data to MongoDB:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log("Server started on port " + port);
});
