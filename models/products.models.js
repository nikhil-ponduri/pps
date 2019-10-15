import { Schema } from 'mongoose';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        max: 20
    },
    description: {
        type: String,
        required: true,
        max: 1000
    },
    discount: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now()
    },
    artist: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }]
});

productSchema.index({ title: 'text' });

export default mongoose.model('products', productSchema);