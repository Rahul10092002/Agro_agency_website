"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Percent, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  nameEnglish: string;
  price: number;
  images: string[];
}

interface Category {
  _id: string;
  name: string;
  nameEnglish: string;
}

interface Offer {
  _id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  productIds: string[];
  categoryIds: string[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  applicableToAll: boolean;
  products: Product[];
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/offers?${params}`);
      const data = await response.json();

      if (data.success) {
        setOffers(data.offers);
        setPagination(data.pagination);
      } else {
        toast({
          title: "त्रुटि",
          description: data.message || "ऑफर लोड करने में त्रुटि",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "त्रुटि",
        description: "सर्वर से कनेक्ट करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (offerId: string) => {
    if (!confirm("क्या आप वाकई इस ऑफर को हटाना चाहते हैं?")) return;

    try {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "सफल",
          description: data.message,
        });
        fetchOffers();
      } else {
        toast({
          title: "त्रुटि",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast({
        title: "त्रुटि",
        description: "ऑफर हटाने में त्रुटि",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [searchTerm, statusFilter, pagination.page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("hi-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOfferActive = (offer: Offer) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);
    return (
      offer.isActive &&
      startDate <= now &&
      endDate >= now &&
      (offer.usageLimit === undefined || offer.usedCount < offer.usageLimit)
    );
  };

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
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-hindi text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>🛒</span>
                <span>श्रेणी प्रबंधन</span>
              </a>
              <a
                href="/admin/offers"
                className="flex items-center space-x-2 px-3 py-2 bg-primary-green text-white rounded-md text-sm font-hindi"
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
                  ऑफर प्रबंधन
                </h1>
                <p className="mt-2 text-gray-600 font-hindi">
                  छूट और विशेष ऑफर प्रबंधित करें
                </p>
              </div>
              <Button
                className="mt-4 sm:mt-0 bg-primary-green hover:bg-secondary-green font-hindi touch-target"
                onClick={() => (window.location.href = "/admin/offers/add")}
              >
                <Plus className="h-4 w-4 mr-2" />
                नया ऑफर जोड़ें
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
                      placeholder="ऑफर खोजें..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-hindi"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md font-hindi"
                >
                  <option value="all">सभी ऑफर</option>
                  <option value="active">सक्रिय ऑफर</option>
                  <option value="inactive">निष्क्रिय ऑफर</option>
                  <option value="expired">समाप्त ऑफर</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {loading && offers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {offers.map((offer) => (
                  <Card key={offer._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="font-hindi flex items-center gap-2">
                            <Percent className="h-5 w-5 text-purple-500" />
                            {offer.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground font-hindi mt-1">
                            {offer.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            isOfferActive(offer) ? "default" : "secondary"
                          }
                          className="ml-2"
                        >
                          {isOfferActive(offer) ? "सक्रिय" : "निष्क्रिय"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium font-hindi">
                            छूट:
                          </span>
                          <span className="text-lg font-bold text-purple-500">
                            {offer.discountType === "percentage"
                              ? `${offer.discountValue}%`
                              : `₹${offer.discountValue}`}
                          </span>
                        </div>

                        {offer.minimumOrderAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium font-hindi">
                              न्यूनतम ऑर्डर:
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ₹{offer.minimumOrderAmount}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="font-hindi">
                            {formatDate(offer.startDate)} से{" "}
                            {formatDate(offer.endDate)} तक
                          </span>
                        </div>

                        {offer.usageLimit && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium font-hindi">
                              उपयोग:
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {offer.usedCount} / {offer.usageLimit}
                            </span>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium font-hindi mb-2">
                            {offer.applicableToAll
                              ? "सभी उत्पादों पर लागू"
                              : "लागू उत्पाद:"}
                          </p>
                          {!offer.applicableToAll && (
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {offer.products.map((product) => (
                                <div
                                  key={product._id}
                                  className="text-sm text-muted-foreground font-hindi"
                                >
                                  • {product.name}
                                </div>
                              ))}
                              {offer.categories.map((category) => (
                                <div
                                  key={category._id}
                                  className="text-sm text-muted-foreground font-hindi"
                                >
                                  • श्रेणी: {category.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 font-hindi bg-transparent"
                            onClick={() =>
                              (window.location.href = `/admin/offers/edit/${offer._id}`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            संपादित करें
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => deleteOffer(offer._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {offers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-hindi">कोई ऑफर नहीं मिला</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
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
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    अगला
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
