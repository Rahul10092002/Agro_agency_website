"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Search, Filter, Eye, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  description?: string;
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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams?.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
        includeOffers: "true", // Request offers to be included
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setCategories(data.categories);
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

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, pagination.page]);

  const filteredProducts = products.filter((product) => {
    const priceToCheck = product.hasActiveOffer
      ? product.effectivePrice || product.price
      : product.price;
    const matchesPrice =
      (!priceRange.min || priceToCheck >= Number.parseInt(priceRange.min)) &&
      (!priceRange.max || priceToCheck <= Number.parseInt(priceRange.max));
    return matchesPrice;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat._id === categoryId)?.name || "अज्ञात";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-hindi mb-4">
            सभी उत्पाद
          </h1>
          <p className="text-gray-600 font-hindi">
            बीज, खाद, कीटनाशक और कृषि उपकरण
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md font-hindi min-w-[200px]"
            >
              <option value="all">सभी श्रेणियां</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="font-hindi lg:hidden bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              फिल्टर
            </Button>
          </div>

          {/* Price Range Filter */}
          {(showFilters || window.innerWidth >= 1024) && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium font-hindi mb-3">कीमत सीमा</h3>
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="न्यूनतम कीमत"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                  className="font-hindi"
                />
                <Input
                  type="number"
                  placeholder="अधिकतम कीमत"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                  className="font-hindi"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 font-hindi">
            {filteredProducts.length} उत्पाद मिले
            {selectedCategory !== "all" && (
              <span>
                {" "}
                "{categories.find((c) => c._id === selectedCategory)?.name}" में
              </span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            return (
              <Card
                key={product._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.hasActiveOffer && product.appliedOffer && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      <Percent className="h-3 w-3 mr-1" />
                      {product.appliedOffer.discountType === "percentage"
                        ? `${product.appliedOffer.discountValue}% छूट`
                        : `₹${product.appliedOffer.discountValue} छूट`}
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      समाप्त
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold font-hindi text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-hindi mb-2">
                    {getCategoryName(product.categoryId)}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.hasActiveOffer ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-red-600">
                            ₹{product.effectivePrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.originalPrice || product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary-green">
                          ₹{product.price}
                        </span>
                      )}
                      <p className="text-xs text-gray-500 font-hindi">
                        {product.unit}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Eye className="h-3 w-3 mr-1" />
                      {product.views}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary-green hover:bg-secondary-green font-hindi touch-target"
                    disabled={!product.inStock}
                    onClick={() =>
                      (window.location.href = `/products/${product._id}`)
                    }
                  >
                    {product.inStock ? "विवरण देखें" : "स्टॉक में नहीं"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-hindi text-lg">
              कोई उत्पाद नहीं मिला
            </p>
            <p className="text-gray-400 font-hindi mt-2">
              कृपया अपनी खोज या फिल्टर बदलकर दोबारा कोशिश करें
            </p>
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
              className="font-hindi"
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
              className="font-hindi"
            >
              अगला
            </Button>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
