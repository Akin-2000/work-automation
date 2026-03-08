import React from 'react';
import { Ticket, Calendar, User, Hash, Clock, History } from 'lucide-react';
import { cn } from '../../utils/utils';

const bookingLogs = [
  { id: 'BK-101', movie: 'Dune: Part Two', user: 'Admin User', date: '2024-03-08', status: 'Success' },
  { id: 'BK-102', movie: 'Oppenheimer', user: 'John Employee', date: '2024-03-07', status: 'Success' },
  { id: 'BK-103', movie: 'Poor Things', user: 'Jane Doe', date: '2024-03-06', status: 'Failed' },
];

export const BookMyShow: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">BookMyShow Integration</h1>
        <p className="text-muted-foreground mt-1">View booking logs, ticket details, and user integration status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-2">
              <History size={18} className="text-primary" />
              <h2 className="font-semibold">Recent Booking Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/10 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3">Booking ID</th>
                    <th className="px-6 py-3">Movie / Event</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookingLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{log.id}</td>
                      <td className="px-6 py-4 font-medium">{log.movie}</td>
                      <td className="px-6 py-4">{log.user}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          log.status === 'Success' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm border-l-4 border-l-primary">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Ticket size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Active Tickets</h3>
                  <p className="text-xs text-muted-foreground">Valid for today</p>
                </div>
              </div>
              <div className="text-3xl font-bold">128</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Managed Users</h3>
                  <p className="text-xs text-muted-foreground">Integration active</p>
                </div>
              </div>
              <div className="text-3xl font-bold">45</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
            <div className="p-6 bg-primary text-primary-foreground">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Latest Ticket</span>
                <Ticket size={20} />
              </div>
              <h3 className="text-xl font-bold">Dune: Part Two</h3>
              <p className="text-sm opacity-80">IMAX 4K - Screen 4</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} />
                  <span>Date</span>
                </div>
                <span className="font-semibold">08 March, 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} />
                  <span>Time</span>
                </div>
                <span className="font-semibold">07:30 PM</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash size={16} />
                  <span>Seats</span>
                </div>
                <span className="font-semibold">A12, A13, A14</span>
              </div>
              <div className="pt-4 border-t border-dashed border-border flex justify-center">
                <div className="p-3 bg-muted rounded-lg border border-border">
                  <div className="w-32 h-32 bg-white flex items-center justify-center border border-border">
                    <span className="text-[10px] text-muted-foreground">QR CODE PLACEHOLDER</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
