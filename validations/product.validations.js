import validator, { STRING, NUMBER } from "./validator";
import { badRequest } from "../utils/constants";

export const isValidProductForm = (req, res, next) => {
    const { title = '', description = '', price = '', artist = '', discount } = req.body;
    const options = [
        { key: 'title', value: title, type: STRING, min: 1, max: 20 },
        { key: 'description', value: description, type: STRING, min: 1, max: 1000 },
        { key: 'price', value: price, type: NUMBER },
        { key: 'artist', value: artist, type: STRING, min: 1, max: 20 },
    ]
    const formDetails = validator(options);
    if (!req.files || !req.files.images) {
        formDetails.isValidForm = false;
        formDetails.images = 'Plese select images'
    }
    if (!formDetails.isValidForm) return badRequest(res, formDetails);
    if (discount && (isNaN(discount) || discount >= price)) {
        formDetails.discount = 'please enter a valid discount';
    }
    next();

}