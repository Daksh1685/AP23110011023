import React, { useState } from 'react';
import { RegistrationPayload, authService, RegistrationResult } from '../services/auth';
import { ApiErrorHandler } from '../utils/errorHandler';
import '../styles/components.css';

interface RegistrationFormProps {
  onRegistered: (result: RegistrationResult) => void;
  onExistingUser?: (values: Pick<RegistrationPayload, 'email' | 'name' | 'rollNo' | 'accessCode'>) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistered, onExistingUser }) => {
  const [values, setValues] = useState<RegistrationPayload>({
    email: '',
    name: '',
    mobileNo: '',
    githubUsername: '',
    rollNo: '',
    accessCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = (field: keyof RegistrationPayload, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await authService.register(values);
      setSuccess('Registration successful. Use the generated client credentials to authenticate.');
      onRegistered(result);
    } catch (registrationError) {
      const message = registrationError instanceof Error ? registrationError.message : 'Registration failed';
      const emailExists = message.includes('409') || message.toLowerCase().includes('email already exists');

      if (emailExists) {
        setError(
          'Email already exists. Switch to Authenticate and enter your existing client credentials. If you do not have the original client ID/secret, please register with a different email or contact the evaluation service provider for recovery options.'
        );
        onExistingUser?.({
          email: values.email,
          name: values.name,
          rollNo: values.rollNo,
          accessCode: values.accessCode
        });
      } else {
        setError(message);
      }

      await ApiErrorHandler.handleError(registrationError, 'RegistrationForm submission', 'auth');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={styles.container}>
      <h2 style={styles.title}>Register with Evaluation API</h2>
      <p style={styles.description}>
        Complete the registration form to obtain client credentials for authentication.
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={values.email}
            onChange={(e) => updateField('email', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={values.name}
            onChange={(e) => updateField('name', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="mobileNo">Mobile Number</label>
          <input
            id="mobileNo"
            type="text"
            className="form-input"
            value={values.mobileNo}
            onChange={(e) => updateField('mobileNo', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="githubUsername">GitHub Username</label>
          <input
            id="githubUsername"
            type="text"
            className="form-input"
            value={values.githubUsername}
            onChange={(e) => updateField('githubUsername', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="rollNo">Roll Number</label>
          <input
            id="rollNo"
            type="text"
            className="form-input"
            value={values.rollNo}
            onChange={(e) => updateField('rollNo', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="accessCode">Access Code</label>
          <input
            id="accessCode"
            type="text"
            className="form-input"
            value={values.accessCode}
            onChange={(e) => updateField('accessCode', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-large" disabled={isSubmitting}>
          {isSubmitting ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '640px',
    margin: '0 auto',
    backgroundColor: 'white'
  },
  title: {
    margin: '0 0 var(--spacing-md) 0',
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-bold)'
  },
  description: {
    marginBottom: 'var(--spacing-lg)',
    color: 'var(--neutral-600)'
  }
};

export default RegistrationForm;
