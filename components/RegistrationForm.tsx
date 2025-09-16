'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle,
  Loader2,
  Camera,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const formSchema = z.object({
  surname: z.string().min(2, 'Surname is required'),
  otherNames: z.string().min(2, 'Other names are required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  age: z.number().min(10, 'Age must be between 10-19').max(19, 'Age must be between 10-19'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Complete address is required'),
  emailAddress: z.string().email('Valid email address is required'),
  category: z.enum(['PUBLIC_SPEAKING', 'SPOKEN_WORD']),
  currentSchool: z.string().min(2, 'School/Institution is required'),
  classLevel: z.string().min(1, 'Class/Level is required'),
  motivation: z.string().min(20, 'Please provide a detailed motivation (minimum 20 characters)'),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  agreement: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => {
  if (data.age < 18) {
    return data.parentName && data.parentName.length > 0 && data.parentPhone && data.parentPhone.length > 0;
  }
  return true;
}, {
  message: "Parent/Guardian information is required for participants under 18",
  path: ["parentName"]
});

type FormData = z.infer<typeof formSchema>;

// Function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Utility function to chunk large strings for Firestore
const chunkString = (str: string, maxLength: number = 900000): string[] => {
  if (str.length <= maxLength) return [str];
  
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += maxLength) {
    chunks.push(str.substring(i, i + maxLength));
  }
  return chunks;
};

const RegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [passportPhotoBase64, setPassportPhotoBase64] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange'
  });

  const dateOfBirth = watch('dateOfBirth');
  const age = watch('age');
  const isUnder18 = age && age < 18;

  // Auto-calculate age when date of birth changes
  useEffect(() => {
    if (dateOfBirth) {
      const calculatedAge = calculateAge(dateOfBirth);
      setValue('age', calculatedAge);
    }
  }, [dateOfBirth, setValue]);

  // Improved image compression with better error handling
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          try {
            // More aggressive compression for large images
            const maxWidth = 600;
            const maxHeight = 600;
            
            let { width, height } = img;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw and compress the image with lower quality for smaller size
            ctx!.drawImage(img, 0, 0, width, height);
            
            // Try different compression levels
            let base64String = canvas.toDataURL('image/jpeg', 0.6); // Lower quality
            
            // If still too large, try even more compression
            if (base64String.length > 700000) { // ~500KB limit
              base64String = canvas.toDataURL('image/jpeg', 0.4);
            }
            
            // Final size check
            if (base64String.length > 900000) { // ~650KB final limit
              reject(new Error('Image too large even after maximum compression'));
            } else {
              resolve(base64String);
            }
          } catch (canvasError) {
            reject(canvasError);
          }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file size (limit to 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setPhotoFileName(file.name);
      
      // Convert to base64 with compression
      const base64String = await convertToBase64(file);
      
      setPassportPhotoBase64(base64String);
      setPhotoPreview(base64String);

      toast.success('Photo uploaded and compressed successfully!');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Failed to process image. Please try a smaller image.');
      
      // Clear the file input
      const input = e.target;
      input.value = '';
    }
  };

  const onSubmit = async (data: FormData) => {
    // Clear any previous errors
    setError('');
    
    try {
      // Age validation
      if (data.age < 10) {
        toast.error('Participants must be at least 10 years old to compete');
        return;
      }
      
      if (data.age > 19) {
        toast.error('Participants must be 19 years old or younger to compete');
        return;
      }

      if (!passportPhotoBase64) {
        toast.error('Passport photograph is required');
        return;
      }
      
      setIsSubmitting(true);

      console.log('Starting form submission...');
      
      // Split large base64 image into chunks if necessary
      const photoChunks = chunkString(passportPhotoBase64, 800000); // 800KB chunks
      
      // Prepare registration data with chunked image data
      const registrationData: any = {
        fullName: {
          surname: data.surname.trim(),
          otherNames: data.otherNames.trim(),
        },
        dateOfBirth: data.dateOfBirth,
        age: data.age,
        phoneNumber: data.phoneNumber.trim(),
        address: data.address.trim(),
        emailAddress: data.emailAddress.toLowerCase().trim(),
        // Handle photo data - if it's small, store directly, otherwise chunk it
        passportPhoto: photoChunks.length === 1 ? {
          data: photoChunks[0],
          fileName: photoFileName,
          uploadedAt: new Date().toISOString(),
          chunks: 1
        } : {
          fileName: photoFileName,
          uploadedAt: new Date().toISOString(),
          chunks: photoChunks.length,
          // Store first chunk here, rest will be in separate fields
          data: photoChunks[0]
        },
        category: data.category,
        currentSchool: data.currentSchool.trim(),
        classLevel: data.classLevel.trim(),
        motivation: data.motivation.trim(),
        agreement: data.agreement,
        participantSignature: 'Digital Signature Provided',
        submissionDate: new Date().toISOString(),
        status: 'PENDING' as const,
      };

      // Add parent consent if under 18
      if (isUnder18) {
        registrationData.parentConsent = {
          parentName: (data.parentName || '').trim(),
          parentPhone: (data.parentPhone || '').trim(),
          parentSignature: 'Digital Consent Provided',
        };
      }

      // Add additional photo chunks if needed
      if (photoChunks.length > 1) {
        for (let i = 1; i < photoChunks.length; i++) {
          registrationData[`photoChunk_${i}`] = photoChunks[i];
        }
      }

      console.log('Saving to Firestore...');
      console.log('Data size (approx):', JSON.stringify(registrationData).length, 'characters');
      
      // Save to Firestore with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const docRef = await addDoc(collection(db, 'registered'), registrationData);
          console.log('Document written with ID: ', docRef.id);
          break; // Success, exit retry loop
        } catch (firestoreError: any) {
          retryCount++;
          console.error(`Firestore attempt ${retryCount} failed:`, firestoreError);
          
          if (retryCount >= maxRetries) {
            throw firestoreError; // Re-throw after max retries
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      // Optional: Send confirmation email with better error handling
      try {
        console.log('Attempting to send confirmation email...');
        const emailResponse = await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.emailAddress,
            name: `${data.surname} ${data.otherNames}`,
          }),
        });

        if (!emailResponse.ok) {
          console.warn('Failed to send confirmation email, but registration was saved');
        } else {
          console.log('Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.warn('Error sending confirmation email:', emailError);
        // Don't fail the entire submission for email issues
      }

      setSubmitted(true);
      toast.success('Registration submitted successfully!');
      
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to submit registration. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Access denied. Please check your internet connection and try again.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
      } else if (error.code === 'deadline-exceeded' || error.code === 'timeout') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message?.includes('document too large') || 
                 error.message?.includes('too large') ||
                 error.message?.includes('Maximum document size')) {
        errorMessage = 'Your photo is too large. Please upload a smaller image and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'Service quota exceeded. Please try again later.';
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Invalid data provided. Please check all fields and try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="register" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6">
              Registration Submitted Successfully!
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Our team has received your information and will get back to you. 
              You will receive an email confirmation shortly with further details.
            </p>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-4">What's Next?</h3>
              <ul className="text-left space-y-2 text-gray-600 text-sm sm:text-base">
                <li>• Your application is being reviewed by our team</li>
                <li>• You will receive an email notification about your status</li>
                <li>• Preliminary stage: 16th - 17th September 2025</li>
                <li>• Grand finale: 27th September 2025 in Calabar</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6">
            Registration <span className="text-amber-600">Form</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Join the HOGIS Foundation Public Speaking & Spoken Word Competition 2025
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 text-sm underline mt-1 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personal Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600 text-lg sm:text-xl">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="surname" className="text-black text-sm sm:text-base font-medium">Surname *</Label>
                        <Input
                          id="surname"
                          {...register('surname')}
                          className={`mt-1 text-gray-900 text-sm sm:text-base ${errors.surname ? 'border-red-500' : ''}`}
                        />
                        {errors.surname && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.surname.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="otherNames" className="text-black text-sm sm:text-base font-medium">Other Names *</Label>
                        <Input
                          id="otherNames"
                          {...register('otherNames')}
                          className={`mt-1 text-gray-900 text-sm sm:text-base ${errors.otherNames ? 'border-red-500' : ''}`}
                        />
                        {errors.otherNames && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.otherNames.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="dateOfBirth" className="text-black text-sm sm:text-base font-medium">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...register('dateOfBirth')}
                          className={`mt-1 text-gray-900 text-sm sm:text-base ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.dateOfBirth.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="age" className="text-black text-sm sm:text-base font-medium">Age (10-19) *</Label>
                        <Input
                          id="age"
                          type="number"
                          min="10"
                          max="19"
                          {...register('age', { valueAsNumber: true })}
                          className={`mt-1 text-gray-900 text-sm sm:text-base ${errors.age ? 'border-red-500' : ''}`}
                          readOnly
                        />
                        {errors.age && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.age.message}</p>
                        )}
                        {age && (age < 10 || age > 19) && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {age < 10 ? 'Must be at least 10 years old to compete' : 'Must be 19 years or younger to compete'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phoneNumber" className="text-black text-sm sm:text-base font-medium">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="phoneNumber"
                            {...register('phoneNumber')}
                            className={`pl-10 mt-1 text-gray-900 text-sm sm:text-base ${errors.phoneNumber ? 'border-red-500' : ''}`}
                            placeholder="08012345678"
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phoneNumber.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="emailAddress" className="text-black text-sm sm:text-base font-medium">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="emailAddress"
                            type="email"
                            {...register('emailAddress')}
                            className={`pl-10 mt-1 text-gray-900 text-sm sm:text-base ${errors.emailAddress ? 'border-red-500' : ''}`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.emailAddress && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.emailAddress.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-black text-sm sm:text-base font-medium">Complete Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Textarea
                          id="address"
                          {...register('address')}
                          className={`pl-10 mt-1 text-gray-900 text-sm sm:text-base resize-none ${errors.address ? 'border-red-500' : ''}`}
                          placeholder="Enter your complete address"
                          rows={3}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Competition Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600 text-lg sm:text-xl">
                      <FileText className="w-5 h-5" />
                      <span>Competition Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-black text-sm sm:text-base font-medium">Category of Participation *</Label>
                      <RadioGroup
                        onValueChange={(value) => setValue('category', value as 'PUBLIC_SPEAKING' | 'SPOKEN_WORD')}
                        className="mt-3 space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-amber-50">
                          <RadioGroupItem value="PUBLIC_SPEAKING" id="public-speaking" className="text-black" />
                          <div>
                            <Label htmlFor="public-speaking" className="font-medium cursor-pointer text-black text-sm sm:text-base">
                              Public Speaking
                            </Label>
                            <p className="text-xs sm:text-sm text-gray-600">
                              5 minutes presentation + 2 minutes impromptu speech
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-amber-50">
                          <RadioGroupItem value="SPOKEN_WORD" id="spoken-word" className="text-black"/>
                          <div>
                            <Label htmlFor="spoken-word" className="font-medium cursor-pointer text-black text-sm sm:text-base">
                              Spoken Word
                            </Label>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Original or adapted works, maximum 5 minutes
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                      {errors.category && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="currentSchool" className="text-black text-sm sm:text-base font-medium">Current School/Institution/Organization *</Label>
                        <Input
                          id="currentSchool"
                          {...register('currentSchool')}
                          className={`mt-1 text-gray-900 text-sm sm:text-base ${errors.currentSchool ? 'border-red-500' : ''}`}
                        />
                        {errors.currentSchool && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.currentSchool.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="classLevel" className="text-black text-sm sm:text-base font-medium">Class/Level/Department *</Label>
                        <Input
                          id="classLevel"
                          {...register('classLevel')}
                          className={`mt-1 text-gray-900 text-sm sm:text-base ${errors.classLevel ? 'border-red-500' : ''}`}
                        />
                        {errors.classLevel && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.classLevel.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="motivation" className="text-black text-sm sm:text-base font-medium">Why did you enter for this competition? *</Label>
                      <Textarea
                        id="motivation"
                        {...register('motivation')}
                        className={`mt-1 text-gray-900 text-sm sm:text-base resize-none ${errors.motivation ? 'border-red-500' : ''}`}
                        placeholder="Share your motivation for participating in this competition..."
                        rows={4}
                      />
                      {errors.motivation && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.motivation.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Consent */}
                {isUnder18 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-amber-600 text-lg sm:text-xl">
                        <User className="w-5 h-5" />
                        <span>Parent/Guardian Consent (Required for participants below 18)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="parentName" className="text-black text-sm sm:text-base font-medium">Name of Parent/Guardian *</Label>
                          <Input
                            id="parentName"
                            {...register('parentName')}
                            className={`mt-1 text-gray-900 text-sm sm:text-base ${errors.parentName ? 'border-red-500' : ''}`}
                          />
                          {errors.parentName && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.parentName.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="parentPhone" className="text-black text-sm sm:text-base font-medium">Parent/Guardian Phone Number *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              id="parentPhone"
                              {...register('parentPhone')}
                              className={`pl-10 mt-1 text-gray-900 text-sm sm:text-base ${errors.parentPhone ? 'border-red-500' : ''}`}
                              placeholder="08012345678"
                            />
                          </div>
                          {errors.parentPhone && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.parentPhone.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Agreement */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600 text-lg sm:text-xl">
                      <CheckCircle className="w-5 h-5" />
                      <span>Agreement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreement"
                        onCheckedChange={(checked) => setValue('agreement', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="agreement" className="cursor-pointer text-black text-sm sm:text-base">
                          I confirm that the information provided above is true. I agree to abide by the rules and guidelines of the competition. *
                        </Label>
                        {errors.agreement && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.agreement.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Photo Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600 text-lg sm:text-xl">
                      <Camera className="w-5 h-5" />
                      <span>Passport Photograph</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        {photoPreview ? (
                          <div className="space-y-4">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg mx-auto"
                            />
                            <div className="text-xs text-gray-500 text-center">
                              {photoFileName}
                              <br />
                              <span className="text-green-600">✓ Compressed and ready</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('photo-upload')?.click()}
                              className="w-full text-sm sm:text-base"
                            >
                              Change Photo
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('photo-upload')?.click()}
                                className="text-sm sm:text-base"
                              >
                                Upload Photo
                              </Button>
                              <p className="text-sm text-gray-500 mt-2">
                                Required: Passport-style photograph
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Maximum 5MB - will be compressed automatically
                              </p>
                            </div>
                          </div>
                        )}
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Important Notes */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-800 text-lg sm:text-xl">Important Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs sm:text-sm text-amber-700">
                    <div>• Fill out the form completely</div>
                    <div>• Upload a clear passport photograph (max 5MB)</div>
                    <div>• Images are compressed automatically</div>
                    <div>• Registration deadline: <strong>15th September 2025</strong></div>
                    <div>• Competition is FREE to enter</div>
                    <div>• You will receive email confirmation</div>
                    <div>• Age requirement: 10-19 years old</div>
                    <div>• Tournament is for boys only</div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !passportPhotoBase64 || 
                    (age !== undefined && (age < 10 || age > 19))
                  }
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 sm:py-6 text-base sm:text-lg shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </Button>
                
                {/* Troubleshooting Help */}
                {error && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 text-sm">Having trouble?</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-blue-700 space-y-2">
                      <div>• Check your internet connection</div>
                      <div>• Try uploading a smaller photo (under 2MB)</div>
                      <div>• Make sure all required fields are filled</div>
                      <div>• If problem persists, try refreshing the page</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default RegistrationForm;