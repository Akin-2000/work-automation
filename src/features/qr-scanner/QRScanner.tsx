import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import forms from '../../mock-data/forms.json';
import { Camera, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Start scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scanner.render((decodedText: string) => {
      // Expected format: [origin]/form?id=entry_gate or just "entry_gate"
      try {
        let formId = decodedText;
        if (decodedText.includes('?id=')) {
          formId = decodedText.split('?id=')[1];
        }
        
        const formConfig = forms.find(f => f.formId === formId);
        if (formConfig) {
          scanner.clear().catch(console.error);
          navigate(`/form?id=${formId}`);
        } else {
          setError(`Form with ID "${formId}" not found in system.`);
        }
      } catch (err) {
        setError("Invalid QR code format.");
      }
    }, (_err: any) => {
      // Silence scanning errors as they occur frequently
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [navigate]);

  const handleReset = () => {
    setError(null);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] max-w-xl mx-auto">
      <div className="w-full text-center space-y-4 mb-8">
        <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary mb-2">
          <Camera size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan a form QR code to start the workflow.</p>
      </div>

      <div className="w-full bg-card rounded-2xl border border-border shadow-lg overflow-hidden relative">
        <div id="reader" className="w-full"></div>
        
        {error && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <AlertTriangle className="text-destructive mb-4" size={48} />
            <h3 className="text-lg font-bold text-destructive">Scanning Error</h3>
            <p className="text-muted-foreground mt-2 mb-6">{error}</p>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        <div className="p-4 border-t border-border bg-muted/30 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Point camera at the QR code
          </p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCw size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold">Instant Loading</p>
            <p className="text-xs text-muted-foreground">Forms load in real-time</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold">Validation Ready</p>
            <p className="text-xs text-muted-foreground">Smart error checking</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Internal Automation System • QR Workflow Enabled</p>
      </div>
    </div>
  );
};
