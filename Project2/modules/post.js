// // const mongoose=require('mongoose')

// // // mongoose.connect('mongodb://127.0.0.1:27017/miniproject')

// // const postShema=mongoose.Schema({
    
// //     user:{
// //         type:mongoose.Schema.Types.ObjectId,
// //         ref:'user'
// //     },
// //     date:{
// //         type:Date,
// //         default:Date.now
// //     },
// //     content: String,
// //     likes:[
// //         {
// //             types:mongoose.Schema.Types.ObjectId,ref:'user'
// //         }
// //     ]

// //     // username:String,

// //     // name:String,
// //     // age:Number,
// //     // email:String,
// //     // password:String,

// //     // posts:[
// //     //     { type:mongoose.Schema.Types.ObjectId,ref:'post'}
// //     // ]
// // })

// // module.exports= mongoose.model('post',postShema);

// const mongoose = require('mongoose');

// const postSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'user',
//     },
//     date: {
//         type: Date,
//         default: Date.now,
//     },
//     content: String,
//     likes: [
//         { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
//     ],
// });

// module.exports = mongoose.model('post', postSchema);

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
});

module.exports = mongoose.model('post', postSchema);
