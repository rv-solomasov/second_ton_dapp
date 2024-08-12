import { useState, useEffect } from 'react';
import './DarkModeToggle.css';
import WebApp from '@twa-dev/sdk';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const initialMode = WebApp.colorScheme === 'dark';
    setDarkMode(initialMode);
    document.body.classList.toggle('dark-mode', initialMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={darkMode}
        onChange={handleToggle}
      />
      <span className="slider">
        <span className="icon sun">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18a6 6 0 100-12 6 6 0 000 12zm0 2.25a8.25 8.25 0 110-16.5 8.25 8.25 0 010 16.5zm0-20.25a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0V1.5A1.5 1.5 0 0112 0zm0 21a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-3 0v-1.5A1.5 1.5 0 0112 21zM4.91 4.91a1.5 1.5 0 010 2.12L3.82 8.12a1.5 1.5 0 11-2.12-2.12l1.09-1.09a1.5 1.5 0 012.12 0zm14.18 0a1.5 1.5 0 012.12 0l1.09 1.09a1.5 1.5 0 11-2.12 2.12l-1.09-1.09a1.5 1.5 0 010-2.12zM0 12a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 010 3H1.5A1.5 1.5 0 010 12zm21 0a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 110 3h-1.5A1.5 1.5 0 0121 12zm-4.09 9.09a1.5 1.5 0 010 2.12l-1.09 1.09a1.5 1.5 0 11-2.12-2.12l1.09-1.09a1.5 1.5 0 012.12 0zm-10.18 0a1.5 1.5 0 010 2.12l-1.09 1.09a1.5 1.5 0 11-2.12-2.12l1.09-1.09a1.5 1.5 0 012.12 0z" />
          </svg>
        </span>
        <span className="icon moon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.753 15.634a.75.75 0 00-.919-.57 8.247 8.247 0 01-2.59.415 8.25 8.25 0 01-8.25-8.25c0-.88.14-1.736.415-2.59a.75.75 0 00-.57-.919 9.752 9.752 0 107.854 7.854z" />
          </svg>
        </span>
      </span>
    </label>
  );
};

export default DarkModeToggle;
