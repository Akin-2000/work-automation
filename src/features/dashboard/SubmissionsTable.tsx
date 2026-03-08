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
  ArrowUpDown,
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
  columnHelper.accessor('userName', {
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User Name
        <ArrowUpDown size={14} />
      </button>
    ),
    cell: info => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor('formName', {
    header: 'Form Name',
  }),
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
  columnHelper.accessor('device', {
    header: 'Device',
  }),
  columnHelper.accessor('location', {
    header: 'Location',
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
    if (selectedFormId === 'all') return baseColumns;
    
    const selectedForm = forms.find(f => f.formId === selectedFormId);
    if (!selectedForm || !selectedForm.fields) return baseColumns;

    // Filter base columns to retain only essential ones
    const essentialBaseColumns = baseColumns.filter(col => {
      // @ts-ignore
      const header = col.header;
      if (typeof header === 'string') {
        return ['Status', 'Date'].includes(header);
      }
      return true; // We keep 'userName' as its header is a function (sorting button)
    });

    const extraColumns = selectedForm.fields.map((field: any) => 
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

    return [...essentialBaseColumns, ...extraColumns];
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
    // Flatten data for Excel export
    const exportData = data.map(sub => {
      const flattened: any = {
        'Submission ID': sub.id,
        'Form ID': sub.formId,
        'Form Name': sub.formName,
        'User': sub.userName,
        'Status': sub.status,
        'Date': new Date(sub.timestamp).toLocaleString(),
        'Device': sub.device,
        'Location': sub.location,
      };
      
      // Add dynamic form fields to the export
      if (sub.data && typeof sub.data === 'object') {
        Object.keys(sub.data).forEach(key => {
          const val = sub.data![key];
          flattened[`Field: ${key}`] = Array.isArray(val) ? val.join(', ') : val;
        });
      }
      
      return flattened;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submissions");
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
