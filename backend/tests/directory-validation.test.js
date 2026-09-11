const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateDirectoryContact } = require('../config/directory-validation');

test('directory contact fields accept letters, digits and valid emails only', () => {
    for (const name of ['Doctor Sharma', 'Unique Hospital', 'डॉक्टर शर्मा']) {
        assert.doesNotThrow(() => validateDirectoryContact({ name, phone: '9876543210', email: 'office+care@example.com' }));
    }
    for (const data of [{ name: 'Doctor123' }, { name: 'Dr. Sharma' }, { name: '   ' }, { phone: '98765432101' }, { phone: '987654321' }, { phone: '5123456789' }, { phone: '+91 12345' }, { phone: '123abc' }, { email: 'test@' }, { email: 'test example.com' }]) {
        assert.throws(() => validateDirectoryContact(data), error => error.status === 400);
    }
    assert.doesNotThrow(() => validateDirectoryContact({ overview: 'Unrelated update' }));
});
