import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface GamingLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const loadingMessages = [
  "🎮 Initiating Rush Protocol...",
  "📡 Connecting to Gaming Servers...",
  "⚡ Charging Rush Energy...",
  "🚀 Securing Your Queue Position...",
  "🎯 Finalizing Gaming Credentials...",
  "💫 Almost Ready for Battle...",
  "🎉 Rush Complete!"
];

export function GamingLoader({ isLoading, onComplete }: GamingLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= loadingMessages.length - 1) {
          setShowParticles(true);
          setTimeout(() => {
            onComplete?.();
          }, 1000);
          clearInterval(interval);
          return loadingMessages.length - 1;
        }
        return nextIndex;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Background Gaming Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="gaming-bg-grid" />
      </div>

      <div className="relative text-center">
        {/* Main Spinner Container */}
        <div className="relative mb-8">
          {/* Outer Ring - Rotating */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 border-transparent"
            style={{
              background: 'conic-gradient(from 0deg, transparent, #fbbf24, #f59e0b, transparent)',
              borderRadius: '50%'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle Ring - Counter Rotating */}
          <motion.div
            className="absolute inset-2 w-28 h-28 rounded-full border-2 border-transparent"
            style={{
              background: 'conic-gradient(from 180deg, transparent, #3b82f6, #1d4ed8, transparent)',
              borderRadius: '50%'
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner Core - Pulsing */}
          <motion.div
            className="absolute inset-8 w-16 h-16 bg-gradient-to-r from-primary to-yellow-400 rounded-full flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <motion.div
              className="text-2xl"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⚡
            </motion.div>
          </motion.div>

          {/* Orbiting Particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              style={{
                top: '50%',
                left: '50%',
                marginTop: '-4px',
                marginLeft: '-4px',
              }}
              animate={{
                x: [0, 50 * Math.cos((i * Math.PI) / 2), 0, -50 * Math.cos((i * Math.PI) / 2), 0],
                y: [0, 50 * Math.sin((i * Math.PI) / 2), 0, -50 * Math.sin((i * Math.PI) / 2), 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.2
              }}
            />
          ))}

          {/* Gaming Glow Effects */}
          <motion.div
            className="absolute -inset-4 rounded-full"
            animate={{
              boxShadow: [
                "0 0 20px hsla(var(--primary) / 0.3)",
                "0 0 40px hsla(var(--primary) / 0.6)",
                "0 0 20px hsla(var(--primary) / 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Loading Message */}
        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-bold text-foreground mb-4"
        >
          {loadingMessages[messageIndex]}
        </motion.div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-6">
          {loadingMessages.slice(0, -1).map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= messageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              animate={i <= messageIndex ? {
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>

        {/* Completion Particles */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: (Math.cos((i * 2 * Math.PI) / 12)) * 100,
                  y: (Math.sin((i * 2 * Math.PI) / 12)) * 100,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom Gaming Text */}
        <motion.p 
          className="text-sm text-muted-foreground/80 font-mono"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          GAMING_PROTOCOL_ACTIVE.exe
        </motion.p>
      </div>
    </div>
  );
}