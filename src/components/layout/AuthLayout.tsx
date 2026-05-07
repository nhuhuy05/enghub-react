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
    <main className={`flex min-h-screen w-full flex-col bg-white ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
      <section className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#004ac6] lg:flex">
        {visualContent}
      </section>

      <section className="flex w-full flex-col items-center justify-center overflow-y-auto bg-white p-6 sm:p-10 lg:w-1/2 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {children}
        </motion.div>
      </section>
    </main>
  );
};
