'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Calendar, MapPin, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero background animation
      gsap.to(heroRef.current, {
        backgroundPosition: '100% 0%',
        duration: 20,
        repeat: -1,
        ease: 'none',
      });

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { 
          y: 100, 
          opacity: 0,
          rotationX: -90 
        },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1.5,
          delay: 0.5,
          ease: 'power3.out',
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToRegister = () => {
    const element = document.getElementById('register');
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center overflow-hidden"
      style={{
        backgroundSize: '400% 400%',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/4 right-10 sm:right-20 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-10 sm:bottom-20 left-1/4 w-24 sm:w-40 h-24 sm:h-40 bg-white/5 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="max-w-6xl mx-auto"
        >
          {/* Logo and Foundation Name */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 sm:mb-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-2xl">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
              HOGIS FOUNDATION
            </h1>
          </motion.div>

          {/* Main Title */}
          <h2
            ref={titleRef}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2"
          >
            PUBLIC SPEAKING &<br />
            <span className="text-amber-200">SPOKEN WORD</span><br />
            <span className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">COMPETITION 2025</span>
          </h2>

          {/* Theme */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6 sm:mb-8 px-2"
          >
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-full border border-white/30">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white font-medium">
                "Raising the Boy Child, Building the Total Man"
              </p>
            </div>
          </motion.div>

          {/* Key Information Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 max-w-5xl mx-auto px-2"
          >
            {[
              { icon: Calendar, title: 'Grand Finale', value: '27th Sept 2025' },
              { icon: MapPin, title: 'Location', value: 'Calabar' },
              { icon: Users, title: 'Age Group', value: '10 - 19 Years' },
              { icon: Award, title: 'Entry Fee', value: 'FREE' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-white/20 shadow-lg"
              >
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-200 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-white font-semibold mb-1 text-xs sm:text-sm lg:text-base">{item.title}</h3>
                <p className="text-amber-200 font-bold text-xs sm:text-sm lg:text-base">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-3 sm:space-y-4 px-2"
          >
            <Button
              size="lg"
              onClick={scrollToRegister}
              className="bg-white text-amber-600 hover:bg-amber-50 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg lg:text-xl font-bold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105"
            >
              Register Now
            </Button>
            <p className="text-amber-100 text-sm sm:text-base lg:text-lg">
              Registration closes on <span className="font-bold text-white">15th September 2025</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white/80 rounded-full mt-1 sm:mt-2 animate-bounce" />
        </div>
      </motion.div> */}
    </section>
  );
};

export default Hero;