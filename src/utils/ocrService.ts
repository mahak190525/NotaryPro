import Tesseract from 'tesseract.js';

export interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  confidence: number;
  rawText: string;
}

export class OCRService {
  private static instance: OCRService;
  private worker: Tesseract.Worker | null = null;

  private constructor() {}

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.worker) return;

    try {
      this.worker = await Tesseract.createWorker('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/$-: ',
      });
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  public async processImage(imageData: string | File): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker failed to initialize');
    }

    try {
      const { data } = await this.worker.recognize(imageData);
      const rawText = data.text;
      const confidence = data.confidence;

      // Parse the extracted text to find receipt information
      const parsedData = this.parseReceiptText(rawText);

      return {
        ...parsedData,
        confidence: Math.round(confidence),
        rawText
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  private parseReceiptText(text: string): Omit<OCRResult, 'confidence' | 'rawText'> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract vendor (usually one of the first few lines)
    const vendor = this.extractVendor(lines);
    
    // Extract amount (look for currency patterns)
    const amount = this.extractAmount(text);
    
    // Extract date
    const date = this.extractDate(text);
    
    // Generate description from items or fallback
    const description = this.extractDescription(lines, vendor);

    return {
      vendor,
      amount,
      date,
      description
    };
  }

  private extractVendor(lines: string[]): string {
    // Common vendor patterns and known stores
    const knownVendors = [
      'walmart', 'target', 'costco', 'home depot', 'lowes', 'best buy',
      'starbucks', 'mcdonalds', 'subway', 'chipotle', 'taco bell',
      'shell', 'exxon', 'chevron', 'bp', 'mobil', '76',
      'office depot', 'staples', 'fedex', 'ups', 'usps',
      'cvs', 'walgreens', 'rite aid', 'pharmacy'
    ];

    // Look for vendor in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].toLowerCase();
      
      // Check against known vendors
      for (const vendor of knownVendors) {
        if (line.includes(vendor)) {
          return this.capitalizeWords(vendor);
        }
      }
      
      // If line looks like a business name (has letters and is not too long)
      if (line.length > 2 && line.length < 50 && /[a-zA-Z]/.test(line) && 
          !line.includes('$') && !line.includes('total') && 
          !this.isDateLike(line) && !this.isAddressLike(line)) {
        return this.capitalizeWords(line);
      }
    }

    return 'Unknown Vendor';
  }

  private extractAmount(text: string): number {
    // Clean up text and split into lines for better analysis
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for TOTAL amount patterns with priority system
    const totalPatterns = [
      // Highest priority - explicit final totals
      { pattern: /(?:grand|final)\s+total[:\s]*\$?(\d+\.\d{2})/gi, priority: 1 },
      { pattern: /amount\s+due[:\s]*\$?(\d+\.\d{2})/gi, priority: 1 },
      { pattern: /balance\s+due[:\s]*\$?(\d+\.\d{2})/gi, priority: 1 },
      
      // High priority - total at end of line or with specific formatting
      { pattern: /^total[:\s]*\$?(\d+\.\d{2})$/gmi, priority: 2 },
      { pattern: /\btotal[:\s]+\$?(\d+\.\d{2})\s*$/gmi, priority: 2 },
      
      // Medium priority - general total patterns (excluding subtotal)
      { pattern: /(?<!sub)(?<!grand\s)(?<!final\s)total[:\s]*\$?(\d+\.\d{2})/gi, priority: 3 },
      
      // Lower priority - any total mention
      { pattern: /\btotal[:\s]*\$?(\d+\.\d{2})/gi, priority: 4 },
      
      // Fallback - currency amounts (will be filtered by position)
      { pattern: /\$(\d+\.\d{2})/g, priority: 5 }
    ];

    const foundAmounts: { amount: number; priority: number; lineIndex: number; context: string }[] = [];

    // First pass: find all potential totals with context
    for (const { pattern, priority } of totalPatterns) {
      let match;
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) {
          // Find which line this match is on
          const matchIndex = match.index || 0;
          const textBeforeMatch = text.substring(0, matchIndex);
          const lineIndex = textBeforeMatch.split('\n').length - 1;
          const context = lines[lineIndex] || match[0];
          
          foundAmounts.push({
            amount,
            priority,
            lineIndex,
            context: context.toLowerCase()
          });
        }
      }
    }

    if (foundAmounts.length === 0) return 0;

    // Filter out subtotals and tax amounts
    const filteredAmounts = foundAmounts.filter(item => {
      const context = item.context.toLowerCase();
      return !context.includes('subtotal') && 
             !context.includes('sub total') && 
             !context.includes('tax') && 
             !context.includes('discount') &&
             !context.includes('tip');
    });

    const amountsToConsider = filteredAmounts.length > 0 ? filteredAmounts : foundAmounts;

    // Sort by priority (lower number = higher priority), then by line position (later = more likely to be final total)
    amountsToConsider.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // For same priority, prefer amounts that appear later in the text
      return b.lineIndex - a.lineIndex;
    });

    // Additional logic: if we have multiple amounts with same priority, prefer the one that's likely the final total
    const topPriorityAmounts = amountsToConsider.filter(item => item.priority === amountsToConsider[0].priority);
    
    if (topPriorityAmounts.length > 1) {
      // Look for the amount that appears in the bottom half of the receipt
      const midPoint = lines.length / 2;
      const bottomHalfAmounts = topPriorityAmounts.filter(item => item.lineIndex > midPoint);
      
      if (bottomHalfAmounts.length > 0) {
        // Among bottom half amounts, pick the largest (most likely to be final total)
        return Math.max(...bottomHalfAmounts.map(item => item.amount));
      }
    }

    return amountsToConsider[0].amount;
  }

  private extractAmount_old(text: string): number {
    // Look for all TOTAL amount patterns and find the real total
    const totalPatterns = [
      /(?<!sub)total[:\s]*\$?(\d+\.\d{2})/gi,  // "Total" but NOT "Subtotal" with exact currency format
      /(?<!sub)total[:\s]*\$?(\d+\.?\d*)/gi,   // "Total" but NOT "Subtotal" with any decimal format
      /\btotal[:\s]*\$?(\d+\.\d{2})/gi,        // Word boundary "total" with exact currency format
      /\btotal[:\s]*\$?(\d+\.?\d*)/gi,         // Word boundary "total" with any decimal format
      /grand\s+total[:\s]*\$?(\d+\.\d{2})/gi,  // "Grand Total" with exact currency format
      /grand\s+total[:\s]*\$?(\d+\.?\d*)/gi,   // "Grand Total" with any decimal format
      /final\s+total[:\s]*\$?(\d+\.\d{2})/gi,  // "Final Total" with exact currency format
      /final\s+total[:\s]*\$?(\d+\.?\d*)/gi,   // "Final Total" with any decimal format
      /amount\s+due[:\s]*\$?(\d+\.\d{2})/gi,   // "Amount Due" with exact currency format
      /amount\s+due[:\s]*\$?(\d+\.?\d*)/gi,    // "Amount Due" with any decimal format
      /\$(\d+\.\d{2})/g                        // Any currency format as final fallback
    ];

    const totalAmounts: { amount: number; priority: number; pattern: string }[] = [];
    const fallbackAmounts: number[] = [];

    for (let i = 0; i < totalPatterns.length; i++) {
      const pattern = totalPatterns[i];
      let match;
      // Reset regex lastIndex to ensure we start from the beginning
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) {
          if (i < totalPatterns.length - 1) { // Not the fallback pattern
            totalAmounts.push({
              amount,
              priority: i, // Lower index = higher priority
              pattern: pattern.source
            });
          } else {
            fallbackAmounts.push(amount);
          }
        }
      }
    }

    // If we found specific total patterns, return the highest priority one
    if (totalAmounts.length > 0) {
      // Sort by priority (lower number = higher priority), then by amount (higher = more likely to be final total)
      totalAmounts.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return b.amount - a.amount; // Higher amount first for same priority
      });
      
      return totalAmounts[0].amount;
    }

    // Return the largest amount found as fallback
    return fallbackAmounts.length > 0 ? Math.max(...fallbackAmounts) : 0;
  }

  private extractDate(text: string): string {
    // Date patterns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/i,
      /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[0];
        try {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Date parsing error:', error);
        }
      }
    }

    // Fallback to today's date
    return new Date().toISOString().split('T')[0];
  }

  private extractDescription(lines: string[], vendor: string): string {
    // Look for item lines (usually contain prices or quantities)
    const itemLines = lines.filter(line => {
      const lower = line.toLowerCase();
      return (
        line.includes('$') || 
        /\d+\.\d{2}/.test(line) ||
        /qty|quantity/i.test(line) ||
        (/\d+\s*x\s*/.test(line) && !lower.includes('tax'))
      ) && 
      !lower.includes('total') && 
      !lower.includes('subtotal') && 
      !lower.includes('tax') &&
      !lower.includes('change') &&
      !this.isDateLike(line) &&
      !this.isAddressLike(line);
    });

    if (itemLines.length > 0) {
      // Take first few items and clean them up
      const items = itemLines.slice(0, 3).map(line => {
        // Remove prices and clean up
        return line.replace(/\$\d+\.\d{2}/g, '').replace(/\d+\.\d{2}/g, '').trim();
      }).filter(item => item.length > 0);

      if (items.length > 0) {
        return items.join(', ');
      }
    }

    // Fallback descriptions based on vendor
    const vendorDescriptions: { [key: string]: string } = {
      'starbucks': 'Coffee and beverages',
      'shell': 'Gasoline',
      'exxon': 'Gasoline',
      'chevron': 'Gasoline',
      'office depot': 'Office supplies',
      'staples': 'Office supplies',
      'walmart': 'General merchandise',
      'target': 'General merchandise',
      'cvs': 'Pharmacy items',
      'walgreens': 'Pharmacy items'
    };

    const vendorLower = vendor.toLowerCase();
    for (const [key, desc] of Object.entries(vendorDescriptions)) {
      if (vendorLower.includes(key)) {
        return desc;
      }
    }

    return `Purchase from ${vendor}`;
  }

  private isDateLike(text: string): boolean {
    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text) || 
           /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text);
  }

  private isAddressLike(text: string): boolean {
    return /\d+\s+[a-zA-Z\s]+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive)/i.test(text) ||
           /\d{5}/.test(text); // ZIP code
  }

  private capitalizeWords(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  public async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = OCRService.getInstance();