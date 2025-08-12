"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Eye,
  Percent,
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalViews: number;
  activeOffers: number;
}

interface Product {
  _id: string;
  name: string;
  nameEnglish: string;
  price: number;
  unit: string;
  views: number;
  stockQuantity?: number;
  // Offer-related fields
  hasActiveOffer?: boolean;
  effectivePrice?: number;
  originalPrice?: number;
  appliedOffer?: {
    _id: string;
    title: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mostViewedProducts, setMostViewedProducts] = useState<Product[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setMostViewedProducts(data.mostViewedProducts);
        setLowStockAlerts(data.lowStockAlerts);
      } else {
        toast({
          title: "त्रुटि",
          description: data.message || "डैशबोर्ड डेटा लोड करने में त्रुटि",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "त्रुटि",
        description: "सर्वर से कनेक्ट करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

  if (!stats) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="text-center py-12">
            <p className="text-gray-500 font-hindi">
              डैशबोर्ड डेटा लोड नहीं हो सका
            </p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-hindi">
              डैशबोर्ड
            </h1>
            <p className="mt-2 text-gray-600 font-hindi">
              आपकी दुकान की जानकारी और आंकड़े
            </p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-hindi">
                  कुल उत्पाद
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground font-hindi">
                  {stats.inStockProducts} उपलब्ध, {stats.outOfStockProducts}{" "}
                  समाप्त
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-hindi">
                  कम स्टॉक
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {stats.lowStockProducts}
                </div>
                <p className="text-xs text-muted-foreground font-hindi">
                  10 से कम मात्रा वाले उत्पाद
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-hindi">
                  फीचर्ड उत्पाद
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {stats.featuredProducts}
                </div>
                <p className="text-xs text-muted-foreground font-hindi">
                  होम पेज पर दिखाए जाने वाले
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-hindi">
                  कुल व्यू
                </CardTitle>
                <Eye className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {stats.totalViews}
                </div>
                <p className="text-xs text-muted-foreground font-hindi">
                  सभी उत्पादों के कुल व्यू
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-hindi">
                  सक्रिय ऑफर
                </CardTitle>
                <Percent className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">
                  {stats.activeOffers}
                </div>
                <p className="text-xs text-muted-foreground font-hindi">
                  चालू छूट और ऑफर
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-hindi">
                  श्रेणियां
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-500">
                  {stats.totalCategories}
                </div>
                <p className="text-xs text-muted-foreground font-hindi">
                  उत्पाद श्रेणियों की संख्या
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Most Viewed Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">
                  सबसे ज्यादा देखे गए उत्पाद
                </CardTitle>
                <CardDescription className="font-hindi">
                  लोकप्रिय उत्पादों की सूची
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostViewedProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium font-hindi text-sm">
                            {product.name}
                          </p>
                          <div className="text-xs text-muted-foreground font-hindi">
                            {product.hasActiveOffer ? (
                              <div className="flex items-center space-x-1">
                                <span className="text-primary-green font-semibold">
                                  ₹{product.effectivePrice}
                                </span>
                                <span className="line-through text-gray-400">
                                  ₹{product.originalPrice || product.price}
                                </span>
                                <span className="text-xs">{product.unit}</span>
                              </div>
                            ) : (
                              <span>
                                ₹{product.price} {product.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-500">
                          {product.views}
                        </p>
                        <p className="text-xs text-muted-foreground font-hindi">
                          व्यू
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">कम स्टॉक अलर्ट</CardTitle>
                <CardDescription className="font-hindi">
                  तुरंत स्टॉक भरने की जरूरत
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockAlerts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium font-hindi text-sm">
                          {product.name}
                        </p>
                        <div className="text-xs text-muted-foreground font-hindi">
                          {product.hasActiveOffer ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-primary-green font-semibold">
                                ₹{product.effectivePrice}
                              </span>
                              <span className="line-through text-gray-400">
                                ₹{product.originalPrice || product.price}
                              </span>
                              <span className="text-xs">{product.unit}</span>
                            </div>
                          ) : (
                            <span>
                              ₹{product.price} {product.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-500">
                          {product.stockQuantity}
                        </p>
                        <p className="text-xs text-muted-foreground font-hindi">
                          बचे हुए
                        </p>
                      </div>
                    </div>
                  ))}
                  {lowStockAlerts.length === 0 && (
                    <p className="text-sm text-muted-foreground font-hindi text-center">
                      कोई कम स्टॉक अलर्ट नहीं
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">त्वरित कार्य</CardTitle>
                <CardDescription className="font-hindi">
                  सामान्य कार्यों के लिए शॉर्टकट
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a
                    href="/admin/products"
                    className="p-4 border rounded-lg hover:bg-gray-50 text-center transition-colors touch-target"
                  >
                    <Package className="h-8 w-8 mx-auto mb-2 text-primary-green" />
                    <p className="font-hindi text-sm font-medium">
                      उत्पाद प्रबंधन
                    </p>
                  </a>
                  <a
                    href="/admin/categories"
                    className="p-4 border rounded-lg hover:bg-gray-50 text-center transition-colors touch-target"
                  >
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="font-hindi text-sm font-medium">
                      श्रेणी प्रबंधन
                    </p>
                  </a>
                  <a
                    href="/admin/offers"
                    className="p-4 border rounded-lg hover:bg-gray-50 text-center transition-colors touch-target"
                  >
                    <Percent className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="font-hindi text-sm font-medium">
                      ऑफर प्रबंधन
                    </p>
                  </a>
                  <a
                    href="/admin/analytics"
                    className="p-4 border rounded-lg hover:bg-gray-50 text-center transition-colors touch-target"
                  >
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="font-hindi text-sm font-medium">
                      विस्तृत रिपोर्ट
                    </p>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
