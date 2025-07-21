export interface FingerprintScanResult {
  success: boolean;
  imageData?: string;
  quality: number;
  error?: string;
}

export class USBFingerprintService {
  private static instance: USBFingerprintService;
  private device: USBDevice | null = null;

  private constructor() {}

  public static getInstance(): USBFingerprintService {
    if (!USBFingerprintService.instance) {
      USBFingerprintService.instance = new USBFingerprintService();
    }
    return USBFingerprintService.instance;
  }

  public async requestDevice(): Promise<USBDevice> {
    if (!navigator.usb) {
      throw new Error('WebUSB is not supported in this browser');
    }

    // Common vendor IDs for fingerprint scanners
    const filters = [
      { vendorId: 0x147e }, // Upek/AuthenTec
      { vendorId: 0x08ff }, // AuthenTec
      { vendorId: 0x0483 }, // STMicroelectronics
      { vendorId: 0x27c6 }, // Shenzhen Goodix Technology
      { vendorId: 0x138a }, // Validity Sensors
      { vendorId: 0x06cb }, // Synaptics
      { vendorId: 0x1c7a }, // LighTuning Technology
      { vendorId: 0x04f3 }, // Elan Microelectronics
      { vendorId: 0x2808 }, // Focal Tech
      { vendorId: 0x1491 }, // Futronic Technology
    ];

    const device = await navigator.usb.requestDevice({ filters });
    this.device = device;
    return device;
  }

  public async connectDevice(): Promise<void> {
    if (!this.device) {
      throw new Error('No device selected');
    }

    try {
      await this.device.open();
      
      // Select configuration (usually configuration 1)
      if (this.device.configuration === null) {
        await this.device.selectConfiguration(1);
      }
      
      // Claim the interface (usually interface 0)
      await this.device.claimInterface(0);
      
      console.log('USB fingerprint scanner connected successfully');
    } catch (error) {
      console.error('Failed to connect to USB device:', error);
      throw new Error('Failed to connect to fingerprint scanner');
    }
  }

  public async scanFingerprint(): Promise<FingerprintScanResult> {
    if (!this.device) {
      throw new Error('No device connected');
    }

    try {
      // Send scan command to device
      // This is a simplified example - actual commands depend on the specific scanner
      const scanCommand = new Uint8Array([0x01, 0x00, 0x00, 0x00]); // Example command
      
      // Send command to device (endpoint 1, typically)
      await this.device.transferOut(1, scanCommand);
      
      // Wait for scan completion
      await this.waitForScanCompletion();
      
      // Read fingerprint data
      const result = await this.device.transferIn(1, 64); // Read 64 bytes
      
      if (result.status === 'ok' && result.data) {
        // Process the raw fingerprint data
        const imageData = await this.processRawFingerprintData(result.data);
        
        return {
          success: true,
          imageData,
          quality: this.calculateQuality(result.data),
        };
      } else {
        throw new Error('Failed to read fingerprint data');
      }
    } catch (error) {
      console.error('Fingerprint scan error:', error);
      return {
        success: false,
        quality: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async waitForScanCompletion(): Promise<void> {
    // Poll device status until scan is complete
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds timeout
    
    while (attempts < maxAttempts) {
      try {
        const statusResult = await this.device!.transferIn(2, 4); // Status endpoint
        if (statusResult.status === 'ok' && statusResult.data) {
          const status = new Uint8Array(statusResult.data.buffer)[0];
          if (status === 0x01) { // Scan complete
            return;
          }
        }
      } catch (error) {
        console.warn('Status check failed:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    throw new Error('Scan timeout - please try again');
  }

  private async processRawFingerprintData(data: DataView): Promise<string> {
    // Convert raw fingerprint data to image
    // This is a simplified example - actual processing depends on the scanner format
    
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Typical fingerprint image width
    canvas.height = 256; // Typical fingerprint image height
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    
    // Create image data from raw bytes
    const imageData = ctx.createImageData(256, 256);
    const rawBytes = new Uint8Array(data.buffer);
    
    // Convert grayscale data to RGBA
    for (let i = 0; i < rawBytes.length && i < imageData.data.length / 4; i++) {
      const pixelIndex = i * 4;
      const grayValue = rawBytes[i];
      
      imageData.data[pixelIndex] = grayValue;     // Red
      imageData.data[pixelIndex + 1] = grayValue; // Green
      imageData.data[pixelIndex + 2] = grayValue; // Blue
      imageData.data[pixelIndex + 3] = 255;       // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Apply fingerprint enhancement
    this.enhanceFingerprintImage(ctx, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/png');
  }

  private enhanceFingerprintImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Apply basic image enhancement for better fingerprint visibility
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Simple contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // Since it's grayscale, R=G=B
      
      // Increase contrast
      const enhanced = gray < 128 ? Math.max(0, gray - 30) : Math.min(255, gray + 30);
      
      data[i] = enhanced;     // Red
      data[i + 1] = enhanced; // Green
      data[i + 2] = enhanced; // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  private calculateQuality(data: DataView): number {
    // Simple quality calculation based on data variance
    const bytes = new Uint8Array(data.buffer);
    let sum = 0;
    let sumSquares = 0;
    
    for (let i = 0; i < bytes.length; i++) {
      sum += bytes[i];
      sumSquares += bytes[i] * bytes[i];
    }
    
    const mean = sum / bytes.length;
    const variance = (sumSquares / bytes.length) - (mean * mean);
    
    // Convert variance to quality score (0-100)
    const quality = Math.min(100, Math.max(0, (variance / 100) * 100));
    return Math.round(quality);
  }

  public async disconnectDevice(): Promise<void> {
    if (this.device) {
      try {
        await this.device.close();
        console.log('USB fingerprint scanner disconnected');
      } catch (error) {
        console.error('Error disconnecting device:', error);
      } finally {
        this.device = null;
      }
    }
  }

  public async getConnectedDevices(): Promise<USBDevice[]> {
    if (!navigator.usb) {
      return [];
    }
    
    return await navigator.usb.getDevices();
  }

  // Generate mock fingerprint for testing when no real device is available
  public generateMockFingerprint(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 256, 256);
    
    // Fingerprint pattern
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1.5;
    
    // Draw concentric ellipses for fingerprint ridges
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.ellipse(128, 128, 20 + i * 8, 15 + i * 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Add ridge details
    ctx.lineWidth = 1;
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const radius = 30 + Math.random() * 80;
      const x1 = 128 + Math.cos(angle) * radius;
      const y1 = 128 + Math.sin(angle) * radius;
      const x2 = x1 + Math.cos(angle + Math.PI/2) * (Math.random() * 8 - 4);
      const y2 = y1 + Math.sin(angle + Math.PI/2) * (Math.random() * 8 - 4);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // Add minutiae points (characteristic points in fingerprints)
    ctx.fillStyle = '#e53e3e';
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const radius = 40 + Math.random() * 60;
      const x = 128 + Math.cos(angle) * radius;
      const y = 128 + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add timestamp and quality info
    ctx.fillStyle = '#4a5568';
    ctx.font = '12px Arial';
    ctx.fillText(`Scanned: ${new Date().toLocaleTimeString()}`, 10, 240);
    ctx.fillText('Quality: High (Mock)', 10, 20);
    ctx.fillText('USB Scanner: Simulated', 10, 35);
    
    return canvas.toDataURL('image/png');
  }
}

export const usbFingerprintService = USBFingerprintService.getInstance();