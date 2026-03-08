import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Copy } from 'lucide-react';

interface QRGeneratorProps {
  value: string;
  title?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ value, title }) => {
  const downloadQR = () => {
    const svg = document.getElementById(`qr-svg-${title || 'code'}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${title || 'qr-code'}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-background border border-border rounded-2xl shadow-sm">
      <div className="bg-white p-4 rounded-xl shadow-inner">
        <QRCodeSVG 
          id={`qr-svg-${title || 'code'}`}
          value={value} 
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <div className="w-full space-y-3">
        <div className="text-center">
          <p className="text-sm font-medium">QR Link</p>
          <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded mt-1">{value}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={downloadQR}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download size={16} />
            <span>Download PNG</span>
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(value);
              alert("Link copied to clipboard!");
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
          >
            <Copy size={16} />
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
