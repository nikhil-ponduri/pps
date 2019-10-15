import validator, { EMAIL, STRING, MOBILE } from "./validator";

export const isValidRegisterForm = (req, res, next) => {
    const { email, password, firstName, lastName, mobile } = req.body;
    const options = [
        { key: 'email', value: email, type: EMAIL },
        { key: 'password', value: password, type: STRING, min: 6, max: 30 },
    ]
    const formDetails = validator(options);
    if (!formDetails.isValidForm) return res.status(400).json(formDetails);
    next();
}

export const isValidLoginForm = (req, res, next) => {
    const { email = '', password = '' } = req.body;
    const options = [
        { key: 'email', value: email, type: EMAIL }
    ]
    const formDetails = validator(options);
    if (!formDetails.isValidForm) return res.status(400).json(formDetails);
    console.log('valid form details');
    next();
}