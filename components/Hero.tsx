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
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center overflow-hidden"
      style={{
        backgroundSize: '400% 400%',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/4 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="max-w-5xl mx-auto"
        >
          {/* Logo and Foundation Name */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              HOGIS FOUNDATION
            </h1>
          </motion.div>

          {/* Main Title */}
          <h2
            ref={titleRef}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            PUBLIC SPEAKING &<br />
            <span className="text-amber-200">SPOKEN WORD</span><br />
            COMPETITION 2025
          </h2>

          {/* Theme */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-8"
          >
            <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full border border-white/30">
              <p className="text-xl md:text-2xl text-white font-medium">
                "Raising the Boy Child, Building the Total Man"
              </p>
            </div>
          </motion.div>

          {/* Key Information Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto"
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
                className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
              >
                <item.icon className="w-8 h-8 text-amber-200 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-amber-200 font-bold">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-4"
          >
            <Button
              size="lg"
              onClick={scrollToRegister}
              className="bg-white text-amber-600 hover:bg-amber-50 px-12 py-6 text-xl font-bold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105"
            >
              Register Now
            </Button>
            <p className="text-amber-100 text-lg">
              Registration closes on <span className="font-bold text-white">15th September 2025</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;