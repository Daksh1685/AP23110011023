export const validateNotificationTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.trim().length <= 100;
};

export const validateNotificationMessage = (message: string): boolean => {
  return message.trim().length > 0 && message.trim().length <= 500;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNotificationForm = (title: string, message: string): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!validateNotificationTitle(title)) {
    errors.title = 'Title must be between 1 and 100 characters';
  }

  if (!validateNotificationMessage(message)) {
    errors.message = 'Message must be between 1 and 500 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
