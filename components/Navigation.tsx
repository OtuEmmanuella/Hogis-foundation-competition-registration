'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Trophy, FileText, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['hero', 'about', 'rules', 'register'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Updated navigation items with proper section mappings
  const navItems = [
    { name: 'About', section: 'about', icon: Trophy },
    { name: 'Rules', section: 'rules', icon: FileText },
    { name: 'Register', section: 'register', icon: Users },
    { name: 'Contact', section: 'contact', icon: Phone }, // Changed to 'contact' section
  ];

  const scrollToSection = (sectionId: string) => {
    // Handle contact section specially since it might not exist
    let targetSection = sectionId;
    if (sectionId === 'contact') {
      // You can change this to scroll to footer or any contact section
      // For now, let's scroll to rules section as fallback
      const contactElement = document.getElementById('contact');
      if (!contactElement) {
        targetSection = 'rules'; // fallback to rules section
      }
    }
    
    const element = document.getElementById(targetSection);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setIsOpen(false); // Close mobile menu after clicking
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById('mobile-nav');
      const button = document.getElementById('mobile-menu-button');
      
      if (isOpen && nav && button && 
          !nav.contains(event.target as Node) && 
          !button.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-amber-200/20' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.button
            onClick={() => scrollToSection('hero')}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg sm:text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                HOGIS FOUNDATION
              </h1>
              
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.section)}
                className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm lg:text-base ${
                  activeSection === item.section
                    ? scrolled 
                      ? 'text-amber-600 bg-amber-50' 
                      : 'text-amber-200 bg-white/20'
                    : scrolled 
                      ? 'text-gray-700 hover:text-amber-600 hover:bg-amber-50' 
                      : 'text-white hover:text-amber-200 hover:bg-white/10'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              id="mobile-menu-button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className={`${scrolled ? 'text-gray-900' : 'text-white'} w-10 h-10 relative z-50`}
            >
              <motion.div
                animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Mobile Menu */}
            <motion.div
              id="mobile-nav"
              className="fixed top-16 sm:top-20 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-40 md:hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="py-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.section)}
                    className={`flex items-center space-x-3 w-full px-6 py-4 text-left transition-all duration-200 ${
                      activeSection === item.section
                        ? 'text-amber-600 bg-amber-50 border-r-4 border-amber-600'
                        : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-base">{item.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;