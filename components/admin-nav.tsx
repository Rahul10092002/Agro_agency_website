"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Package, ShoppingCart, Percent, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const adminNavItems = [
  {
    title: "डैशबोर्ड",
    href: "/admin/dashboard",
    icon: Home,
    description: "मुख्य डैशबोर्ड",
  },
  {
    title: "उत्पाद",
    href: "/admin/products",
    icon: Package,
    description: "उत्पाद प्रबंधन",
  },
  {
    title: "श्रेणियां",
    href: "/admin/categories",
    icon: ShoppingCart,
    description: "श्रेणी प्रबंधन",
  },
  {
    title: "ऑफर",
    href: "/admin/offers",
    icon: Percent,
    description: "ऑफर प्रबंधन",
  },
];

interface AdminNavProps {
  className?: string;
}

export function AdminNav({ className }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center space-x-1", className)}>
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

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-hindi">एडमिन नेवीगेशन</h2>
          </div>

          <div className="flex flex-col space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors font-hindi",
                    isActive
                      ? "bg-primary-green text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div>{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
