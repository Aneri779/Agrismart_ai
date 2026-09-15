import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const GaugeRing = ({ value, max = 100, size = 120, strokeWidth = 10, color = 'var(--success)', className }) => {
  const [inView, setInView] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
    >
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: inView ? offset : circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-sora font-semibold text-ink-900 tabular-nums">
          {value}
        </span>
        <span className="text-xs text-ink-600">/ {max}</span>
      </div>
    </motion.div>
  );
};
