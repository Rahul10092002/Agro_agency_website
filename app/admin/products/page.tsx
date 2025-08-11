"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
    limit: 10,
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

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination((prev) => ({ ...prev, limit: parseInt(newLimit), page: 1 }));
  };

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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground font-hindi">
                      कुल उत्पाद
                    </p>
                    <p className="text-2xl font-bold">{pagination.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Badge className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground font-hindi">
                      स्टॉक में
                    </p>
                    <p className="text-2xl font-bold">
                      {products.filter((p) => p.inStock).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground font-hindi">
                      कम स्टॉक
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        products.filter(
                          (p) => p.stockQuantity < 10 && p.inStock
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground font-hindi">
                      समाप्त
                    </p>
                    <p className="text-2xl font-bold">
                      {products.filter((p) => !p.inStock).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
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
                <div className="flex gap-4">
                  <div>
                    <label className="text-sm font-medium font-hindi mb-1 block">
                      श्रेणी
                    </label>
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
                  <div>
                    <label className="text-sm font-medium font-hindi mb-1 block">
                      प्रति पृष्ठ
                    </label>
                    <Select
                      value={pagination.limit.toString()}
                      onValueChange={handleLimitChange}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">छवि</TableHead>
                      <TableHead className="font-hindi">नाम</TableHead>
                      <TableHead className="font-hindi">श्रेणी</TableHead>
                      <TableHead className="font-hindi">मूल्य</TableHead>
                      <TableHead className="font-hindi">स्टॉक</TableHead>
                      <TableHead className="font-hindi">स्थिति</TableHead>
                      <TableHead className="font-hindi">व्यू</TableHead>
                      <TableHead className="font-hindi text-right">
                        कार्य
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <LoadingSpinner />
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 font-hindi text-gray-500"
                        >
                          कोई उत्पाद नहीं मिला
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow
                          key={product._id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium font-hindi line-clamp-2">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.nameEnglish}
                              </p>
                              <div className="flex gap-1">
                                {product.featured && (
                                  <Badge className="bg-primary-green text-xs">
                                    फीचर्ड
                                  </Badge>
                                )}
                                {product.hasActiveOffer && (
                                  <Badge className="bg-orange-500 text-white text-xs">
                                    ऑफर
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-hindi">
                              {getCategoryName(product.categoryId)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {product.hasActiveOffer ? (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-primary-green">
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
                                </>
                              ) : (
                                <span className="font-bold text-primary-green">
                                  ₹{product.price}
                                </span>
                              )}
                              <p className="text-xs text-muted-foreground font-hindi">
                                {product.unit}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {product.stockQuantity}
                              </p>
                              {product.stockQuantity < 10 &&
                                product.inStock && (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-100 text-orange-800 text-xs"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    कम स्टॉक
                                  </Badge>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.inStock ? (
                              <Badge className="bg-green-100 text-green-800">
                                स्टॉक में
                              </Badge>
                            ) : (
                              <Badge variant="destructive">समाप्त</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Eye className="h-3 w-3 mr-1" />
                              {product.views}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-hindi"
                                onClick={() =>
                                  (window.location.href = `/admin/products/edit/${product._id}`)
                                }
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                संपादित करें
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => deleteProduct(product._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground font-hindi">
                कुल {pagination.total} उत्पादों में से{" "}
                {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                दिखाए जा रहे हैं
              </div>

              <div className="flex items-center space-x-2">
                {/* First page button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(1)}
                  className="font-hindi"
                >
                  पहला
                </Button>

                {/* Previous page button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const currentPage = pagination.page;
                    const totalPages = pagination.pages;
                    const delta = 2; // Number of pages to show on each side of current page
                    const range = [];
                    const rangeWithDots = [];

                    // Calculate range of pages to show
                    for (
                      let i = Math.max(2, currentPage - delta);
                      i <= Math.min(totalPages - 1, currentPage + delta);
                      i++
                    ) {
                      range.push(i);
                    }

                    // Add first page
                    if (currentPage - delta > 2) {
                      rangeWithDots.push(1, "...");
                    } else {
                      rangeWithDots.push(1);
                    }

                    // Add middle pages
                    rangeWithDots.push(...range);

                    // Add last page
                    if (currentPage + delta < totalPages - 1) {
                      rangeWithDots.push("...", totalPages);
                    } else if (totalPages > 1) {
                      rangeWithDots.push(totalPages);
                    }

                    return rangeWithDots.map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={index}
                            className="px-2 py-1 text-muted-foreground"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <Button
                          key={index}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className={
                            page === currentPage ? "bg-primary-green" : ""
                          }
                        >
                          {page}
                        </Button>
                      );
                    });
                  })()}
                </div>

                {/* Next page button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.pages)}
                  className="font-hindi"
                >
                  अंतिम
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
