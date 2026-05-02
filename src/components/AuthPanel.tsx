import React, { useState } from 'react';
import AuthForm from './AuthForm';
import RegistrationForm from './RegistrationForm';
import { RegistrationResult } from '../services/auth';
import '../styles/components.css';

interface AuthPanelProps {
  onAuthenticated: () => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [registeredData, setRegisteredData] = useState<RegistrationResult | null>(null);
  const [existingUserValues, setExistingUserValues] = useState<
    Pick<RegistrationResult, 'email' | 'name' | 'rollNo' | 'accessCode'> | null
  >(null);

  const handleRegistered = (result: RegistrationResult) => {
    setRegisteredData(result);
    setExistingUserValues(null);
    setMode('login');
  };

  const handleExistingUser = (values: Pick<RegistrationResult, 'email' | 'name' | 'rollNo' | 'accessCode'>) => {
    setExistingUserValues(values);
    setMode('login');
  };

  const initialLoginValues = registeredData
    ? {
        email: registeredData.email,
        name: registeredData.name,
        rollNo: registeredData.rollNo,
        accessCode: registeredData.accessCode,
        clientID: registeredData.clientID,
        clientSecret: registeredData.clientSecret
      }
    : existingUserValues
    ? {
        email: existingUserValues.email,
        name: existingUserValues.name,
        rollNo: existingUserValues.rollNo,
        accessCode: existingUserValues.accessCode,
        clientID: '',
        clientSecret: ''
      }
    : undefined;

  return (
    <div className="auth-panel">
      <div className="auth-toggle" style={styles.toggleContainer}>
        <button
          type="button"
          className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('register')}
          style={styles.toggleButton}
        >
          Register
        </button>
        <button
          type="button"
          className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('login')}
          style={styles.toggleButton}
        >
          Authenticate
        </button>
      </div>

      {mode === 'register' ? (
        <RegistrationForm onRegistered={handleRegistered} onExistingUser={handleExistingUser} />
      ) : (
        <>
          {registeredData || existingUserValues ? (
            <div className="card alert alert-success" style={styles.successCard}>
              <h3 style={styles.successTitle}>
                {registeredData ? 'Registration Complete' : 'Existing Account Detected'}
              </h3>
              <p>
                {registeredData
                  ? 'Use the values below to authenticate or let the form submit them for you.'
                  : 'This email is already registered. Enter your existing client credentials to authenticate. If you do not have the original client ID/secret, you will need to register with a different email or contact the evaluation service provider.'}
              </p>
              {registeredData && (
                <pre style={styles.credentialsBlock}>
                  {`clientID: ${registeredData.clientID}\nclientSecret: ${registeredData.clientSecret}`}
                </pre>
              )}
            </div>
          ) : null}
          <AuthForm initialValues={initialLoginValues} onAuthenticated={onAuthenticated} />
        </>
      )}
    </div>
  );
};

const styles = {
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-lg)'
  },
  toggleButton: {
    minWidth: '140px'
  },
  successCard: {
    marginBottom: 'var(--spacing-lg)'
  },
  successTitle: {
    margin: '0 0 var(--spacing-sm) 0'
  },
  credentialsBlock: {
    backgroundColor: 'var(--neutral-100)',
    padding: 'var(--spacing-sm)',
    borderRadius: 'var(--border-radius-sm)',
    overflowX: 'auto' as const
  }
};

export default AuthPanel;
