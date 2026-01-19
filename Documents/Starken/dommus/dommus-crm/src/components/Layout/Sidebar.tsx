import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  Calendar,
  Settings,
  Mail,
  Menu,
  X,
  HeadsetIcon,
  Users,
  FolderKanban,
  FileText,
  Package,
  Instagram
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DommusLogo } from "@/components/DommusLogo";
import { useUser } from '@/hooks/auth/useUser';
import { useUserRole } from '@/hooks/auth/useUserRole';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => (
  <Link to={href} className="w-full">
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 text-sidebar-foreground my-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

export function Sidebar() {
  const location = useLocation();
  const { user } = useUser();
  const { role, loading: roleLoading } = useUserRole();
  const [isOpen, setIsOpen] = React.useState(false);
  const canAccessSettings = role === 'admin';

  const routes = [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboard size={20} className={location.pathname === "/" ? "text-primary" : ""} />,
    },
    {
      label: "Leads",
      href: "/leads",
      icon: <UserCircle size={20} className={location.pathname === "/leads" ? "text-primary" : ""} />,
    },
    {
      label: "Clientes",
      href: "/clients",
      icon: <Users size={20} className={location.pathname === "/clients" ? "text-primary" : ""} />,
    },
    {
      label: "Projetos",
      href: "/projects",
      icon: <FolderKanban size={20} className={location.pathname === "/projects" ? "text-primary" : ""} />,
    },
    {
      label: "Orcamentos",
      href: "/quotes",
      icon: <FileText size={20} className={location.pathname === "/quotes" ? "text-primary" : ""} />,
    },
    {
      label: "Catalogo",
      href: "/catalog",
      icon: <Package size={20} className={location.pathname === "/catalog" ? "text-primary" : ""} />,
    },
    {
      label: "Tarefas",
      href: "/tasks",
      icon: <Calendar size={20} className={location.pathname === "/tasks" ? "text-primary" : ""} />,
    },
    {
      label: "Instagram",
      href: "/instagram",
      icon: <Instagram size={20} className={location.pathname === "/instagram" ? "text-primary" : ""} />,
    },
    ...(role === 'admin' || role === 'manager' ? [{
      label: "Equipe",
      href: "/agents",
      icon: <HeadsetIcon size={20} className={location.pathname === "/agents" ? "text-primary" : ""} />,
    }] : []),
    {
      label: "E-mails",
      href: "/mailing",
      icon: <Mail size={20} className={location.pathname === "/mailing" ? "text-primary" : ""} />,
    },
    ...(canAccessSettings ? [{
      label: "Config",
      href: "/settings",
      icon: <Settings size={20} className={location.pathname === "/settings" ? "text-primary" : ""} />,
    }] : []),
  ];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu size={20} className="text-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r border-sidebar-border">
          <div className="flex flex-col h-full p-4">
            <div className="flex flex-col items-center justify-between py-4 border-b border-sidebar-border mb-4">
              <div className="w-44 p-2 bg-transparent rounded-md">
                <DommusLogo className="w-full h-auto" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="absolute right-4 top-4 hover:bg-sidebar-accent">
                <X size={20} className="text-sidebar-foreground" />
              </Button>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto">
              {routes.map((route) => (
                <NavItem
                  key={route.href}
                  icon={route.icon}
                  label={route.label}
                  href={route.href}
                  active={location.pathname === route.href}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:flex flex-col h-screen w-64 border-r border-sidebar-border bg-sidebar shadow-sm">
        <div className="flex flex-col items-center py-4 border-b border-sidebar-border">
          <div className="w-44 p-2 bg-transparent rounded-md">
            <DommusLogo className="w-full h-auto" />
          </div>
        </div>
        <div className="flex flex-col gap-1 p-4 mt-2 overflow-y-auto flex-1">
          {routes.map((route) => (
            <NavItem
              key={route.href}
              icon={route.icon}
              label={route.label}
              href={route.href}
              active={location.pathname === route.href}
            />
          ))}
        </div>
      </div>
    </>
  );
}
