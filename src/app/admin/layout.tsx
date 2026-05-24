"use client";

import { AuthProvider } from "@/context/AuthContext";
import { AdminNav } from "@/components/admin/AdminNav";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#050505]">
        {!isLoginPage && <AdminNav />}
        <main
          className={
            isLoginPage
              ? ""
              : "max-w-7xl mx-auto px-6 py-8"
          }
        >
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
