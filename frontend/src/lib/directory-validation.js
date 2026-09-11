export function cleanDirectoryInput(field, value) {
  if (field === 'name') return value.replace(/[^\p{L}\p{M} ]/gu, '');
  if (field === 'phone') return value.replace(/[^0-9]/g, '').slice(0, 10);
  if (field === 'email') return value.replace(/\s/g, '');
  return value;
}

export function directoryContactError(data) {
  if (!/^[\p{L}\p{M} ]+$/u.test(data.name || '') || !/\p{L}/u.test(data.name)) return 'Name must contain only letters and spaces.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) return 'Invalid email. Use the format name@example.com.';
  if (data.phone && !/^[6-9][0-9]{9}$/.test(data.phone)) return 'Invalid mobile number. Enter 10 digits starting with 6, 7, 8 or 9.';
  return '';
}
