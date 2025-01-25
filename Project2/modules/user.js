
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     username: String,
//     name: String,
//     age: Number,
//     email: String,
//     password: String,
//     posts: [
//         { type: mongoose.Schema.Types.ObjectId, ref: 'post' },
//     ],
// });

// module.exports = mongoose.model('user', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
});

module.exports = mongoose.model('user', userSchema);
