import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div 
      className="bg-amber-900/20 border border-amber-700/50 px-4 py-3 text-center"
      role="banner"
      aria-label="Important disclaimer"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-amber-200">
          This tool explains parliamentary discussions. It does not provide legal support or voting advice.
        </p>
      </div>
    </div>
  );
}