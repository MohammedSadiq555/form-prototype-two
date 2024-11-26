const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
require('dotenv').config(); // Add this line
const port = process.env.PORT || 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Use the environment variable for the MongoDB connection string
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
    console.log("Mongodb connection Successful");
});

const userSchema = new mongoose.Schema({
    text: String,
    image: Buffer,
});

const Users = mongoose.model("data", userSchema);

// Set up multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/post', upload.single('image'), async (req, res) => {
    const { text } = req.body;
    const image = req.file.buffer; // Access the uploaded file's buffer

    const user = new Users({
        text,
        image,
    });

    await user.save();
    console.log(user);
    res.send("Form Submission Successful");
});

app.listen(port, () => {
    console.log("server started on port " + port);
});
