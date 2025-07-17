import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageData: string) => void;
  title?: string;
}

export default function CameraModal({ onClose, onCapture, title = "Capture Image" }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    checkCameraDevices();
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const checkCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.warn('Could not enumerate devices:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop any existing stream first
      stopCamera();
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Request camera permission and stream
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      console.log('Requesting camera access with constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream:', mediaStream);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        const video = videoRef.current;
        
        const handleCanPlay = () => {
          console.log('Video can play');
          setIsLoading(false);
        };

        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded');
          video.play()
            .then(() => {
              console.log('Video playing successfully');
              setIsLoading(false);
            })
            .catch((playError) => {
              console.error('Error playing video:', playError);
              setError('Unable to start video playback');
              setIsLoading(false);
            });
        };
        
        const handleError = (e: Event) => {
          console.error('Video error:', e);
          setError('Video playback error');
          setIsLoading(false);
        };

        // Add event listeners
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);

        // Cleanup function for event listeners
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('error', handleError);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
        setError('No camera found. Please ensure your device has a camera.');
      } else if (errorMessage.includes('NotReadableError')) {
        setError('Camera is already in use by another application.');
      } else if (errorMessage.includes('OverconstrainedError')) {
        setError('Camera constraints not supported. Trying with basic settings...');
        // Retry with basic constraints
        setTimeout(() => retryWithBasicConstraints(), 1000);
        return;
      } else {
        setError(`Camera error: ${errorMessage}`);
      }
      setIsLoading(false);
    }
  };

  const retryWithBasicConstraints = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const basicConstraints: MediaStreamConstraints = {
        video: true,
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().then(() => {
          setIsLoading(false);
        });
      }
    } catch (retryError) {
      console.error('Retry camera access failed:', retryError);
      setError('Unable to access camera with any settings');
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context not available');
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    console.log('Capturing photo with dimensions:', canvas.width, 'x', canvas.height);

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL with high quality
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    console.log('Photo captured, data URL length:', imageData.length);
    
    setCapturedImage(imageData);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      console.log('Confirming capture');
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    console.log('Closing camera modal');
    stopCamera();
    onClose();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 p-6 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative">
          {isLoading && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="text-gray-600">Starting camera...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-600 mb-4">{error}</p>
                <div className="space-x-2">
                  <button 
                    onClick={startCamera}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Try Again
                  </button>
                  {hasMultipleCameras && (
                    <button 
                      onClick={switchCamera}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Switch Camera
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && !capturedImage && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-96 rounded-lg bg-black object-cover"
                style={{ minHeight: '200px' }}
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                  <p className="text-sm opacity-75">Position document within frame</p>
                </div>
              </div>
              
              {/* Camera controls overlay */}
              {hasMultipleCameras && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={switchCamera}
                    className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    title="Switch Camera"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto max-h-96 rounded-lg"
              />
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          {!capturedImage ? (
            <>
              <button
                onClick={capturePhoto}
                disabled={isLoading || !!error}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors"
              >
                <Camera className="h-5 w-5 mr-2" />
                Capture
              </button>
              {hasMultipleCameras && (
                <button
                  onClick={switchCamera}
                  disabled={isLoading || !!error}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Switch Camera
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Retake
              </button>
              <button
                onClick={confirmCapture}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
              >
                <Check className="h-5 w-5 mr-2" />
                Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}