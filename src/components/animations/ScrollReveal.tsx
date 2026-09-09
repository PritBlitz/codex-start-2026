import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Variants, Transition } from "framer-motion";

const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  className,
  yOffset = 48,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={prefersReduced ? {} : { opacity: 0, y: yOffset }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: prefersReduced ? 0 : 0.6,
        delay: prefersReduced ? 0 : delay,
        ease: "easeOut",
      } as Transition}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  baseDelay?: number;
}

const itemVariants: Variants = prefersReduced
  ? { hidden: {}, visible: {} }
  : {
    hidden: { opacity: 0, y: 48 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" } as Transition,
    },
  };

export function StaggerContainer({
  children,
  className,
  baseDelay = 0,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  const withDelay: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: baseDelay },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={withDelay}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants} style={{ willChange: "transform, opacity" }}>
      {children}
    </motion.div>
  );
}
