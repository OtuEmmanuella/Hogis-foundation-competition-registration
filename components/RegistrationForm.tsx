'use client';

import { useState } from 'react';
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
  gender: z.enum(['M', 'F']),
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

  const age = watch('age');
  const isUnder18 = age && age < 18;

  // Convert file to base64 and compress if needed
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set maximum dimensions for compression
        const maxWidth = 800;
        const maxHeight = 800;
        
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

        // Draw and compress the image
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.8 quality for JPEG)
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64String);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file size (limit to 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Photo must be less than 10MB');
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
      
      // Check final size after compression (Firestore has 1MB limit per field)
      const sizeInBytes = Math.ceil(base64String.length * 0.75); // Rough base64 size calculation
      if (sizeInBytes > 900 * 1024) { // Keep under 900KB to be safe
        toast.error('Image is too large even after compression. Please use a smaller image.');
        return;
      }

      setPassportPhotoBase64(base64String);
      setPhotoPreview(base64String);

      toast.success('Photo uploaded and compressed successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!passportPhotoBase64) {
      toast.error('Passport photograph is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Starting form submission...');
      
      // Prepare registration data with base64 image
      const registrationData = {
        fullName: {
          surname: data.surname,
          otherNames: data.otherNames,
        },
        dateOfBirth: data.dateOfBirth,
        age: data.age,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        address: data.address,
        emailAddress: data.emailAddress,
        // Store image as base64 string directly in Firestore
        passportPhoto: {
          data: passportPhotoBase64,
          fileName: photoFileName,
          uploadedAt: new Date().toISOString()
        },
        category: data.category,
        currentSchool: data.currentSchool,
        classLevel: data.classLevel,
        motivation: data.motivation,
        parentConsent: isUnder18 ? {
          parentName: data.parentName || '',
          parentPhone: data.parentPhone || '',
          parentSignature: 'Digital Consent Provided',
        } : undefined,
        agreement: data.agreement,
        participantSignature: 'Digital Signature Provided',
        submissionDate: new Date().toISOString(),
        status: 'PENDING' as const,
      };

      console.log('Saving to Firestore...');
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'registered'), registrationData);
      console.log('Document written with ID: ', docRef.id);

      // Optional: Send confirmation email (remove if using static export)
      try {
        console.log('Attempting to send confirmation email...');
        const response = await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.emailAddress,
            name: `${data.surname} ${data.otherNames}`,
          }),
        });

        if (!response.ok) {
          console.warn('Failed to send confirmation email, but registration was saved');
        }
      } catch (emailError) {
        console.warn('Error sending confirmation email:', emailError);
        // Don't fail the entire submission for email issues
      }

      setSubmitted(true);
      toast.success('Registration submitted successfully!');
      
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to submit registration. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your Firestore security rules.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error.message?.includes('Maximum call stack size exceeded') || 
                 error.message?.includes('too large')) {
        errorMessage = 'Image file is too large. Please use a smaller image.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
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
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Registration Submitted Successfully!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our team has received your information and will get back to you. 
              You will receive an email confirmation shortly with further details.
            </p>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
              <ul className="text-left space-y-2 text-gray-600">
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
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Registration <span className="text-amber-600">Form</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              <p className="text-red-700">{error}</p>
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
              {/* Main Form - Same as before */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personal Information Card - Same as previous version */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="surname">Surname *</Label>
                        <Input
                          id="surname"
                          {...register('surname')}
                          className={errors.surname ? 'border-red-500' : ''}
                        />
                        {errors.surname && (
                          <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="otherNames">Other Names *</Label>
                        <Input
                          id="otherNames"
                          {...register('otherNames')}
                          className={errors.otherNames ? 'border-red-500' : ''}
                        />
                        {errors.otherNames && (
                          <p className="text-red-500 text-sm mt-1">{errors.otherNames.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...register('dateOfBirth')}
                          className={errors.dateOfBirth ? 'border-red-500' : ''}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="age">Age (10-19) *</Label>
                        <Input
                          id="age"
                          type="number"
                          min="10"
                          max="19"
                          {...register('age', { valueAsNumber: true })}
                          className={errors.age ? 'border-red-500' : ''}
                        />
                        {errors.age && (
                          <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                        )}
                      </div>
                      <div>
                        <Label>Gender *</Label>
                        <RadioGroup
                          onValueChange={(value) => setValue('gender', value as 'M' | 'F')}
                          className="flex space-x-6 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="M" id="male" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="F" id="female" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                        </RadioGroup>
                        {errors.gender && (
                          <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="phoneNumber"
                            {...register('phoneNumber')}
                            className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                            placeholder="08012345678"
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="emailAddress">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="emailAddress"
                            type="email"
                            {...register('emailAddress')}
                            className={`pl-10 ${errors.emailAddress ? 'border-red-500' : ''}`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.emailAddress && (
                          <p className="text-red-500 text-sm mt-1">{errors.emailAddress.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Complete Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Textarea
                          id="address"
                          {...register('address')}
                          className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                          placeholder="Enter your complete address"
                          rows={3}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Competition Details - Same as before */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600">
                      <FileText className="w-5 h-5" />
                      <span>Competition Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Category of Participation *</Label>
                      <RadioGroup
                        onValueChange={(value) => setValue('category', value as 'PUBLIC_SPEAKING' | 'SPOKEN_WORD')}
                        className="mt-3 space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-amber-50">
                          <RadioGroupItem value="PUBLIC_SPEAKING" id="public-speaking" />
                          <div>
                            <Label htmlFor="public-speaking" className="font-medium cursor-pointer">
                              Public Speaking
                            </Label>
                            <p className="text-sm text-gray-600">
                              5 minutes presentation + 2 minutes impromptu speech
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-amber-50">
                          <RadioGroupItem value="SPOKEN_WORD" id="spoken-word" />
                          <div>
                            <Label htmlFor="spoken-word" className="font-medium cursor-pointer">
                              Spoken Word
                            </Label>
                            <p className="text-sm text-gray-600">
                              Original or adapted works, maximum 5 minutes
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="currentSchool">Current School/Institution/Organization *</Label>
                        <Input
                          id="currentSchool"
                          {...register('currentSchool')}
                          className={errors.currentSchool ? 'border-red-500' : ''}
                        />
                        {errors.currentSchool && (
                          <p className="text-red-500 text-sm mt-1">{errors.currentSchool.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="classLevel">Class/Level/Department *</Label>
                        <Input
                          id="classLevel"
                          {...register('classLevel')}
                          className={errors.classLevel ? 'border-red-500' : ''}
                        />
                        {errors.classLevel && (
                          <p className="text-red-500 text-sm mt-1">{errors.classLevel.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="motivation">Why did you enter for this competition? *</Label>
                      <Textarea
                        id="motivation"
                        {...register('motivation')}
                        className={errors.motivation ? 'border-red-500' : ''}
                        placeholder="Share your motivation for participating in this competition..."
                        rows={4}
                      />
                      {errors.motivation && (
                        <p className="text-red-500 text-sm mt-1">{errors.motivation.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Consent - Same as before */}
                {isUnder18 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-amber-600">
                        <User className="w-5 h-5" />
                        <span>Parent/Guardian Consent (Required for participants below 18)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="parentName">Name of Parent/Guardian *</Label>
                          <Input
                            id="parentName"
                            {...register('parentName')}
                            className={errors.parentName ? 'border-red-500' : ''}
                          />
                          {errors.parentName && (
                            <p className="text-red-500 text-sm mt-1">{errors.parentName.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="parentPhone">Parent/Guardian Phone Number *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              id="parentPhone"
                              {...register('parentPhone')}
                              className={`pl-10 ${errors.parentPhone ? 'border-red-500' : ''}`}
                              placeholder="08012345678"
                            />
                          </div>
                          {errors.parentPhone && (
                            <p className="text-red-500 text-sm mt-1">{errors.parentPhone.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Agreement - Same as before */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600">
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
                        <Label htmlFor="agreement" className="cursor-pointer">
                          I confirm that the information provided above is true. I agree to abide by the rules and guidelines of the competition. *
                        </Label>
                        {errors.agreement && (
                          <p className="text-red-500 text-sm mt-1">{errors.agreement.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar with Updated Photo Upload */}
              <div className="space-y-6">
                {/* Photo Upload with Base64 conversion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600">
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
                              className="w-full"
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
                              >
                                Upload Photo
                              </Button>
                              <p className="text-sm text-gray-500 mt-2">
                                Required: Passport-style photograph
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                iPhone photos will be automatically compressed
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
                    <CardTitle className="text-amber-800">Important Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-amber-700">
                    <div>• Fill out the form completely</div>
                    <div>• Upload a clear passport photograph</div>
                    <div>• Images are compressed automatically</div>
                    <div>• Registration deadline: <strong>15th September 2025</strong></div>
                    <div>• Competition is FREE to enter</div>
                    <div>• You will receive email confirmation</div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !passportPhotoBase64}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 text-lg shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default RegistrationForm;