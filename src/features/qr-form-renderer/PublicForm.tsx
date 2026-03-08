import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { getFile, saveFile } from '../../utils/github';
import { AlertTriangle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const PublicForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formId = searchParams.get('id');
  const [formConfig, setFormConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const data = await getFile(`src/data/forms/${formId}.json`);
      if (data) {
        setFormConfig(data.content);
      }
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);
      const submissionId = `sub_${Date.now()}`;
      const timestamp = new Date().toISOString();
      const submission = {
        id: submissionId,
        formId,
        userName: data.name || 'Anonymous',
        formName: formConfig?.title || 'Unknown Form',
        status: 'submitted',
        timestamp,
        device: navigator.userAgent.split(') ')[0].split(' (')[1] || 'Web Browser',
        location: 'Remote',
        data
      };

      await saveFile(
        `src/data/submissions/${formId}/${submissionId}.json`,
        submission,
        `New submission for ${formConfig?.title}`
      );
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg max-w-md w-full text-center">
          <CheckCircle2 className="text-green-500 mx-auto mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-2">Submission Successful!</h1>
          <p className="text-muted-foreground mb-6">Your response has been recorded in our system.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

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
