import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export const LoginVisual: React.FC = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"></path>
            </pattern>
          </defs>
          <rect fill="url(#grid)" height="100%" width="100%"></rect>
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl text-white"
      >
        <div className="mb-6">
          <span className="mb-1 block text-[30px] font-semibold text-[#dbe1ff]">EngHub</span>
          <h1 className="mb-4 text-[30px] font-bold leading-tight">Elevate your English, master your future.</h1>
          <p className="max-w-md text-base leading-relaxed text-[#b4c5ff] opacity-90">
            Join thousands of students achieving elite scores through personalized practice.
          </p>
        </div>

        <div className="w-full max-w-md overflow-hidden rounded-xl bg-white p-3 shadow-2xl">
          <img 
            alt="Student studying" 
            className="aspect-video w-full rounded-lg object-cover shadow-inner"
            src="/src/assets/images/auth/login-hero.png"
          />
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <img 
                key={i}
                alt="User" 
                className="h-10 w-10 rounded-full border-2 border-[#004ac6] bg-gray-200" 
                src={`https://i.pravatar.cc/100?img=${i+20}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-[#eeefff] opacity-90">
            <Users className="h-4 w-4" />
            <p className="text-sm font-medium uppercase tracking-wide">
              +5,000 students active today
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};
