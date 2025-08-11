import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface AdminQuickNavProps {
  currentPage: string;
  additionalActions?: Array<{
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }>;
}

export function AdminQuickNav({
  currentPage,
  additionalActions = [],
}: AdminQuickNavProps) {
  const navItems = [
    { label: "डैशबोर्ड", href: "/admin/dashboard", icon: Home },
    { label: "उत्पाद प्रबंधन", href: "/admin/products" },
    { label: "श्रेणी प्रबंधन", href: "/admin/categories" },
    { label: "ऑफर प्रबंधन", href: "/admin/offers" },
  ];

  return (
    <div className="mb-6">
      {/* Quick Navigation Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold font-hindi text-gray-800">
              {currentPage}
            </h2>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500 font-hindi">
              त्वरित नेवीगेशन
            </span>
          </div>

          {additionalActions.length > 0 && (
            <div className="flex items-center space-x-2">
              {additionalActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`px-3 py-1 rounded-md text-sm font-medium font-hindi transition-colors ${
                    action.variant === "primary"
                      ? "bg-primary-green text-white hover:bg-secondary-green"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-hindi text-gray-600 hover:text-gray-800 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
