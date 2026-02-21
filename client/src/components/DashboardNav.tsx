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
    <div className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-40" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8" }}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl" style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }} data-testid="button-mobile-menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
          <SheetHeader className="text-left">
            <SheetTitle style={{ color: "#0D566C" }}>{title}</SheetTitle>
            {userName && (
              <p className="text-sm" style={{ color: "#8A8A8A" }}>{userName} • {userRole}</p>
            )}
          </SheetHeader>
          <nav className="flex flex-col gap-1 mt-6 flex-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`justify-start gap-3 h-12 rounded-xl ${
                  activeTab === tab.id 
                    ? "font-semibold" 
                    : ""
                }`}
                style={activeTab === tab.id 
                  ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" }
                  : { color: "#4A4A4A" }
                }
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
            <div className="pt-4" style={{ borderTop: "1px solid #E8E8E8" }}>
              <Button 
                variant="ghost"
                className="w-full justify-start gap-3 h-12 rounded-xl"
                style={{ color: "#FF6B5C" }}
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
        <span className="font-medium" style={{ color: "#0D566C" }}>{activeTabInfo?.label || title}</span>
        {activeTabInfo?.badge}
      </div>
      <div className="w-10" />
    </div>
  );
}
