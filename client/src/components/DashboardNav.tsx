import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface NavTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface DashboardMobileNavProps {
  tabs: NavTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  title?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function DashboardMobileNav({ 
  tabs, 
  activeTab, 
  onTabChange, 
  title = "Menu",
  userName,
  userRole,
  onLogout
}: DashboardMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0" data-testid="button-mobile-menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle>{title}</SheetTitle>
            {userName && (
              <p className="text-sm text-muted-foreground">{userName} • {userRole}</p>
            )}
          </SheetHeader>
          <nav className="flex flex-col gap-1 mt-6 flex-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`justify-start gap-3 h-12 ${
                  activeTab === tab.id 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => handleTabClick(tab.id)}
                data-testid={`nav-mobile-${tab.id}`}
              >
                {tab.icon}
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge}
              </Button>
            ))}
          </nav>
          {onLogout && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button 
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                data-testid="nav-mobile-logout"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        {activeTabInfo?.icon}
        <span className="font-medium text-slate-900 dark:text-white">{activeTabInfo?.label || title}</span>
        {activeTabInfo?.badge}
      </div>
      <div className="w-10" />
    </div>
  );
}
