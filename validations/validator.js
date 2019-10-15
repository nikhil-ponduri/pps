import { isEmail, isAlphanumeric, isMobilePhone, isLength, isNumeric } from 'validator';

export const EMAIL = 'email';
export const PASSWORD = 'password';
export const STRING = 'string';
export const MOBILE = 'mobile';
export const NUMBER = 'number'

const isValidForm = (options) => {
    const errors = {};
    for (let option of options) {
        const { key, value, min, max } = option;
        switch (option.type) {
            case EMAIL:
                if (!isEmail(value)) {
                    errors[key] = 'Please enter a valid email';
                }
                break;
            case STRING:
                if (!isLength(value, { min, max })) {
                    errors[key] = `${key} should be between ${min} && ${max} characters`
                }
                break;
            case NUMBER:
                if (!isNumeric(`${value}`)) {
                    errors[key] = `Enter a valid ${key}`;
                }
                break;
            default:
                break;
        }
    }
    if (Object.keys(errors).length > 0) {
        errors.isValidForm = false
    } else {
        errors.isValidForm = true;
    }
    return errors;
}

export default isValidForm