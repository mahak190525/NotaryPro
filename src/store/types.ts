export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  avatar: string;
  provider?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  licenseNumber?: string;
  commissionExpiration?: string;
  createdAt?: string;
}

export interface Receipt {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  taxDeductible: boolean;
  imageUrl?: string;
  ocrProcessed: boolean;
  status: 'pending' | 'processed' | 'approved' | 'rejected';
  tags: string[];
  notes: string;
  userId: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  clientName: string;
  clientId: string;
  appointmentType?: 'online' | 'in-person';
  documentType: string;
  notaryFee: number;
  location: string;
  witnessRequired: boolean;
  witnessName?: string;
  signature?: string;
  thumbprint?: string;
  idVerified: boolean;
  idType: string;
  idNumber: string;
  idExpiration: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  userId: string;
}

export interface MileageTrip {
  id: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  date: string;
  purpose: string;
  category: 'business' | 'personal';
  rate: number;
  amount: number;
  userId: string;
}

export interface Settings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  profileVisibility: 'private' | 'public' | 'contacts';
  dataSharing: boolean;
  analyticsTracking: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  defaultFee: number;
  autoBackup: boolean;
  exportFormat: 'pdf' | 'csv' | 'excel';
  invoiceTemplate: string;
}

export interface ApiError {
  message: string;
  code?: string;
}