// Countdown.tsx
import React, { useEffect, useState } from 'react';

interface CountdownProps {
  duration: number;
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ duration, onComplete }) => {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div className="countdown">
      <p>Get ready! The game starts in {count} seconds...</p>
    </div>
  );
};

export default Countdown;
