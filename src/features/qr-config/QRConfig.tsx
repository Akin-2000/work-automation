import React, { useState, useEffect } from 'react';
import { QRGenerator } from './QRGenerator';
import { FormEditor } from './FormEditor';
import { DynamicFormRenderer } from '../qr-form-renderer/DynamicFormRenderer';
import { getFile, listDirectory, saveFile } from '../../utils/github';
import { 
  Plus, 
  Search, 
  QrCode, 
  Eye, 
  Edit, 
  ArrowLeft,
  FileCode,
  Loader2
} from 'lucide-react';

export const QRConfig: React.FC = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [view, setView] = useState<'list' | 'preview' | 'qr'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    try {
      const files = await listDirectory('src/data/forms');
      const formPromises = files
        .filter((file: any) => file.name.endsWith('.json'))
        .map(async (file: any) => {
          const data = await getFile(file.path);
          return { ...data?.content, sha: data?.sha, path: file.path };
        });
      const loadedForms = await Promise.all(formPromises);
      setForms(loadedForms);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredForms = forms.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.formId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveForm = async (updatedForm: any) => {
    try {
      setLoading(true);
      const fileName = `${updatedForm.formId}.json`;
      const path = `src/data/forms/${fileName}`;
      
      // Check if we already have the SHA for this file
      const existingForm = forms.find(f => f.formId === updatedForm.formId);
      const sha = updatedForm.sha || existingForm?.sha;

      await saveFile(
        path,
        updatedForm,
        `Update form: ${updatedForm.title}`,
        sha
      );
      
      await loadForms();
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form to GitHub. Please check your connection and token.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportScript = (form: any) => {
    const scriptContent = `
/**
 * Dynamic Form Script for ${form.title}
 * Generated on: ${new Date().toISOString()}
 */
(function() {
  const formConfig = ${JSON.stringify(form, null, 2)};
  console.log("Loading form:", formConfig.title);
  
  const mountPoint = document.createElement('div');
  mountPoint.id = 'form-mount-' + formConfig.formId;
  document.body.appendChild(mountPoint);
  
  mountPoint.innerHTML = \`
    <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px; font-family: sans-serif;">
      <h3>\${formConfig.title}</h3>
      <p>\${formConfig.description || ''}</p>
      <p style="color: #666; font-size: 14px;">[Embedded dynamic form script active]</p>
    </div>
  \`;
})();
    `;
    const blob = new Blob([scriptContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.formId}-script.js`;
    a.click();
  };

  if (view === 'list') {
    return (
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Form Configuration</h1>
            <p className="text-muted-foreground mt-1">Manage and configure dynamic forms for QR scanning.</p>
          </div>
          <button 
            onClick={() => {
              setSelectedForm({
                formId: `form_${Date.now()}`,
                title: 'New Dynamic Form',
                description: 'Enter description here',
                fields: [],
                actions: { submitRedirect: '/dashboard', cancelRedirect: '/dashboard' }
              });
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm self-start"
          >
            <Plus size={20} />
            <span>Create New Form</span>
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          <input
            placeholder="Search forms by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-card px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {loading && forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed rounded-2xl">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <p className="text-muted-foreground">Fetching forms from repository...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div key={form.formId} className="group bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <QrCode size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-accent px-2 py-0.5 rounded text-muted-foreground">
                      {form.fields.length} Fields
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{form.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{form.description}</p>
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted p-2 rounded">
                    <span className="opacity-50">ID:</span> {form.formId}
                  </div>
                </div>
                <div className="p-4 bg-muted/30 border-t border-border mt-auto grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => { setSelectedForm(form); setView('preview'); }}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent hover:text-foreground transition-colors text-muted-foreground"
                    title="Preview"
                  >
                    <Eye size={16} />
                    <span className="text-[10px]">Preview</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedForm(form); setView('qr'); }}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent hover:text-foreground transition-colors text-muted-foreground"
                    title="QR Code"
                  >
                    <QrCode size={16} />
                    <span className="text-[10px]">QR Code</span>
                  </button>
                  <button 
                    onClick={() => handleExportScript(form)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent hover:text-foreground transition-colors text-muted-foreground"
                    title="Export Script"
                  >
                    <FileCode size={16} />
                    <span className="text-[10px]">Script</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedForm(form); setIsEditorOpen(true); }}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent hover:text-foreground transition-colors text-muted-foreground"
                    title="Edit"
                  >
                    <Edit size={16} />
                    <span className="text-[10px]">Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedForm && (
          <FormEditor 
            form={selectedForm} 
            open={isEditorOpen} 
            onOpenChange={setIsEditorOpen} 
            onSave={handleSaveForm}
          />
        )}
      </div>
    );
  }

  if (view === 'preview' && selectedForm) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Forms</span>
          </button>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Preview Mode
          </div>
        </div>
        <DynamicFormRenderer config={selectedForm} onSubmit={(data) => console.log("Preview Submit:", data)} />
      </div>
    );
  }

  if (view === 'qr' && selectedForm) {
    const qrValue = `${window.location.origin}/form?id=${selectedForm.formId}`;
    return (
      <div className="p-6 max-w-md mx-auto space-y-6">
        <button 
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Forms</span>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">QR Code for {selectedForm.title}</h2>
          <p className="text-muted-foreground mt-1">Scan this code to launch the form.</p>
        </div>
        <QRGenerator value={qrValue} title={selectedForm.formId} />
      </div>
    );
  }

  return null;
};
