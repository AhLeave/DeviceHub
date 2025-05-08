import { useState, useEffect, useRef } from "react";
import { Device } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

interface RemoteControlModalProps {
  device: Device;
  isOpen: boolean;
  onClose: () => void;
}

export function RemoteControlModal({ device, isOpen, onClose }: RemoteControlModalProps) {
  const [connecting, setConnecting] = useState(true);
  const [controlActive, setControlActive] = useState(false);
  const { sendMessage, addMessageHandler, status } = useWebSocket();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Clean up timers on unmount
  useEffect(() => {
    const connectingTimeout = setTimeout(() => {
      if (connecting) {
        setConnecting(false);
        setControlActive(true);
        
        toast({
          title: 'Remote Control Active',
          description: `Connected to ${device.name || device.model}`,
        });
      }
    }, 3000);
    
    return () => {
      clearTimeout(connectingTimeout);
    };
  }, [connecting, device, toast]);
  
  // Add message handler for remote control responses
  useEffect(() => {
    if (isOpen && status === 'connected') {
      const removeHandler = addMessageHandler('remote_control_response', (data) => {
        console.log('Remote control response:', data);
        
        // In a real app, this would handle screen updates, etc.
        if (data.type === 'remote_control_response' && data.deviceId === device.deviceId) {
          // Process screen update, etc.
        }
      });
      
      // Send initial remote control request
      sendMessage({
        type: 'remote_control',
        deviceId: device.deviceId,
        command: 'start_session'
      });
      
      return removeHandler;
    }
  }, [isOpen, status, device.deviceId, addMessageHandler, sendMessage]);
  
  const handleFullScreen = () => {
    // Implement full screen
  };
  
  const handleScreenshot = () => {
    // Implement screenshot
  };
  
  const handleSendKeys = () => {
    // Implement send keys
  };
  
  const handleEndSession = () => {
    if (status === 'connected') {
      sendMessage({
        type: 'remote_control',
        deviceId: device.deviceId,
        command: 'end_session'
      });
    }
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Remote Control Session: {device.name || device.model}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="bg-neutral-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
            {connecting ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-64 h-80 border-8 border-neutral-800 rounded-3xl bg-black relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-neutral-800 rounded-b-lg"></div>
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="text-center text-white">
                      <i className="fas fa-sync-alt fa-spin text-4xl mb-4"></i>
                      <p className="text-sm">Connecting to device...</p>
                      <p className="text-xs mt-2 text-neutral-400">This may take a few moments</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-neutral-500 text-sm">
                  Waiting for device to accept connection request...
                </div>
              </div>
            ) : (
              <canvas 
                ref={canvasRef} 
                className="w-full h-full"
              />
            )}
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleFullScreen}
                disabled={!controlActive}
              >
                <i className="fas fa-expand-arrows-alt mr-2"></i> Full Screen
              </Button>
              <Button 
                variant="outline" 
                onClick={handleScreenshot}
                disabled={!controlActive}
              >
                <i className="fas fa-camera mr-2"></i> Screenshot
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSendKeys}
                disabled={!controlActive}
              >
                <i className="fas fa-keyboard mr-2"></i> Send Keys
              </Button>
            </div>
            <div>
              <Button 
                variant="destructive" 
                onClick={handleEndSession}
              >
                <i className="fas fa-power-off mr-2"></i> End Session
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
