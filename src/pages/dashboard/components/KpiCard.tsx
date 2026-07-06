import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading?: boolean;
  delay?: string;
}

export function KpiCard({ title, value, icon: Icon, isLoading, delay }: KpiCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-zinc-200/60 bg-white/50 backdrop-blur-sm",
        "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)]",
        "animate-in fade-in slide-in-from-bottom-8 fill-both"
      )}
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 transform translate-x-4 -translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
        <ArrowUpRight className="w-5 h-5 text-blue-500 opacity-50" />
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:shadow-md group-hover:shadow-blue-600/30">
            <Icon className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors duration-500" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-500 tracking-wide uppercase">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-zinc-200/50 rounded animate-pulse mt-2"></div>
          ) : (
            <div className="text-3xl font-bold text-zinc-900 font-mono tracking-tight">
              {value}
            </div>
          )}
        </div>
      </CardContent>
      
      <div className="absolute bottom-0 left-0 h-1 bg-blue-600 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
    </Card>
  );
}
