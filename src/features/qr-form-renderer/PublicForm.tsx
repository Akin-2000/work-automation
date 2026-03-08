import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import forms from '../../mock-data/forms.json';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const PublicForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formId = searchParams.get('id');

  const formConfig = useMemo(() => {
    if (!formId) return null;
    return forms.find((f) => f.formId === formId);
  }, [formId]);

  const handleFormSubmit = (data: any) => {
    console.log(`Form ${formId} submitted:`, data);
    // In a real app, this would be an API call to save the submission
  };

  if (!formId) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold mb-2">Missing Form ID</h1>
          <p className="text-muted-foreground mb-6">No form identifier was provided in the URL.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
          <p className="text-muted-foreground mb-6">The form with ID <strong>"{formId}"</strong> could not be found.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <DynamicFormRenderer 
          config={formConfig as any} 
          onSubmit={handleFormSubmit}
          showReturnButton={false}
        />
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2026 Internal Automation System • Fast & Secure</p>
        </div>
      </div>
    </div>
  );
};
