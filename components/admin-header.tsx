"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContactInfo } from "@/contexts/shop-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const { contactInfo, loading } = useContactInfo();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { label: "डैशबोर्ड", href: "/admin/dashboard" },
    { label: "उत्पाद", href: "/admin/products" },
    { label: "श्रेणियां", href: "/admin/categories" },
    { label: "ऑफर", href: "/admin/offers" },
    { label: "दुकान सेटिंग", href: "/admin/shop-settings" },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-primary-green font-hindi">
              {contactInfo?.shopName || "दुकान"} - एडमिन पैनल
            </h1>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium font-hindi transition-colors ${
                      isActive
                        ? "bg-primary-green text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-hindi">{user?.name}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-hindi bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              लॉगआउट
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t pt-2 pb-2">
          <nav className="flex space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium font-hindi transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-primary-green text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
