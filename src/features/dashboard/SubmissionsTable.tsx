import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Download
} from 'lucide-react';
import { cn } from '../../utils/utils';
import * as XLSX from 'xlsx';

export interface Submission {
  id: string;
  formId: string;
  userName: string;
  formName: string;
  status: string;
  timestamp: string;
  device: string;
  location: string;
  data?: Record<string, any>;
}

interface SubmissionsTableProps {
  data: Submission[];
  forms: any[];
}

const columnHelper = createColumnHelper<Submission>();

const baseColumns = [
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
        info.getValue() === 'submitted' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
        info.getValue() === 'cancelled' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      )}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('timestamp', {
    header: 'Date',
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
];

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ data, forms }) => {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [selectedFormId, setSelectedFormId] = React.useState('all');

  const filteredData = React.useMemo(() => {
    if (selectedFormId === 'all') return data;
    return data.filter(sub => sub.formId === selectedFormId);
  }, [data, selectedFormId]);

  const dynamicColumns = React.useMemo(() => {
    let extraFields: any[] = [];

    if (selectedFormId === 'all') {
      // Aggregate all unique fields from all forms
      const fieldMap = new Map<string, any>();
      forms.forEach(form => {
        if (form.fields) {
          form.fields.forEach((field: any) => {
            if (!fieldMap.has(field.id)) {
              fieldMap.set(field.id, field);
            }
          });
        }
      });
      extraFields = Array.from(fieldMap.values());
    } else {
      // Get fields only for the selected form
      const selectedForm = forms.find(f => f.formId === selectedFormId);
      if (selectedForm && selectedForm.fields) {
        extraFields = selectedForm.fields;
      }
    }

    const extraColumns = extraFields.map((field: any) => 
      columnHelper.accessor(row => row.data ? row.data[field.id] : '-', {
        id: field.id,
        header: field.label,
        cell: info => {
          const val = info.getValue();
          if (typeof val === 'boolean') {
            return val ? 'Yes' : 'No';
          }
          if (Array.isArray(val)) {
            return val.join(', ');
          }
          return val || '-';
        }
      })
    );

    return [...baseColumns, ...extraColumns];
  }, [selectedFormId, forms]);


  const table = useReactTable({
    data: filteredData,
    columns: dynamicColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting as any,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const exportToExcel = () => {
    // Generate headers from current dynamic columns
    const exportData = filteredData.map(sub => {
      const flattened: any = {};
      
      dynamicColumns.forEach((col: any) => {
        // Handle standard columns
        if (typeof col.header === 'string') {
          if (col.header === 'Status') {
            flattened[col.header] = sub.status;
          } else if (col.header === 'Date') {
            flattened[col.header] = new Date(sub.timestamp).toLocaleString();
          } else {
            // It's an extra custom dynamic column
            const val = sub.data ? sub.data[col.id] : null;
            if (val !== null && val !== undefined) {
              flattened[col.header] = Array.isArray(val) ? val.join(', ') : val;
            } else {
              flattened[col.header] = '-';
            }
          }
        }
      });
      
      return flattened;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    const sheetName = selectedFormId === 'all' ? 'All_Submissions' : forms.find(f => f.formId === selectedFormId)?.title?.substring(0, 31) || 'Submissions';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `submissions_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
            <input
              placeholder="Search submissions..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="flex h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Forms</option>
            {forms.map(form => (
              <option key={form.formId} value={form.formId}>
                {form.title}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Download size={18} />
          <span>Export to Excel</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-border rounded-md hover:bg-accent disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
