// CoinFlip.tsx
import React from 'react';
import { motion, useAnimation } from 'framer-motion';

interface CoinFlipProps {
  result: 'heads' | 'tails';
  onAnimationComplete: () => void;
}

const CoinFlip: React.FC<CoinFlipProps> = ({ result, onAnimationComplete }) => {
  const controls = useAnimation();

  React.useEffect(() => {
    // Start spinning coin animation
    controls.start({
      rotateY: [0, 360],
      transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    });

    // Stop spinning after 3 seconds and show result
    setTimeout(() => {
      controls.start({
        rotateY: result === 'heads' ? 0 : 180,
        transition: { duration: 1, ease: 'easeInOut' },
      });
      onAnimationComplete(); // Trigger when animation is complete
    }, 3000);
  }, [controls, result, onAnimationComplete]);

  return (
    <motion.div
      className="coin"
      animate={controls}
      style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        backgroundColor: 'gold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        backfaceVisibility: 'hidden',
      }}
    >
      {result === 'heads' ? 'H' : 'T'}
    </motion.div>
  );
};

export default CoinFlip;
