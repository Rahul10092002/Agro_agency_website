"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/loading-spinner";

interface Product {
  _id: string;
  name: string;
  nameEnglish: string;
  price: number;
  originalPrice?: number;
  unit: string;
  categoryId: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  views: number;
  // Offer-related fields
  hasActiveOffer?: boolean;
  effectivePrice?: number;
  appliedOffer?: {
    _id: string;
    title: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountedPrice: number;
    savingsAmount: number;
  };
}

interface Category {
  _id: string;
  name: string;
  nameEnglish: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setPagination(data.pagination);
      } else {
        toast({
          title: "त्रुटि",
          description: data.message || "उत्पाद लोड करने में त्रुटि",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "त्रुटि",
        description: "सर्वर से कनेक्ट करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("क्या आप वाकई इस उत्पाद को हटाना चाहते हैं?")) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "सफल",
          description: data.message,
        });
        fetchProducts();
      } else {
        toast({
          title: "त्रुटि",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "त्रुटि",
        description: "उत्पाद हटाने में त्रुटि",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, pagination.page]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat._id === categoryId)?.name || "अज्ञात";
  };

  if (loading && products.length === 0) {
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
                className="flex items-center space-x-2 px-3 py-2 bg-primary-green text-white rounded-md text-sm font-hindi"
              >
                <span>📦</span>
                <span>उत्पाद प्रबंधन</span>
              </a>
              <a
                href="/admin/categories"
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-hindi text-gray-600 hover:text-gray-800 transition-colors"
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
                  उत्पाद प्रबंधन
                </h1>
                <p className="mt-2 text-gray-600 font-hindi">
                  अपने उत्पादों को जोड़ें, संपादित करें और प्रबंधित करें
                </p>
              </div>
              <Button
                className="mt-4 sm:mt-0 bg-primary-green hover:bg-secondary-green font-hindi touch-target"
                onClick={() => (window.location.href = "/admin/products/add")}
              >
                <Plus className="h-4 w-4 mr-2" />
                नया उत्पाद जोड़ें
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="उत्पाद खोजें..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-hindi"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md font-hindi"
                >
                  <option value="all">सभी श्रेणियां</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-primary-green">
                      फीचर्ड
                    </Badge>
                  )}
                  {product.hasActiveOffer && (
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                      {product.featured ? "ऑफर" : "ऑफर"}
                    </Badge>
                  )}
                  {product.featured && product.hasActiveOffer && (
                    <div className="absolute top-2 left-2 space-y-1">
                      <Badge className="bg-primary-green block">फीचर्ड</Badge>
                      <Badge className="bg-orange-500 text-white block">
                        ऑफर
                      </Badge>
                    </div>
                  )}
                  {!product.inStock && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      समाप्त
                    </Badge>
                  )}
                  {product.stockQuantity < 10 && product.inStock && (
                    <Badge
                      variant="outline"
                      className="absolute top-2 right-2 bg-orange-100 text-orange-800"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      कम स्टॉक
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold font-hindi text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-hindi mb-2">
                    {getCategoryName(product.categoryId)}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {product.hasActiveOffer ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-primary-green">
                              ₹{product.effectivePrice}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.originalPrice || product.price}
                            </span>
                          </div>
                          {product.appliedOffer && (
                            <div className="text-xs text-orange-600 font-medium">
                              {product.appliedOffer.discountType ===
                              "percentage"
                                ? `${product.appliedOffer.discountValue}% छूट`
                                : `₹${product.appliedOffer.discountValue} छूट`}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground font-hindi">
                            {product.unit}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-lg font-bold text-primary-green">
                            ₹{product.price}
                          </span>
                          <p className="text-xs text-muted-foreground font-hindi">
                            {product.unit}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        स्टॉक: {product.stockQuantity}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Eye className="h-3 w-3 mr-1" />
                        {product.views} व्यू
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 font-hindi bg-transparent"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      संपादित करें
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => deleteProduct(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 font-hindi">कोई उत्पाद नहीं मिला</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                पिछला
              </Button>
              <span className="text-sm text-muted-foreground font-hindi">
                पृष्ठ {pagination.page} का {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                अगला
              </Button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
