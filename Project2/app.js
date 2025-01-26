const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./modules/user');
const postModel = require('./modules/post');

const app = express();

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/miniproject', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// App Configurations
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware for Token Verification
function isLoggedIn(req, res, next) {
    const token = req.cookies.token; // Access the token from cookies
    if (!token) {
        return res.redirect('/login'); // Redirect to login if no token
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || 'shhhh'); // Use env variable or default secret
        req.user = data; // Attach decoded data to request
        next(); // Proceed to next middleware/route
    } catch (error) {
        console.error('Token verification error:', error);
        res.clearCookie('token'); // Clear invalid token
        return res.redirect('/login'); // Redirect to login
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/profile', isLoggedIn, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email }).populate('posts');
        res.render('profile', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading profile');
    }
});

// Like/Unlike a Post
app.get('/like/:id', isLoggedIn, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id); // Find the post by ID
        const userId = req.user._id; // Logged-in user's ID
        
        if (post.likes.includes(userId)) {
            // Unlike the post
            post.likes = post.likes.filter((like) => !like.equals(userId));
        } else {
            // Like the post
            post.likes.push(userId);
        }

        await post.save();
        res.redirect('back'); // Redirect to the previous page
    } catch (err) {
        console.error(err);
        res.status(500).send('Error while liking/unliking the post');
    }
});

// Edit a Post (GET for Edit Form)
app.get('/edit/:id', isLoggedIn, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('edit-post', { post });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading edit page');
    }
});

// Update Post (POST for Saving Edits)
app.post('/edit/:id', isLoggedIn, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await postModel.findByIdAndUpdate(req.params.id, { content }, { new: true });
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating post');
    }
});


app.post('/create-post', isLoggedIn, async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const { content } = req.body;

        const newPost = await postModel.create({
            user: user._id,
            content,
        });

        user.posts.push(newPost._id);
        await user.save();
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

app.post('/register', async (req, res) => {
    try {
        const { email, password, username, age, name } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            username,
            email,
            age,
            name,
            password: hashedPassword,
        });

        const token = jwt.sign({ email, userId: newUser._id }, process.env.JWT_SECRET || 'shhhh', { expiresIn: '1h' });
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

        const existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            return res.status(400).send('Invalid email or password');
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).send('Invalid email or password');
        }

        const token = jwt.sign({ email, userId: existingUser._id }, process.env.JWT_SECRET || 'shhhh', { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.redirect('/login');
});

// Start Server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
