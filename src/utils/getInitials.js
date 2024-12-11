// utils/getInitials.js
export const getInitials = (email) => {
    if (!email) return '';
    const [name] = email.split('@');
    const initials = name.split('.').map(n => n[0]).join('');
    return initials.toUpperCase();
  };
  