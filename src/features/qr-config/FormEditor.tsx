import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../components/ui/dialog';
import type { FormConfig, FormField } from '../qr-form-renderer/DynamicFormRenderer';
import { Plus, Trash2, GripVertical, AlertCircle, Save } from 'lucide-react';
import { cn } from '../../utils/utils';

interface FormEditorProps {
  form: FormConfig;
  onSave: (updatedForm: FormConfig) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputTypes = ['text', 'number', 'email', 'tel', 'date', 'textarea', 'checkbox', 'radio', 'select'];

export const FormEditor: React.FC<FormEditorProps> = ({ 
  form, 
  onSave, 
  open, 
  onOpenChange 
}) => {
  const [editedForm, setEditedForm] = useState<FormConfig>({ ...form });

  const handleFieldChange = (index: number, updates: Partial<FormField>) => {
    const newFields = [...editedForm.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setEditedForm({ ...editedForm, fields: newFields });
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false
    };
    setEditedForm({ ...editedForm, fields: [...editedForm.fields, newField] });
  };

  const removeField = (index: number) => {
    const newFields = editedForm.fields.filter((_, i) => i !== index);
    setEditedForm({ ...editedForm, fields: newFields });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Form: {form.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Form Title</label>
              <input 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={editedForm.title}
                onChange={(e) => setEditedForm({ ...editedForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Form ID</label>
              <input 
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={editedForm.formId}
                onChange={(e) => setEditedForm({ ...editedForm, formId: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Form Fields</h3>
              <button 
                onClick={addField}
                className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors"
              >
                <Plus size={16} />
                <span>Add Field</span>
              </button>
            </div>

            <div className="space-y-3">
              {editedForm.fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-xl bg-muted/20 space-y-4 group relative">
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground cursor-grab">
                      <GripVertical size={18} />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Label</label>
                        <input 
                          className="w-full bg-background border border-input rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                          value={field.label}
                          onChange={(e) => handleFieldChange(index, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Type</label>
                        <select 
                          className="w-full bg-background border border-input rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                          value={field.type}
                          onChange={(e) => handleFieldChange(index, { type: e.target.value as any })}
                        >
                          {inputTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center gap-2 pb-1 bg-background border border-input rounded-md px-3 py-1 min-w-[100px]">
                          <input 
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(index, { required: e.target.checked })}
                            id={`req-${field.id}`}
                          />
                          <label htmlFor={`req-${field.id}`} className="text-xs">Required</label>
                        </div>
                        <button 
                          onClick={() => removeField(index)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {['text', 'tel', 'email'].includes(field.type) && (
                    <div className="pl-8 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Regex Validation (Optional)</label>
                        <input 
                          placeholder="e.g. ^[0-9]{10}$"
                          className="w-full bg-background border border-input rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                          value={field.regex || ''}
                          onChange={(e) => handleFieldChange(index, { regex: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Placeholder</label>
                        <input 
                          placeholder="Enter value..."
                          className="w-full bg-background border border-input rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                          value={field.placeholder || ''}
                          onChange={(e) => handleFieldChange(index, { placeholder: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {['select', 'radio'].includes(field.type) && (
                    <div className="pl-8 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Options (Comma separated)</label>
                      <input 
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full bg-background border border-input rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
                        value={field.options?.join(', ') || ''}
                        onChange={(e) => handleFieldChange(index, { options: e.target.value.split(',').map(s => s.trim()) })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <button 
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(editedForm);
              onOpenChange(false);
            }}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
