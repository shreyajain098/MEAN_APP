const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true}
});

userSchema.plugin(uniqueValidator);  /* plugin will add this extra hook uniqueValidator which will validate unique user ids */

module.exports = mongoose.model('User', userSchema);