import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '../../utils/utils';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'select';
  required?: boolean;
  regex?: string;
  options?: string[];
  placeholder?: string;
  defaultValue?: any;
}

export interface FormConfig {
  formId: string;
  title: string;
  description?: string;
  fields: FormField[];
  actions: {
    submitRedirect?: string;
    cancelRedirect?: string;
  };
}

interface DynamicFormRendererProps {
  config: FormConfig;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  showReturnButton?: boolean;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({ 
  config, 
  onSubmit, 
  onCancel,
  showReturnButton = true
}) => {
  // Generate Zod schema dynamically
  const schema = useMemo(() => {
    const shape: any = {};
    config.fields.forEach((field) => {
      let validator: z.ZodTypeAny = z.any();

      if (field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'textarea') {
        let stringValidator = z.string();
        if (field.required) stringValidator = stringValidator.min(1, `${field.label} is required`);
        if (field.regex) {
          stringValidator = stringValidator.regex(new RegExp(field.regex), `Invalid format for ${field.label}`);
        }
        if (field.type === 'email') stringValidator = stringValidator.email('Invalid email address');
        validator = stringValidator;
      } else if (field.type === 'number') {
        let numberValidator = z.number();
        if (field.required) numberValidator = numberValidator.min(0, `${field.label} is required`);
        validator = numberValidator;
      } else if (field.type === 'checkbox') {
        validator = z.boolean();
      } else if (field.type === 'select' || field.type === 'radio') {
        let selectValidator = z.string();
        if (field.required) selectValidator = selectValidator.min(1, `Please select a ${field.label}`);
        validator = selectValidator;
      }

      shape[field.id] = field.required ? validator : validator.optional();
    });
    return z.object(shape);
  }, [config]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: config.fields.reduce((acc: any, field) => {
      acc[field.id] = field.defaultValue !== undefined ? field.defaultValue : (field.type === 'checkbox' ? false : '');
      return acc;
    }, {}),
  });

  if (isSubmitSuccessful) {
    return (
      <div className="bg-card p-10 rounded-2xl border border-border flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Success!</h2>
        <p className="text-muted-foreground mb-8">Your submission for <strong>{config.title}</strong> has been recorded.</p>
        {showReturnButton && (
          <button 
            onClick={() => window.location.href = config.actions.submitRedirect || '/dashboard'}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-border flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{config.title}</h2>
          {config.description && <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>}
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    errors[field.id] && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register(field.id)}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.id}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    errors[field.id] && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register(field.id)}
                >
                  <option value="">Select option</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id={field.id}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    {...register(field.id)}
                  />
                  <label htmlFor={field.id} className="text-sm text-muted-foreground">
                    Confirm selection
                  </label>
                </div>
              ) : (
                <input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    errors[field.id] && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register(field.id, { valueAsNumber: field.type === 'number' })}
                />
              )}

              {errors[field.id] && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle size={12} />
                  {errors[field.id]?.message as string}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-primary-foreground h-11 px-8 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 h-11 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
