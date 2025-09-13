'use client';

   import { useEffect } from 'react';
   import { useRouter } from 'next/navigation';
   import { Clock } from 'lucide-react';

   export default function AdminIndex() {
     const router = useRouter();

     useEffect(() => {
       router.push('/admin/dashboard');
     }, [router]);

     return (
       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
         <div className="text-center">
           <Clock className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
           <p className="text-xl text-gray-600">Redirecting to admin dashboard...</p>
         </div>
       </div>
     );
   }