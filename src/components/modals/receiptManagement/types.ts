export interface ReceiptData {
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
}

export interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  confidence: number;
}