const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: { type: String, required: true},
    content: { type: String, default: 'Hello Content'},
    imagePath: { type: String, required: true},
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}  /* adding this for authorization*/
});

module.exports = mongoose.model('Post', postSchema);