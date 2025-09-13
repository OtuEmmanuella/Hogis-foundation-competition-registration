'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Award, 
  FileText, 
  Calendar,
  MapPin,
  Star,
  AlertCircle,
  BookOpen,
  Mic,
  ChevronDown,
  ChevronUp,
  Trophy 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Rules = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    eligibility: true,
    categories: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const eligibilityRules = [
    'Open to young males between the ages of 10 – 19 years only',
    'Participants must register officially through the approved registration form',
    'Each participant may register in one category only (Public Speaking or Spoken Word)',
    'Proof of age and identity (School ID, Birth Certificate, or National ID) is required'
  ];

  const registrationInfo = [
    { label: 'Deadline', value: '15th September 2025', icon: Calendar },
    { label: 'Late Registration', value: 'Not Accepted', icon: AlertCircle },
    { label: 'Entry Fee', value: 'FREE', icon: Award },
  ];

  const competitionStages = [
    {
      stage: 'Preliminary Stage',
      date: '16th - 17th September 2025',
      description: 'Judges will shortlist participants for the Grand Finale',
      icon: FileText,
    },
    {
      stage: 'Grand Finale',
      date: '27th September 2025',
      description: 'Finalists compete before a panel of judges and live audience in Calabar',
      icon: Trophy,
    },
  ];

  const judgingCriteria = [
    { criterion: 'Content', percentage: 30, description: 'Relevance, depth, originality' },
    { criterion: 'Delivery', percentage: 30, description: 'Clarity, diction, confidence, stage presence' },
    { criterion: 'Creativity', percentage: 20, description: 'Expression, style, impact' },
    { criterion: 'Time Adherence', percentage: 10, description: 'Staying within allocated time' },
    { criterion: 'Audience Connection', percentage: 10, description: 'Engagement, emotional impact' },
  ];

  return (
    <section 
      id="rules" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Competition <span className="text-amber-400">Rules & Guidelines</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know to participate in our prestigious competition
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Rules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Eligibility */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <Collapsible 
                  open={openSections.eligibility} 
                  onOpenChange={() => toggleSection('eligibility')}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-700/30 transition-colors">
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="w-6 h-6 text-amber-400" />
                          <span>1. Eligibility Requirements</span>
                        </div>
                        {openSections.eligibility ? 
                          <ChevronUp className="w-5 h-5" /> : 
                          <ChevronDown className="w-5 h-5" />
                        }
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <ul className="space-y-3">
                        {eligibilityRules.map((rule, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                            className="flex items-start space-x-3 text-gray-300"
                          >
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{rule}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <Collapsible 
                  open={openSections.categories} 
                  onOpenChange={() => toggleSection('categories')}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-700/30 transition-colors">
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mic className="w-6 h-6 text-amber-400" />
                          <span>3. Competition Categories</span>
                        </div>
                        {openSections.categories ? 
                          <ChevronUp className="w-5 h-5" /> : 
                          <ChevronDown className="w-5 h-5" />
                        }
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      {/* Public Speaking */}
                      <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg p-6 border border-blue-700/50">
                        <h4 className="text-xl font-bold text-blue-300 mb-3 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2" />
                          a) Public Speaking Competition
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• Participants prepare and deliver speeches based on selected topics related to the theme</li>
                          <li>• Each participant will have 5 minutes to present</li>
                          <li>• Additional 2 minutes for impromptu speech by the judges</li>
                        </ul>
                      </div>

                      {/* Spoken Word */}
                      <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg p-6 border border-purple-700/50">
                        <h4 className="text-xl font-bold text-purple-300 mb-3 flex items-center">
                          <Mic className="w-5 h-5 mr-2" />
                          b) Spoken Word Competition
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>• Participants perform original spoken word pieces or adapted works relevant to the theme</li>
                          <li>• Performances must not exceed 5 minutes</li>
                        </ul>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>

            {/* Stages */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-amber-400" />
                    <span>4. Competition Stages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {competitionStages.map((stage, index) => (
                    <div 
                      key={index}
                      className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-700/50"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <stage.icon className="w-5 h-5 text-amber-400" />
                        <h4 className="font-bold text-amber-300">{stage.stage}</h4>
                        <Badge variant="outline" className="border-amber-400 text-amber-400">
                          {stage.date}
                        </Badge>
                      </div>
                      <p className="text-gray-300">{stage.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Judging Criteria */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-3">
                    <Star className="w-6 h-6 text-amber-400" />
                    <span>6. Judging Criteria</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {judgingCriteria.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-white">{item.criterion}</h4>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                        <div className="text-2xl font-bold text-amber-400">
                          {item.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Registration Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-300 flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>2. Registration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registrationInfo.map((info, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <info.icon className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-sm text-gray-400">{info.label}</div>
                        <div className="font-semibold text-white">{info.value}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Presentation Rules */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>5. Presentation Rules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="text-gray-300">
                    <strong className="text-amber-300">Time Limits:</strong> Strictly enforced
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-amber-300">Language:</strong> English primary, Pidgin may be infused
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-amber-300">Originality:</strong> Content must be original
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-amber-300">Dress Code:</strong> Smart, decent dressing required
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-amber-300">Conduct:</strong> Respectful content and behavior
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Awards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-green-300 flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>7. Awards & Recognition</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-300">
                  <div>• Cash prizes for winners and runners-up</div>
                  <div>• Plaques and certificates</div>
                  <div>• Mentorship opportunities under HOGIS Foundation</div>
                  <div>• Certificates of participation for all</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-300">
                  <div className="space-y-2">
                    <div><strong>Dejudge Glasgow</strong></div>
                    <div>📞 08034227242</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rules;