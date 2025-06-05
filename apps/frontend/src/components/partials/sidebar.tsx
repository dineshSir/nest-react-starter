"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BookDashed,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mainNavItems = [
    {
      title: t("Dashboard"),
      url: "/dashboard",
      icon: BookDashed,
      isActive: pathname === "/admin-dashboard",
    },
    
  ];

  const operationsItems = [
    {
      title: t("Dashboard"),
      url: "/dashboard",
      icon: BookDashed,
      isActive: pathname === "/admin-dashboard",
    },
  ];

  const settingsItems = [
    {
      title: t("Dashboard"),
      url: "/dashboard",
      icon: BookDashed,
      isActive: pathname === "/admin-dashboard",
    },
  ];

  const NavItem = ({
    item,
    onClick,
    isSubItem = false,
  }: {
    item: any;
    onClick: () => void;
    isSubItem?: boolean;
  }) => (
    <Link
      to={item.url}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-lg font-medium transition-all duration-200 hover:bg-white/10",
        isSubItem ? "ml-6 py-2" : "",
        item.isActive
          ? "bg-white/20 text-white shadow-sm"
          : "text-white/80 hover:text-white",
        isCollapsed && !isSubItem ? "justify-center px-2" : ""
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 flex-shrink-0",
          isCollapsed && !isSubItem ? "h-5 w-5" : ""
        )}
      />
      {(!isCollapsed || isSubItem) && <span>{item.title}</span>}
    </Link>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) =>
    !isCollapsed && (
      <div className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
        {children}
      </div>
    );

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {!isCollapsed && (
        <div className="flex items-center justify-center p-6 border-b border-white/10">
          <div className="bg-white rounded-lg p-3 shadow-lg w-full max-w-[200px]">
            <img
              src="/logo (1) 1.png"
              alt="Town Development Fund Logo"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div>
          <SectionLabel>{t("Main Navigation")}</SectionLabel>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>{t("Operations")}</SectionLabel>
          <div className="space-y-1">
            {operationsItems.map((item) => (
              <NavItem
                key={item.title}
                item={item}
                onClick={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>{t("Configuration")}</SectionLabel>
          <div className="space-y-1">
            {!isCollapsed ? (
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/10",
                      settingsOpen ||
                        settingsItems.some((item) => item.isActive)
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3 text-lg font-medium">
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span>{t("Settings")}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        settingsOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {settingsItems.map((item) => (
                    <NavItem
                      key={item.title}
                      item={item}
                      onClick={() => setIsOpen(false)}
                      isSubItem
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                <NavItem
                  item={{
                    title: t("Settings"),
                    url: "#",
                    icon: Settings,
                    isActive: settingsItems.some((item) => item.isActive),
                  }}
                  onClick={() => {}}
                />
              </>
            )}
          </div>
        </div>
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/60 text-center">
            Town Development Fund
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-gradient-to-b from-primary to-primary border-r-0"
        >
          <div className="h-full">{renderNavContent()}</div>
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "hidden lg:flex flex-col h-screen bg-gradient-to-b from-primary  transition-all duration-300 relative shadow-xl",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {renderNavContent()}

        <Button
          onClick={toggleCollapse}
          size="sm"
          variant="secondary"
          className="absolute bg-secondary text-black -right-3 top-5 h-6 w-6 rounded-full p-0 shadow-lg hover:shadow-xl hover:bg-secondary/80 transition-all duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="lg:hidden fixed top-3 left-4 z-50 h-10 w-10 p-0 bg-secondary text-white shadow-lg"
      >
        <Menu className="size-6 " />
      </Button>
    </>
  );
};

export default AdminSidebar;
