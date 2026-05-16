import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  visualContent: React.ReactNode;
  reverse?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  visualContent, 
  reverse = false 
}) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-y-auto bg-[#f0f2f5] p-4 sm:p-6 lg:p-8">
      <div
        className={`flex min-h-[600px] w-full max-w-[1040px] overflow-hidden rounded-2xl border border-[#d8deea] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] ${
          reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
        }`}
      >
        <section className="relative hidden w-[48%] items-center justify-center overflow-hidden bg-[#004ac6] lg:flex">
          {visualContent}
        </section>

        <section className="flex min-h-[560px] w-full flex-col items-center justify-center overflow-y-auto bg-white px-6 py-8 sm:px-10 sm:py-12 lg:w-[52%] lg:px-14 lg:py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[392px]"
          >
            {children}
          </motion.div>
        </section>
      </div>
    </main>
  );
};
