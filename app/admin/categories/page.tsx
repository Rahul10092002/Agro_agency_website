"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";

interface Category {
  _id: string;
  name: string;
  nameEnglish: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        toast({
          title: "त्रुटि",
          description: data.message || "श्रेणियां लोड करने में त्रुटि",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "त्रुटि",
        description: "सर्वर से कनेक्ट करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("क्या आप वाकई इस श्रेणी को हटाना चाहते हैं?")) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "सफल",
          description: data.message,
        });
        fetchCategories();
      } else {
        toast({
          title: "त्रुटि",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "त्रुटि",
        description: "श्रेणी हटाने में त्रुटि",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Navigation Section */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium font-hindi mb-3 text-gray-800">
              त्वरित नेवीगेशन
            </h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="/admin/dashboard"
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-hindi text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>🏠</span>
                <span>डैशबोर्ड</span>
              </a>
              <a
                href="/admin/products"
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-hindi text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>📦</span>
                <span>उत्पाद प्रबंधन</span>
              </a>
              <a
                href="/admin/categories"
                className="flex items-center space-x-2 px-3 py-2 bg-primary-green text-white rounded-md text-sm font-hindi"
              >
                <span>🛒</span>
                <span>श्रेणी प्रबंधन</span>
              </a>
              <a
                href="/admin/offers"
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-hindi text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>💰</span>
                <span>ऑफर प्रबंधन</span>
              </a>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-hindi">
                  श्रेणी प्रबंधन
                </h1>
                <p className="mt-2 text-gray-600 font-hindi">
                  उत्पाद श्रेणियों को जोड़ें और प्रबंधित करें
                </p>
              </div>
              <Button
                className="mt-4 sm:mt-0 bg-primary-green hover:bg-secondary-green font-hindi touch-target"
                onClick={() =>
                  (window.location.href = "/admin/categories/add-category")
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                नई श्रेणी जोड़ें
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{category.icon || "📦"}</div>
                      <div>
                        <CardTitle className="font-hindi">
                          {category.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {category.nameEnglish}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {category.productCount || 0} उत्पाद
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-sm text-muted-foreground font-hindi mb-4">
                      {category.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 font-hindi bg-transparent"
                      onClick={() =>
                        (window.location.href = `/admin/categories/edit/${category._id}`)
                      }
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      संपादित करें
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => deleteCategory(category._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 font-hindi">कोई श्रेणी नहीं मिली</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
