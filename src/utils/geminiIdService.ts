export interface GeminiIDResult {
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

export interface GeminiIDError {
  code: string;
  message: string;
}

export class GeminiIDService {
  private static instance: GeminiIDService;
  private apiKey: string;

  private constructor() {
    // You'll need to set your Gemini API key
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  public static getInstance(): GeminiIDService {
    if (!GeminiIDService.instance) {
      GeminiIDService.instance = new GeminiIDService();
    }
    return GeminiIDService.instance;
  }

  public async scanID(imageData: string | File): Promise<GeminiIDResult> {
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
                text: `Analyze this ID document image and extract the following information in JSON format:
                {
                  "type": "document type (Driver's License, Passport, State ID, etc.)",
                  "number": "ID number",
                  "name": "full name",
                  "address": "full address",
                  "dateOfBirth": "date of birth in YYYY-MM-DD format",
                  "expiration": "expiration date in YYYY-MM-DD format",
                  "confidence": "confidence score from 0-100"
                }
                
                If any field cannot be determined, use "Unknown" as the value. Be as accurate as possible and only extract information that is clearly visible in the image.`
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
        verified: parsedData.confidence > 70 && parsedData.number !== 'Unknown' && parsedData.name !== 'Unknown',
        rawText: generatedText
      };

    } catch (error) {
      console.error('Gemini ID scanning error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to scan ID with Gemini');
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

  private parseGeminiResponse(text: string): Omit<GeminiIDResult, 'verified' | 'rawText'> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: parsed.type || 'Unknown ID Type',
          number: parsed.number || 'Unknown',
          name: parsed.name || 'Unknown',
          address: parsed.address || 'Unknown',
          dateOfBirth: this.formatDate(parsed.dateOfBirth) || 'Unknown',
          expiration: this.formatDate(parsed.expiration) || 'Unknown',
          confidence: Math.min(Math.max(parsed.confidence || 0, 0), 100)
        };
      }
    } catch (error) {
      console.warn('Failed to parse Gemini JSON response, falling back to text parsing');
    }

    // Fallback to text parsing if JSON parsing fails
    return this.parseTextResponse(text);
  }

  private parseTextResponse(text: string): Omit<GeminiIDResult, 'verified' | 'rawText'> {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      type: this.extractField(lines, ['type', 'document type']) || 'Unknown ID Type',
      number: this.extractField(lines, ['number', 'id number', 'license number']) || 'Unknown',
      name: this.extractField(lines, ['name', 'full name']) || 'Unknown',
      address: this.extractField(lines, ['address', 'full address']) || 'Unknown',
      dateOfBirth: this.formatDate(this.extractField(lines, ['dateOfBirth', 'date of birth', 'dob'])) || 'Unknown',
      expiration: this.formatDate(this.extractField(lines, ['expiration', 'expiration date', 'expires'])) || 'Unknown',
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
    if (!dateStr || dateStr === 'Unknown') return null;
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // If parsing fails, return the original string
    }
    
    return dateStr;
  }
}

export const geminiIdService = GeminiIDService.getInstance();