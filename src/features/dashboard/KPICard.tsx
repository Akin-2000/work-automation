import React from 'react';
import { cn } from '../../utils/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className 
}) => {
  return (
    <div className={cn("bg-card p-6 rounded-xl border border-border shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon size={20} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className={cn(
            "text-xs font-medium mt-2 flex items-center gap-1",
            trend.positive ? "text-green-600" : "text-destructive"
          )}>
            <span>{trend.positive ? '↑' : '↓'} {trend.value}</span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
};
