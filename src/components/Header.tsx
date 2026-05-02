import React from 'react';
import '../styles/components.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header style={styles.header}>
      <div className="container">
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: 'var(--spacing-lg) 0',
    marginBottom: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-md)'
  },
  title: {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 'var(--font-weight-bold)',
    margin: '0 0 var(--spacing-sm) 0'
  },
  subtitle: {
    fontSize: 'var(--font-size-lg)',
    opacity: 0.9,
    margin: 0
  }
};

export default Header;
