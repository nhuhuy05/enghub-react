import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BadgeCheck, Timer } from 'lucide-react';

export const RegisterVisual: React.FC = () => {
  return (
    <div className="relative flex h-full w-full items-center justify-center p-12">
      <div className="absolute inset-0 z-0">
        <img 
          className="h-full w-full object-cover opacity-30" 
          src="/src/assets/images/auth/register-bg.png" 
          alt="Study Background"
        />
      </div>

      <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-[#004ac6] opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-48 -ml-48 h-96 w-96 rounded-full bg-blue-400 opacity-10 blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md text-center"
      >
        <div className="mb-6 inline-flex rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          <TrendingUp className="h-12 w-12 text-white" />
        </div>
        
        <h2 className="mb-3 text-[32px] font-bold leading-tight text-white">Master English with EngHub</h2>
        <p className="mx-auto mb-8 max-w-sm text-base text-[#eeefff] opacity-90">
          Our adaptive learning platform crafts a personalized path to your target score.
        </p>

        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <BadgeCheck className="mb-2 h-5 w-5 text-blue-200" />
            <h4 className="mb-0.5 text-sm font-semibold text-white">Authentic Content</h4>
            <p className="text-[10px] leading-relaxed text-[#eeefff] opacity-70">Updated 2024 testing formats.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <Timer className="mb-2 h-5 w-5 text-blue-200" />
            <h4 className="mb-0.5 text-sm font-semibold text-white">Time Analytics</h4>
            <p className="text-[10px] leading-relaxed text-[#eeefff] opacity-70">Track your speed in real-time.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
