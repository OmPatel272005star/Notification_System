export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((key) => {
    const value = formData[key];
    const rule = rules[key];

    if (rule.required && !validateRequired(value)) {
      errors[key] = `${key} is required`;
    }

    if (rule.email && value && !validateEmail(value)) {
      errors[key] = "Invalid email address";
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      errors[key] = `Must be at least ${rule.minLength} characters`;
    }
  });

  return errors;
};
