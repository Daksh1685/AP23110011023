import React, { useEffect, useState } from 'react';
import { authService, AuthPayload } from '../services/auth';
import { LoggerManager } from '../log';
import { ApiErrorHandler } from '../utils/errorHandler';
import '../styles/components.css';

interface AuthFormProps {
  onAuthenticated: () => void;
  initialValues?: AuthPayload;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated, initialValues }) => {
  const [values, setValues] = useState<AuthPayload>({
    email: initialValues?.email || '',
    name: initialValues?.name || '',
    rollNo: initialValues?.rollNo || '',
    accessCode: initialValues?.accessCode || '',
    clientID: initialValues?.clientID || '',
    clientSecret: initialValues?.clientSecret || ''
  });

  useEffect(() => {
    if (initialValues) {
      setValues({
        email: initialValues.email || '',
        name: initialValues.name || '',
        rollNo: initialValues.rollNo || '',
        accessCode: initialValues.accessCode || '',
        clientID: initialValues.clientID || '',
        clientSecret: initialValues.clientSecret || ''
      });
    }
  }, [initialValues]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof AuthPayload, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authResult = await authService.authenticate(values);
      LoggerManager.initialize({
        bearerToken: authResult.access_token,
        apiEndpoint:
          import.meta.env.VITE_LOGGER_URL ||
          import.meta.env.REACT_APP_LOGGER_URL ||
          'http://20.207.122.201/evaluation-service/logs',
        timeout: 5000
      });

      onAuthenticated();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Authentication failed';
      setError(message);
      await ApiErrorHandler.handleError(authError, 'AuthForm submission', 'auth');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={styles.container}>
      <h2 style={styles.title}>Authenticate to Logger API</h2>
      <p style={styles.description}>
        Enter the credentials from the evaluation service to obtain a bearer token and start logging.
      </p>
      {error && <div className="alert alert-error">{error}</div>}

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

        <div className="form-group">
          <label className="form-label" htmlFor="clientID">Client ID</label>
          <input
            id="clientID"
            type="text"
            className="form-input"
            value={values.clientID}
            onChange={(e) => updateField('clientID', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="clientSecret">Client Secret</label>
          <input
            id="clientSecret"
            type="password"
            className="form-input"
            value={values.clientSecret}
            onChange={(e) => updateField('clientSecret', e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-large" disabled={isSubmitting}>
          {isSubmitting ? 'Authenticating…' : 'Authenticate'}
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

export default AuthForm;
