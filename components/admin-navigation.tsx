"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Package, ShoppingCart, Percent } from "lucide-react";

const adminNavItems = [
  {
    title: "डैशबोर्ड",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "उत्पाद",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "श्रेणियां",
    href: "/admin/categories",
    icon: ShoppingCart,
  },
  {
    title: "ऑफर",
    href: "/admin/offers",
    icon: Percent,
  },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors font-hindi",
              isActive
                ? "bg-primary-green text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
