"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminBreadcrumb() {
  const pathname = usePathname();

  const breadcrumbItems = [
    { label: "डैशबोर्ड", href: "/admin/dashboard" },
    { label: "उत्पाद", href: "/admin/products" },
    { label: "श्रेणियां", href: "/admin/categories" },
    { label: "ऑफर", href: "/admin/offers" },
  ];

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
      <nav className="flex space-x-4">
        {breadcrumbItems.map((item, index) => {
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
  );
}
