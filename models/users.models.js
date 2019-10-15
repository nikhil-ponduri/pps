const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        index: true
    },
    password: {
        trim: true,
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    }
});

export default mongoose.model('users', userSchema);

