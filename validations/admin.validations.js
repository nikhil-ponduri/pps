import isValidForm from "./validator";
import { badRequest } from "../utils/constants";

export const isValidBannerForm = (req, res, next) => {
    const { body: { description, artist }, files } = req;
    const validationOptions = [
        { type: String, min: 1, max: 20, type: String, key: 'artist', value: artist },
        { type: String, min: 1, max: 200, type: String, key: 'description', value: description }
    ]
    const validation = isValidForm(validationOptions);
    if (!files || !files.banner) {
        validation.banner = 'Please select an image'
        validation.isValidForm = false;
    }
    if (!validation.isValidForm) return badRequest(res, validation);
    next();
}