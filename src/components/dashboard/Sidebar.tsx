"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Phone, Settings, CreditCard, BookOpen, Calendar, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  businessName?: string;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Calls",
    href: "/calls",
    icon: Phone,
  },
  {
    label: "Knowledge Base",
    href: "/knowledge-base",
    icon: BookOpen,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
];

export function Sidebar({ businessName }: SidebarProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((user) => {
        if (user.role === "admin" || user.role === "superadmin") {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full flex-col bg-white border-r">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">hello.ai</h1>
      </div>

      <Separator />

      {/* Business Name */}
      {businessName && (
        <>
          <div className="p-6">
            <p className="text-sm text-gray-500">Business</p>
            <p className="font-semibold text-gray-900 mt-1">{businessName}</p>
          </div>
          <Separator />
        </>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin Link */}
      {isAdmin && (
        <>
          <Separator />
          <div className="p-4">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <Shield className="h-5 w-5" />
              Admin Panel
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
