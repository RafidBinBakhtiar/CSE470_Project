'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface IframeModelViewerProps {
  modelUrl: string;
  customColor?: string;
  customImage?: string;
  isFullTexture?: boolean;
  onColorChange?: (color: string) => void;
}

export default function IframeModelViewer({
  modelUrl,
  customColor,
  customImage,
  isFullTexture = false,
  onColorChange,
}: IframeModelViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [placedImages, setPlacedImages] = useState<Array<{ id: string; url: string }>>([]);
  const { toast } = useToast();

  // Reset states when modelUrl changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setPlacedImages([]);
  }, [modelUrl]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsIframeReady(true);
    if (modelUrl) {
      sendModelUrl();
    }
  };

  // Send model URL to iframe
  const sendModelUrl = () => {
    if (iframeRef.current && isIframeReady) {
      iframeRef.current.contentWindow?.postMessage(
        { type: 'setModelUrl', url: modelUrl },
        '*'
      );
    }
  };

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;

      switch (data.type) {
        case 'iframeReady':
          setIsIframeReady(true);
          if (modelUrl) {
            sendModelUrl();
          }
          break;
        case 'modelLoaded':
          setIsLoading(false);
          setError(null);
          break;
        case 'modelError':
          setError(data.message);
          setIsLoading(false);
          break;
        case 'colorApplied':
          if (onColorChange) {
            onColorChange(data.color);
          }
          toast({
            title: 'Color applied',
            description: 'The color has been successfully applied to the model.',
          });
          break;
        case 'textureReady':
          toast({
            title: 'Texture ready',
            description: 'The texture is ready to be applied to the model.',
          });
          break;
        case 'textureApplied':
          toast({
            title: 'Texture applied',
            description: 'The texture has been successfully applied to the model.',
          });
          break;
        case 'imagePlaced':
          setPlacedImages(prev => [
            ...prev,
            { id: Date.now().toString(), url: data.imageUrl }
          ]);
          toast({
            title: 'Image placed',
            description: 'The image has been successfully placed on the model.',
          });
          break;
        case 'imageRemoved':
          setPlacedImages(prev => prev.slice(0, -1));
          toast({
            title: 'Image removed',
            description: 'The last image has been removed from the model.',
          });
          break;
        case 'imagesRemoved':
          setPlacedImages([]);
          toast({
            title: 'All images removed',
            description: 'All images have been removed from the model.',
          });
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [modelUrl, isIframeReady, toast, onColorChange]);

  // Send model URL when it changes
  useEffect(() => {
    if (isIframeReady && modelUrl) {
      sendModelUrl();
    }
  }, [modelUrl, isIframeReady]);

  // Send custom color when it changes
  useEffect(() => {
    if (isIframeReady && customColor) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'updateColor', color: customColor },
        '*'
      );
    }
  }, [customColor, isIframeReady]);

  // Send custom image when it changes
  useEffect(() => {
    if (isIframeReady && customImage) {
      iframeRef.current?.contentWindow?.postMessage(
        { 
          type: 'updateTexture', 
          imageUrl: customImage,
          isFull: true
        },
        '*'
      );
    }
  }, [customImage, isIframeReady]);

  // Retry loading the model
  const retryLoading = () => {
    setIsLoading(true);
    setError(null);
    if (modelUrl) {
      sendModelUrl();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={retryLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src="/model-viewer.html"
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        title="3D Model Viewer"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
} 