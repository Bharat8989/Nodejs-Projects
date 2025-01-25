const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        date: { type: Date, default: Date.now },
        content: { type: String, required: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    },
    { timestamps: true } // Enable createdAt and updatedAt fields
);

module.exports = mongoose.model('post', postSchema);
