"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Course Content",
      href: "/admin",
      icon: BookOpen,
    },
    {
      title: "Manage Users",
      href: "/admin/users",
      icon: Users,
    },
  ];

  return (
    <div className="flex flex-col space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-primary">Admin Dashboard</h1>
        </div>
      </div>
      
      <nav className="flex gap-2 border-b border-border pb-px">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
                isActive 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminNav;