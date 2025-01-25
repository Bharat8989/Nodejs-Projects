const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./modules/user');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/miniproject', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// app.get('/profile',isLoggedIn ,(req, res) => {
//     res.render('profile');
// });

app.post('/register', async (req, res) => {

    try {
        const { email, password, username, age, name } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already registered');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await userModel.create({
            username,
            email,
            age,
            name,
            password: hashedPassword,
        });

        // Generate a JWT token
        const token = jwt.sign({ email, userId: newUser._id }, 'shhhh', { expiresIn: '1h' });

        // Set the token as a cookie
        res.cookie('token', token, { httpOnly: true });
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            return res.status(400).send('Invalid email or password');
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).send('Invalid email or password');
        }

        // Generate a JWT token
        const token = jwt.sign({ email, userId: existingUser._id }, 'shhhh', { expiresIn: '1h' });

        // Set the token as a cookie
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.render('logout')
    res.redirect('/login');
});

function isLoggedIn(req,res,next){
    // console.log(req.cookie)
    if(req.cookie.token=='') res.send('you must be logged in');
    else{
       let data= jwt.verify(req.cookie.token,'shhhh')
       req.user=data; 
    }
    next();
}

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
