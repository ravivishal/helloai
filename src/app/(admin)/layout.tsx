"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 shrink-0">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
