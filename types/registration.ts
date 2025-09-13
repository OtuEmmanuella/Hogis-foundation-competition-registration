export interface RegistrationData {
  id?: string;
  // Personal Information
  fullName: {
    surname: string;
    otherNames: string;
  };
  dateOfBirth: string;
  age: number;
  gender: 'M' | 'F';
  phoneNumber: string;
  address: string;
  emailAddress: string;
  passportPhoto?: string;
  
  // Category and Education
  category: 'PUBLIC_SPEAKING' | 'SPOKEN_WORD';
  currentSchool: string;
  classLevel: string;
  
  // Motivation
  motivation: string;
  
  // Parent/Guardian (for under 18)
  parentConsent?: {
    parentName: string;
    parentPhone: string;
    parentSignature: string;
  };
  
  // Agreement
  agreement: boolean;
  participantSignature: string;
  submissionDate: string;
  
  // Status
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}