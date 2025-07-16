export interface IDScanResult {
  type: string;
  number: string;
  name: string;
  address: string;
  dateOfBirth: string;
  expiration: string;
  verified: boolean;
  confidence: number;
  rawText: string;
}

export interface IDScanError {
  code: string;
  message: string;
}

export class IDScanningService {
  private static instance: IDScanningService;
  private worker: any = null;

  private constructor() {}

  public static getInstance(): IDScanningService {
    if (!IDScanningService.instance) {
      IDScanningService.instance = new IDScanningService();
    }
    return IDScanningService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize Tesseract.js for OCR
      const { createWorker } = await import('tesseract.js');
      this.worker = await createWorker('eng');
      
      // Configure for better ID recognition
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/- ',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });
    } catch (error) {
      console.error('Failed to initialize ID scanning service:', error);
      throw new Error('ID scanning initialization failed');
    }
  }

  public async scanID(imageData: string | File): Promise<IDScanResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('ID scanning service failed to initialize');
    }

    try {
      // Process the image with OCR
      const { data } = await this.worker.recognize(imageData);
      const rawText = data.text;
      const confidence = data.confidence;

      // Parse the extracted text to identify ID information
      const parsedData = this.parseIDText(rawText);

      return {
        ...parsedData,
        confidence: Math.round(confidence),
        rawText,
        verified: confidence > 70 && parsedData.number !== 'Unknown' && parsedData.name !== 'Unknown'
      };
    } catch (error) {
      console.error('ID scanning error:', error);
      throw new Error('Failed to scan ID document');
    }
  }

  private parseIDText(text: string): Omit<IDScanResult, 'confidence' | 'rawText' | 'verified'> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Detect document type
    const type = this.detectDocumentType(text);
    
    // Extract information based on document type
    const name = this.extractName(lines, type);
    const number = this.extractIDNumber(lines, type);
    const dateOfBirth = this.extractDateOfBirth(lines);
    const expiration = this.extractExpirationDate(lines);
    const address = this.extractAddress(lines);

    return {
      type,
      name,
      number,
      address,
      dateOfBirth,
      expiration
    };
  }

  private detectDocumentType(text: string): string {
    const upperText = text.toUpperCase();
    
    if (upperText.includes('DRIVER') && upperText.includes('LICENSE')) {
      return "Driver's License";
    } else if (upperText.includes('PASSPORT')) {
      return 'Passport';
    } else if (upperText.includes('STATE') && upperText.includes('ID')) {
      return 'State ID';
    } else if (upperText.includes('MILITARY')) {
      return 'Military ID';
    } else if (upperText.includes('IDENTIFICATION')) {
      return 'State ID';
    }
    
    return 'Unknown ID Type';
  }

  private extractName(lines: string[], docType: string): string {
    // Common name patterns
    const namePatterns = [
      /^([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?$/,  // First Last [Middle]
      /^([A-Z]+),\s*([A-Z]+)(?:\s+([A-Z]+))?$/,                // LAST, FIRST [MIDDLE]
      /^LN\s+([A-Z]+)\s+FN\s+([A-Z]+)/,                        // LN LASTNAME FN FIRSTNAME
      /^([A-Z]{2,})\s+([A-Z]{2,})/                             // FIRSTNAME LASTNAME
    ];

    // Look for name in first several lines
    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i];
      
      // Skip lines that are clearly not names
      if (this.isDateLike(line) || this.isAddressLike(line) || 
          line.includes('LICENSE') || line.includes('STATE') ||
          /^\d+$/.test(line) || line.length < 3) {
        continue;
      }

      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match) {
          if (match[3]) {
            // First Middle Last or Last, First Middle
            return line.includes(',') 
              ? `${match[2]} ${match[3]} ${match[1]}`
              : `${match[1]} ${match[3]} ${match[2]}`;
          } else if (match[2]) {
            // First Last or Last, First
            return line.includes(',') 
              ? `${match[2]} ${match[1]}`
              : `${match[1]} ${match[2]}`;
          }
        }
      }

      // If line looks like a name (2-3 words, proper case)
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 3 && 
          words.every(word => /^[A-Z][a-z]+$/.test(word))) {
        return line;
      }
    }

    return 'Unknown';
  }

  private extractIDNumber(lines: string[], docType: string): string {
    const patterns = [
      /^([A-Z]\d{7,8})$/,           // Driver's license pattern (A1234567)
      /^(\d{8,12})$/,               // Numeric ID
      /^([A-Z]{1,2}\d{6,9})$/,      // State ID pattern
      /^([A-Z]\d{8})$/,             // Passport pattern
      /DL\s*[#:]?\s*([A-Z0-9]+)/i,  // DL: or DL# followed by number
      /ID\s*[#:]?\s*([A-Z0-9]+)/i,  // ID: or ID# followed by number
      /LICENSE\s*[#:]?\s*([A-Z0-9]+)/i, // LICENSE: followed by number
    ];

    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const idNumber = match[1].replace(/\s+/g, '');
          if (idNumber.length >= 6) {
            return idNumber;
          }
        }
      }
    }

    return 'Unknown';
  }

  private extractDateOfBirth(lines: string[]): string {
    const dobPatterns = [
      /DOB[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /BIRTH[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /BORN[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
    ];

    for (const line of lines) {
      for (const pattern of dobPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const dateStr = match[1];
          if (this.isValidDate(dateStr) && this.isPastDate(dateStr)) {
            return this.formatDate(dateStr);
          }
        }
      }
    }

    return 'Unknown';
  }

  private extractExpirationDate(lines: string[]): string {
    const expPatterns = [
      /EXP[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /EXPIRES[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /EXPIRATION[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    ];

    for (const line of lines) {
      for (const pattern of expPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const dateStr = match[1];
          if (this.isValidDate(dateStr) && this.isFutureDate(dateStr)) {
            return this.formatDate(dateStr);
          }
        }
      }
    }

    // Look for dates that are likely expiration (future dates)
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})/g;
    for (const line of lines) {
      let match;
      while ((match = datePattern.exec(line)) !== null) {
        const dateStr = match[1];
        if (this.isValidDate(dateStr) && this.isFutureDate(dateStr)) {
          return this.formatDate(dateStr);
        }
      }
    }

    return 'Unknown';
  }

  private extractAddress(lines: string[]): string {
    const addressLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip if it's clearly not an address
      if (this.isDateLike(line) || line.length < 5 || 
          /^[A-Z]\d{7,8}$/.test(line) || // ID number
          /^[A-Z]+,\s*[A-Z]+$/.test(line)) { // Name format
        continue;
      }

      // Look for address indicators
      if (this.isAddressLike(line)) {
        addressLines.push(line);
        
        // Check next line for city, state, zip
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (this.isCityStateZip(nextLine)) {
            addressLines.push(nextLine);
            break;
          }
        }
      }
    }

    return addressLines.length > 0 ? addressLines.join(', ') : 'Unknown';
  }

  private isDateLike(text: string): boolean {
    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text) ||
           /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text);
  }

  private isAddressLike(text: string): boolean {
    return /\d+\s+[a-zA-Z\s]+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place)/i.test(text);
  }

  private isCityStateZip(text: string): boolean {
    return /[A-Z\s]+,\s*[A-Z]{2}\s+\d{5}(-\d{4})?/.test(text);
  }

  private isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  private isPastDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date < new Date();
  }

  private isFutureDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date > new Date();
  }

  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  public async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const idScanningService = IDScanningService.getInstance();