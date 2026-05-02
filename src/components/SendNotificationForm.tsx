import React from 'react';
import { CreateNotificationPayload } from '../types/notification';
import { useForm } from '../hooks/useForm';
import { validateNotificationForm } from '../utils/validators';
import { Log } from '../log';
import { ApiErrorHandler } from '../utils/errorHandler';
import '../styles/components.css';

interface SendNotificationFormProps {
  onSubmit: (payload: CreateNotificationPayload) => Promise<void>;
}

type FormValues = Record<string, unknown> & {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
};

const SendNotificationForm: React.FC<SendNotificationFormProps> = ({ onSubmit }) => {
  const initialValues: FormValues = {
    title: '',
    message: '',
    priority: 'medium'
  };

  const {
    values,
    errors,
    isSubmitting,
    setFieldValue,
    setFieldError
  } = useForm<FormValues>({
    initialValues
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      const validation = validateNotificationForm(values.title, values.message);

      if (!validation.valid) {
        setFieldError('title', validation.errors.title || '');
        setFieldError('message', validation.errors.message || '');

        await ApiErrorHandler.handleValidationError('SendNotificationForm', 'Form validation failed');
        return;
      }

      // Log form submission start
      await Log('frontend', 'info', 'component', `Submitting notification: "${values.title}"`);

      // Submit form
      await onSubmit({
        title: values.title.trim(),
        message: values.message.trim(),
        priority: values.priority
      });

      // Log success
      await Log('frontend', 'debug', 'component', 'Notification submitted successfully');

      // Reset form
      Object.keys(initialValues).forEach((key) => {
        setFieldValue(key as keyof FormValues, initialValues[key as keyof FormValues]);
      });
    } catch (error) {
      await ApiErrorHandler.handleError(error, 'SendNotificationForm submission', 'component');
    }
  };

  return (
    <div className="card" style={styles.form}>
      <h2 style={styles.title}>Create New Notification</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            className={`form-input ${errors.title ? 'form-error' : ''}`}
            placeholder="Enter notification title"
            value={values.title}
            onChange={(e) => setFieldValue('title', e.target.value)}
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.title && <p className="error-message">{errors.title}</p>}
          <p style={styles.helperText}>
            {values.title.length}/100 characters
          </p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="message">
            Message *
          </label>
          <textarea
            id="message"
            className={`form-textarea ${errors.message ? 'form-error' : ''}`}
            placeholder="Enter notification message"
            value={values.message}
            onChange={(e) => setFieldValue('message', e.target.value)}
            maxLength={500}
            disabled={isSubmitting}
          />
          {errors.message && <p className="error-message">{errors.message}</p>}
          <p style={styles.helperText}>
            {values.message.length}/500 characters
          </p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            className="form-select"
            value={values.priority}
            onChange={(e) => setFieldValue('priority', e.target.value as FormValues['priority'])}
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <span style={styles.spinner}></span>
              Submitting...
            </>
          ) : (
            'Send Notification'
          )}
        </button>
      </form>
    </div>
  );
};

const styles = {
  form: {
    maxWidth: '600px',
    margin: '0 auto var(--spacing-xl)',
    backgroundColor: 'white'
  },
  title: {
    margin: '0 0 var(--spacing-lg) 0',
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--neutral-900)'
  },
  helperText: {
    margin: '4px 0 0 0',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--neutral-500)'
  },
  submitButton: {
    width: '100%',
    marginTop: 'var(--spacing-md)'
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    marginRight: '8px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

export default SendNotificationForm;
