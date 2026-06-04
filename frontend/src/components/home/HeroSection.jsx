import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AnimatedCounter = ({ from, to, duration, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime = null;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * (to - from) + from));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32 bg-brand-cream border-b border-brand-beige">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-brand-yellow/20 rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute top-40 -left-20 w-72 h-72 bg-brand-orange/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Main Moto */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block py-1.5 px-4 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold text-sm tracking-wide uppercase">
              Get fresh homemade food from nearby home cooks
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-brown tracking-tight mb-6">
            Fresh Homemade <br className="hidden sm:block" />
            <span className="text-brand-orange">Food Near You</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover affordable breakfast, lunch, dinner and tiffin meals prepared by trusted home kitchens in your neighborhood. Perfect for bachelors, students and working professionals.
          </motion.p>

          {/* Stats Section */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16 pt-8 mt-12 border-t border-brand-beige/50"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-black text-brand-brown mb-1">
                <span>⭐</span>
                <AnimatedCounter from={0} to={500} duration={2} suffix="+" />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Home Cooks</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-black text-brand-brown mb-1">
                <span>🍱</span>
                <AnimatedCounter from={0} to={10000} duration={2.5} suffix="+" />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Meals Served</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-black text-brand-brown mb-1">
                <span>🛡</span>
                <span>Verified</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Home Kitchens</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
