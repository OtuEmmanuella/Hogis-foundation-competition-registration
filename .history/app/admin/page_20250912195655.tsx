'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RegistrationData } from '@/types/registration';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  FileText, 
  Check, 
  X, 
  Eye,
  Filter,
  Search,
  Download,
  Clock
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationData | null>(null);
  const [processingId, setProcessingId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      // Fetch from all three collections
      const [registeredSnapshot, acceptedSnapshot, rejectedSnapshot] = await Promise.all([
        getDocs(collection(db, 'registered')),
        getDocs(collection(db, 'accepted')),
        getDocs(collection(db, 'rejected'))
      ]);

      const registeredData = registeredSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        collection: 'registered'
      })) as (RegistrationData & { collection: string })[];

      const acceptedData = acceptedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        collection: 'accepted'
      })) as (RegistrationData & { collection: string })[];

      const rejectedData = rejectedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        collection: 'rejected'
      })) as (RegistrationData & { collection: string })[];

      // Combine all data
      const allData = [...registeredData, ...acceptedData, ...rejectedData];
      
      setRegistrations(allData as RegistrationData[]);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = registrations;

    if (searchTerm) {
      filtered = filtered.filter(reg =>
        `${reg.fullName.surname} ${reg.fullName.otherNames}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.currentSchool.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING') {
        filtered = filtered.filter(reg => (reg as any).collection === 'registered');
      } else if (statusFilter === 'ACCEPTED') {
        filtered = filtered.filter(reg => (reg as any).collection === 'accepted');
      } else if (statusFilter === 'REJECTED') {
        filtered = filtered.filter(reg => (reg as any).collection === 'rejected');
      }
    }

    setFilteredRegistrations(filtered);
  };

  const updateRegistrationStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED', notes?: string) => {
    setProcessingId(id);
    
    try {
      const registration = registrations.find(r => r.id === id);
      if (!registration) return;

      // Determine source and target collections
      const sourceCollection = (registration as any).collection || 'registered';
      const targetCollection = status === 'ACCEPTED' ? 'accepted' : 'rejected';

      // Prepare updated registration data
      const updatedRegistration = {
        ...registration,
        status,
        adminNotes: notes || '',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin',
        collection: targetCollection
      };

      // Add to target collection
      await addDoc(collection(db, targetCollection), updatedRegistration);

      // Remove from source collection
      await deleteDoc(doc(db, sourceCollection, id));

      // Send email notification
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registration.emailAddress,
          name: `${registration.fullName.surname} ${registration.fullName.otherNames}`,
          status,
          reason: notes,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to send email notification, but registration was moved');
      }

      // Refresh the data
      await fetchRegistrations();

      toast.success(`Registration ${status.toLowerCase()} successfully!`);
      setSelectedRegistration(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error(`Failed to ${status.toLowerCase()} registration`);
    } finally {
      setProcessingId('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Age',
      'Category',
      'School',
      'Status',
      'Submission Date',
    ];

    const csvData = [
      headers.join(','),
      ...filteredRegistrations.map(reg => [
        `"${reg.fullName.surname} ${reg.fullName.otherNames}"`,
        reg.emailAddress,
        reg.phoneNumber,
        reg.age,
        reg.category.replace('_', ' '),
        `"${reg.currentSchool}"`,
        reg.status,
        new Date(reg.submissionDate).toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'registrations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            HOGIS Foundation Public Speaking Competition 2025 - Registration Management
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Registrations', value: registrations.length, color: 'blue' },
            { label: 'Registered (Pending)', value: registrations.filter(r => (r as any).collection === 'registered').length, color: 'yellow' },
            { label: 'Accepted', value: registrations.filter(r => (r as any).collection === 'accepted').length, color: 'green' },
            { label: 'Rejected', value: registrations.filter(r => (r as any).collection === 'rejected').length, color: 'red' },
          ].map((stat, index) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-6">
                <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 mb-6"
        >
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportToCSV} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </motion.div>

        {/* Registrations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">No registrations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration, index) => (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {registration.fullName.surname} {registration.fullName.otherNames}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{registration.emailAddress}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{registration.age} years</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">
                              {registration.category.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(registration.status)}>
                              {registration.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRegistration(registration)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Registration Details</DialogTitle>
                            </DialogHeader>
                            
                            {selectedRegistration && (
                              <div className="space-y-6">
                                {/* Personal Info */}
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Full Name:</strong> {selectedRegistration.fullName.surname} {selectedRegistration.fullName.otherNames}</div>
                                      <div><strong>Date of Birth:</strong> {selectedRegistration.dateOfBirth}</div>
                                      <div><strong>Age:</strong> {selectedRegistration.age} years</div>
                                      <div><strong>Gender:</strong> {selectedRegistration.gender === 'M' ? 'Male' : 'Female'}</div>
                                      <div><strong>Phone:</strong> {selectedRegistration.phoneNumber}</div>
                                      <div><strong>Email:</strong> {selectedRegistration.emailAddress}</div>
                                      <div><strong>Address:</strong> {selectedRegistration.address}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Competition Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Category:</strong> {selectedRegistration.category.replace('_', ' ')}</div>
                                      <div><strong>School:</strong> {selectedRegistration.currentSchool}</div>
                                      <div><strong>Class/Level:</strong> {selectedRegistration.classLevel}</div>
                                      <div><strong>Status:</strong> 
                                        <Badge className={`ml-2 ${getStatusColor(selectedRegistration.status)}`}>
                                          {selectedRegistration.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Motivation */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Motivation</h4>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {selectedRegistration.motivation}
                                  </p>
                                </div>

                                {/* Parent Consent (if applicable) */}
                                {selectedRegistration.parentConsent && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Parent/Guardian Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Name:</strong> {selectedRegistration.parentConsent.parentName}</div>
                                      <div><strong>Phone:</strong> {selectedRegistration.parentConsent.parentPhone}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Admin Notes */}
                                <div>
                                  <Label htmlFor="admin-notes">Admin Notes</Label>
                                  <Textarea
                                    id="admin-notes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this registration..."
                                    rows={3}
                                  />
                                </div>

                                {/* Action Buttons */}
                                {selectedRegistration.status === 'PENDING' && (
                                  <div className="flex space-x-4">
                                    <Button
                                      onClick={() => updateRegistrationStatus(selectedRegistration.id!, 'ACCEPTED', adminNotes)}
                                      disabled={processingId === selectedRegistration.id}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Accept
                                    </Button>
                                    <Button
                                      onClick={() => updateRegistrationStatus(selectedRegistration.id!, 'REJECTED', adminNotes)}
                                      disabled={processingId === selectedRegistration.id}
                                      variant="destructive"
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {registration.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateRegistrationStatus(registration.id!, 'ACCEPTED')}
                              disabled={processingId === registration.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateRegistrationStatus(registration.id!, 'REJECTED')}
                              disabled={processingId === registration.id}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;