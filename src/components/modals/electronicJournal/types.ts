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
}