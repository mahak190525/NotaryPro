export interface GeminiReceiptResult {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  confidence: number;
  rawText: string;
  category?: string;
  paymentMethod?: string;
}

export interface GeminiReceiptError {
  code: string;
  message: string;
}

export class GeminiReceiptService {
  private static instance: GeminiReceiptService;
  private apiKey: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  public static getInstance(): GeminiReceiptService {
    if (!GeminiReceiptService.instance) {
      GeminiReceiptService.instance = new GeminiReceiptService();
    }
    return GeminiReceiptService.instance;
  }

  public async processReceipt(imageData: string | File): Promise<GeminiReceiptResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    try {
      // Convert image to base64 if it's a File
      let base64Image: string;
      if (imageData instanceof File) {
        base64Image = await this.fileToBase64(imageData);
      } else {
        // Remove data URL prefix if present
        base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this receipt image and extract the following information in JSON format:
                {
                  "vendor": "business/store name",
                  "amount": "total amount as number (not string)",
                  "date": "transaction date in YYYY-MM-DD format",
                  "description": "brief description of items/services purchased",
                  "category": "expense category (Office Supplies, Fuel, Meals & Entertainment, Travel, Equipment, Software, Marketing, Professional Services, Insurance, or Other)",
                  "paymentMethod": "payment method if visible (Credit Card, Debit Card, Cash, Check, or Unknown)",
                  "confidence": "confidence score from 0-100"
                }
                
                Important instructions:
                - For amount, extract the TOTAL amount (not subtotal), look for words like "Total", "Amount Due", "Balance Due"
                - If multiple amounts are present, choose the final total amount
                - For date, convert to YYYY-MM-DD format (e.g., 01/15/2025 becomes 2025-01-15)
                - For category, choose the most appropriate category based on the vendor and items
                - If any field cannot be determined clearly, use appropriate defaults:
                  - vendor: "Unknown Vendor"
                  - amount: 0
                  - date: today's date
                  - description: "Receipt transaction"
                  - category: "Other"
                  - paymentMethod: "Unknown"
                - Be as accurate as possible and only extract information that is clearly visible`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      // Parse the JSON response
      const parsedData = this.parseGeminiResponse(generatedText);
      
      return {
        ...parsedData,
        rawText: generatedText
      };

    } catch (error) {
      console.error('Gemini receipt processing error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process receipt with Gemini');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private parseGeminiResponse(text: string): Omit<GeminiReceiptResult, 'rawText'> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          vendor: parsed.vendor || 'Unknown Vendor',
          amount: typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 0,
          date: this.formatDate(parsed.date) || new Date().toISOString().split('T')[0],
          description: parsed.description || 'Receipt transaction',
          category: parsed.category || 'Other',
          paymentMethod: parsed.paymentMethod || 'Unknown',
          confidence: Math.min(Math.max(parsed.confidence || 0, 0), 100)
        };
      }
    } catch (error) {
      console.warn('Failed to parse Gemini JSON response, falling back to text parsing');
    }

    // Fallback to text parsing if JSON parsing fails
    return this.parseTextResponse(text);
  }

  private parseTextResponse(text: string): Omit<GeminiReceiptResult, 'rawText'> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      vendor: this.extractField(lines, ['vendor', 'business', 'store']) || 'Unknown Vendor',
      amount: parseFloat(this.extractField(lines, ['amount', 'total']) || '0') || 0,
      date: this.formatDate(this.extractField(lines, ['date', 'transaction date'])) || new Date().toISOString().split('T')[0],
      description: this.extractField(lines, ['description', 'items']) || 'Receipt transaction',
      category: this.extractField(lines, ['category']) || 'Other',
      paymentMethod: this.extractField(lines, ['payment', 'method']) || 'Unknown',
      confidence: 75 // Default confidence for text parsing
    };
  }

  private extractField(lines: string[], fieldNames: string[]): string | null {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const fieldName of fieldNames) {
        if (lowerLine.includes(fieldName.toLowerCase())) {
          // Extract value after colon or similar separator
          const parts = line.split(/[:=]/);
          if (parts.length > 1) {
            return parts[1].trim().replace(/['"]/g, '');
          }
        }
      }
    }
    return null;
  }

  private formatDate(dateStr: string | null): string | null {
    if (!dateStr) return null;
    
    try {
      // Handle various date formats
      let date: Date;
      
      // If already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // Handle MM/DD/YYYY or MM-DD-YYYY format
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[\/\-]/);
        date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      }
      // Handle DD/MM/YYYY format (less common in US)
      else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
        date = new Date(dateStr);
      }
      // Try parsing as-is
      else {
        date = new Date(dateStr);
      }
      
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // If parsing fails, return null
    }
    
    return null;
  }

  private categorizeVendor(vendor: string): string {
    const vendorLower = vendor.toLowerCase();
    
    // Office supplies
    if (vendorLower.includes('office') || vendorLower.includes('staples') || 
        vendorLower.includes('depot') || vendorLower.includes('supply')) {
      return 'Office Supplies';
    }
    
    // Fuel
    if (vendorLower.includes('shell') || vendorLower.includes('exxon') || 
        vendorLower.includes('chevron') || vendorLower.includes('bp') || 
        vendorLower.includes('gas') || vendorLower.includes('fuel')) {
      return 'Fuel';
    }
    
    // Meals & Entertainment
    if (vendorLower.includes('restaurant') || vendorLower.includes('cafe') || 
        vendorLower.includes('coffee') || vendorLower.includes('starbucks') || 
        vendorLower.includes('mcdonald') || vendorLower.includes('food')) {
      return 'Meals & Entertainment';
    }
    
    // Travel
    if (vendorLower.includes('hotel') || vendorLower.includes('airline') || 
        vendorLower.includes('uber') || vendorLower.includes('lyft') || 
        vendorLower.includes('taxi') || vendorLower.includes('rental')) {
      return 'Travel';
    }
    
    // Equipment
    if (vendorLower.includes('best buy') || vendorLower.includes('electronics') || 
        vendorLower.includes('computer') || vendorLower.includes('tech')) {
      return 'Equipment';
    }
    
    return 'Other';
  }
}

export const geminiReceiptService = GeminiReceiptService.getInstance();