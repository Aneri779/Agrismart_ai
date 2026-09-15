import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedCounter = ({ from = 0, to, duration = 2, className }) => {
  const [inView, setInView] = useState(false);
  const springValue = useSpring(from, { duration: duration * 1000, bounce: 0 });
  const displayValue = useTransform(springValue, (current) => Math.round(current));

  useEffect(() => {
    if (inView) {
      springValue.set(to);
    }
  }, [inView, to, springValue]);

  return (
    <motion.span
      className={className}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
    >
      {displayValue}
    </motion.span>
  );
};
