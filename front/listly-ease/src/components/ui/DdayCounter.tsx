import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";

interface DdayCounterProps {
  launchDate?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountUpDigit = ({ value, label }: { value: number; label: string }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 120,
  });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [value, isInView, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        (ref.current as HTMLElement).textContent = Math.floor(latest).toString().padStart(2, '0');
      }
    });

    return () => unsubscribe();
  }, [springValue]);

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        damping: 20,
        stiffness: 100,
        delay: Math.random() * 0.1
      }}
    >
      <motion.div
        className="relative overflow-hidden"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <div className="glass backdrop-blur-md bg-white/5 dark:bg-black/10 border border-white/10 dark:border-white/5 rounded-xl p-2 min-w-[50px] text-center shadow-md">
          <motion.span
            ref={ref}
            className="text-lg md:text-xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent font-mono"
            initial={{ filter: "blur(5px)" }}
            animate={{ filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            00
          </motion.span>
        </div>
      </motion.div>
      <motion.span
        className="text-[10px] font-medium text-muted-foreground mt-1 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
};

const AnimatedSeparator = ({ delay = 0 }) => (
  <motion.div
    className="flex items-center justify-center mx-1"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      type: "spring",
      damping: 15,
      stiffness: 200,
      delay: delay + 0.2
    }}
  >
    <motion.div
      className="w-1 h-1 rounded-full bg-primary/60"
      animate={{ 
        scale: [1, 1.3, 1],
        opacity: [0.6, 1, 0.6]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.div>
);

const PulsingGlow = () => (
  <motion.div
    className="absolute inset-0 rounded-2xl"
    animate={{
      boxShadow: [
        "0 0 10px hsla(var(--primary) / 0.2)",
        "0 0 20px hsla(var(--primary) / 0.3)",
        "0 0 10px hsla(var(--primary) / 0.2)"
      ]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

const DdayCounter: React.FC<DdayCounterProps> = ({ launchDate, className }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!launchDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const launch = new Date(launchDate).getTime();
      const difference = launch - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  if (!launchDate) {
    return (
      <motion.div
        className={`text-center ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="glass backdrop-blur-md bg-white/5 dark:bg-black/10 border border-white/10 dark:border-white/5 rounded-xl px-3 py-2">
          <motion.div
            className="text-sm font-medium text-muted-foreground"
            initial={{ filter: "blur(3px)" }}
            animate={{ filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
          >
            🚀 Launch TBD
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (isExpired) {
    return (
      <motion.div
        className={`text-center ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                "0 0 10px hsla(120, 60%, 50%, 0.3)",
                "0 0 20px hsla(120, 60%, 50%, 0.4)",
                "0 0 10px hsla(120, 60%, 50%, 0.3)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="glass backdrop-blur-md bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl px-4 py-2">
            <motion.div
              className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎉 Launched!
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isVisible) return null;

  return (
    <motion.div
      className={`inline-flex items-center ${className}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative">
        <PulsingGlow />
        <motion.div
          className="flex items-center justify-center space-x-2 px-3 py-2 glass backdrop-blur-md bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 rounded-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
        >
          {timeLeft.days > 0 && (
            <>
              <CountUpDigit value={timeLeft.days} label="DAYS" />
              <AnimatedSeparator delay={0.05} />
            </>
          )}
          
          <CountUpDigit value={timeLeft.hours} label="HRS" />
          <AnimatedSeparator delay={0.1} />
          
          <CountUpDigit value={timeLeft.minutes} label="MIN" />
          <AnimatedSeparator delay={0.15} />
          
          <CountUpDigit value={timeLeft.seconds} label="SEC" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DdayCounter;