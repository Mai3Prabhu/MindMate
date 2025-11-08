import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarIconProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarIcon({
  icon,
  label,
  href,
  isActive = false,
  onClick,
  className,
}: SidebarIconProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            onClick={onClick}
            className={cn(
              'flex items-center justify-center p-3 rounded-xl transition-all duration-200 group',
              'text-light-text/70 dark:text-dark-text/70',
              'hover:bg-brand/10 hover:text-brand dark:hover:bg-brand/20',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-light-bg dark:focus:ring-offset-dark-bg',
              isActive ? 'bg-brand/10 text-brand dark:bg-brand/20' : '',
              className
            )}
          >
            <span className="text-2xl">{icon}</span>
            <span className="sr-only">{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-dark-card text-white">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden md:flex flex-col items-center py-6 px-2 space-y-4 bg-light-card dark:bg-dark-card/50 rounded-2xl shadow-sm border border-light-border dark:border-dark-border">
      {children}
    </div>
  );
}
