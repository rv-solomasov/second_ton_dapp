import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './DarkModeToggle.css'; // You can adjust or remove if not needed

const DarkModeToggle = () => {
  useEffect(() => {
    // Apply dark mode based on TWA color scheme
    const isDarkMode = WebApp.colorScheme === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, []);

  return (
    <div className="dark-mode-toggle">
      {/* Optionally display current mode or other static info */}
      <span>Dark Mode {WebApp.colorScheme === 'dark' ? 'Enabled' : 'Disabled'}</span>
    </div>
  );
};

export default DarkModeToggle;
