// src/utils/cleanInput.js

import DOMPurify from 'dompurify';

export const cleanInput = (input) => {
  return DOMPurify.sanitize(input);
};
