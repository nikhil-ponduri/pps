import { Schema, model, } from 'mongoose';

const schema = new Schema({
    url: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    artist: {
        type: String,
        required: true
    }
});
export default model('carousals', schema);