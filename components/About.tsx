'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Target, Users, Trophy, Heart, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (typeof window !== 'undefined' && isInView) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.about-card',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [isInView]);

  const features = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Empowering young males through the art of public speaking and spoken word poetry, fostering confidence, leadership, and positive self-expression.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Building a generation of articulate, confident, and socially conscious young men who can positively impact their communities.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Trophy,
      title: 'Excellence',
      description: 'Celebrating outstanding talent while providing mentorship opportunities and recognition for exceptional participants.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Heart,
      title: 'Character Building',
      description: 'Focusing on holistic development through our theme: "Raising the Boy Child, Building the Total Man".',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Star,
      title: 'Platform for Growth',
      description: 'Providing a supportive environment for young speakers to showcase their talents and develop their voice.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Future Leaders',
      description: 'Nurturing the next generation of leaders, innovators, and change-makers through powerful communication skills.',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-slate-50 to-gray-100"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About the <span className="text-amber-600">Competition</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The HOGIS Foundation Public Speaking & Spoken Word Competition is more than just a contest—
            it's a transformative platform dedicated to nurturing young talent and building confident leaders.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="about-card h-full group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 ml-4">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Competition Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid md:grid-cols-4 gap-8"
        >
          {[
            { label: 'Age Range', value: '10-19', suffix: 'Years' },
            { label: 'Categories', value: '2', suffix: 'Options' },
            { label: 'Entry Fee', value: 'FREE', suffix: '' },
            { label: 'Grand Finale', value: '27th', suffix: 'Sept' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-amber-500 font-medium mb-2">
                {stat.suffix}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;