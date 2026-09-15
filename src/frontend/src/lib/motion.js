export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const cardHover = {
  rest: { y: 0, boxShadow: "var(--shadow-sm)" },
  hover: { y: -4, boxShadow: "var(--shadow-md)", transition: { duration: 0.2 } },
};

export const pageTransition = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.35, ease: "easeInOut" },
};
