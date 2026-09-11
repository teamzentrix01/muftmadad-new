function validateDirectoryContact(data) {
    let message;
    if (data.name !== undefined && (typeof data.name !== 'string' || !/^[\p{L}\p{M} ]+$/u.test(data.name) || !/\p{L}/u.test(data.name))) message = 'Name must contain only letters and spaces.';
    else if (data.email !== undefined && (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) message = 'Enter a valid email address.';
    else if (data.phone != null && data.phone !== '' && (typeof data.phone !== 'string' || !/^[6-9][0-9]{9}$/.test(data.phone))) message = 'Invalid mobile number. Enter 10 digits starting with 6, 7, 8 or 9.';
    if (message) { const error = new Error(message); error.status = 400; throw error; }
}
module.exports = { validateDirectoryContact };
