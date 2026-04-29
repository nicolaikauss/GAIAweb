import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ShineBorder } from "@/components/ui/shine-border";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  count?: number;
  href: string;
  featured?: boolean;
}

export function DashboardCard({ title, description, icon: Icon, count, href, featured = false }: DashboardCardProps) {
  if (featured) {
    return (
      <Link to={href} className="group">
        <ShineBorder
          borderWidth={2}
          className="h-full bg-white/80 backdrop-blur-sm"
          color={["#3B82F6", "#8B5CF6", "#06B6D4"]}
        >
          <div className="flex flex-col h-full p-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Icon className="h-8 w-8" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                {title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {description}
              </p>
            </div>
            
            {/* Count */}
            {count !== undefined && (
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {count}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  {count === 1 ? 'item' : 'items'}
                </div>
              </div>
            )}
            
            {/* Featured indicator */}
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                Featured Collection
              </div>
            </div>
          </div>
        </ShineBorder>
      </Link>
    );
  }

  return (
    <Link to={href} className="group">
      <div className={`
        bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 h-full
        hover:bg-card/80 hover:border-accent hover:-translate-y-1
        transition-all duration-300 ease-out
      `}>
        <div className="flex flex-col h-full items-center justify-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-primary/10 text-primary group-hover:bg-accent/20 group-hover:text-accent transition-all duration-300">
            <Icon className="h-10 w-10" />
          </div>
          
          {/* Title */}
          <h3 className="text-3xl font-bold text-foreground group-hover:text-accent transition-colors">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
