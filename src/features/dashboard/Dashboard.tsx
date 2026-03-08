import React, { useState, useEffect } from 'react';
import { 
  Users, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock,
  BarChart3
} from 'lucide-react';
import { KPICard } from './KPICard';
import { SubmissionsTable } from './SubmissionsTable';
import { listDirectory, getFile, getLocalSubmissions, getLocalForms } from '../../utils/github';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [submissionsData, setSubmissionsData] = useState<any[]>(getLocalSubmissions());
  const [forms, setForms] = useState<any[]>(getLocalForms());

  useEffect(() => {
    loadAllSubmissions();
    loadForms();
  }, []);

  const loadForms = async () => {
    const local = getLocalForms();
    try {
      const files = await listDirectory('src/data/forms');
      const formPromises = files
        .filter((file: any) => file.name.endsWith('.json'))
        .map(async (file: any) => {
          try {
            const data = await getFile(file.path);
            return data?.content;
          } catch (e) { return null; }
        });
      const remote = (await Promise.all(formPromises)).filter(Boolean);
      setForms(_ => {
        const merged = [...remote];
        local.forEach(l => {
          if (!merged.some(r => r.formId === l.formId)) merged.push(l);
        });
        return merged;
      });
    } catch (e) {
      console.error('Error loading forms for dashboard:', e);
    }
  };

  const loadAllSubmissions = async () => {
    const local = getLocalSubmissions();
    try {
      const formDirs = await listDirectory('src/data/submissions');
      let remoteSubmissions: any[] = [];
      
      for (const dir of formDirs) {
        if (dir.type === 'dir') {
          const files = await listDirectory(dir.path);
          const subPromises = files
            .filter((f: any) => f.name.endsWith('.json'))
            .map(async (f: any) => {
              try {
                const data = await getFile(f.path);
                return data?.content;
              } catch (e) {
                return null;
              }
            });
          const subs = await Promise.all(subPromises);
          remoteSubmissions = [...remoteSubmissions, ...subs.filter(Boolean)];
        }
      }
      
      setSubmissionsData(_ => {
        const merged = [...remoteSubmissions];
        local.forEach(l => {
          if (!merged.some(r => r.id === l.id)) {
            merged.push(l);
          }
        });
        return merged.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissionsData(local.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    }
  };

  // Filter submissions to only include those that belong to active forms
  const filteredSubmissions = submissionsData.filter(s => 
    forms.some(f => f.formId === s.formId)
  ).map(s => {
    // Dynamically update form name in case it changed in the configuration
    const form = forms.find(f => f.formId === s.formId);
    return {
      ...s,
      formName: form ? form.title : s.formName
    };
  });

  const totalScans = filteredSubmissions.length;
  const submissions = filteredSubmissions.filter(s => s.status === 'submitted').length;
  const cancelled = filteredSubmissions.filter(s => s.status === 'cancelled').length;
  const pending = 0;

  const chartData = [
    { name: 'Mon', count: Math.floor(submissions * 0.1) },
    { name: 'Tue', count: Math.floor(submissions * 0.2) },
    { name: 'Wed', count: Math.floor(submissions * 0.15) },
    { name: 'Thu', count: Math.floor(submissions * 0.25) },
    { name: 'Fri', count: Math.floor(submissions * 0.3) },
    { name: 'Sat', count: 0 },
    { name: 'Sun', count: 0 },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time metrics for your QR automation workflows.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 text-primary self-start">
          <Clock size={18} />
          <span className="text-sm font-medium">Last updated: Just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total QR Scans" 
          value={totalScans} 
          icon={QrCode}
          description="Total attempts to scan QR"
          trend={{ value: "12%", positive: true }}
        />
        <KPICard 
          title="Total Submissions" 
          value={submissions} 
          icon={CheckCircle2}
          description="Completed form submissions"
          trend={{ value: "8%", positive: true }}
        />
        <KPICard 
          title="Total Cancelled" 
          value={cancelled} 
          icon={XCircle}
          description="User aborted the form"
          trend={{ value: "3%", positive: false }}
        />
        <KPICard 
          title="Total Pending" 
          value={pending} 
          icon={Clock}
          description="In-progress forms"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="text-primary" size={20} />
              Weekly Submission Activity
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 4 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.3)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-foreground">
              <BarChart3 size={18} className="text-primary" />
              Forms Performance
            </h3>
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
              {forms.map(form => {
                const formSubmissions = filteredSubmissions.filter(s => s.formId === form.formId).length;
                const percentage = totalScans > 0 ? (formSubmissions / totalScans) * 100 : 0;
                return (
                  <div key={form.formId} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-foreground">
                      <span className="truncate max-w-[150px]">{form.title}</span>
                      <span>{formSubmissions} subs</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users className="text-primary" size={20} />
          Recent Submissions
        </h2>
        <SubmissionsTable data={filteredSubmissions} forms={forms} />
      </div>
    </div>
  );
};
