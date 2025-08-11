"use client";

import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { LazyImage } from "@/components/lazy-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  ArrowRight,
  Star,
  Percent,
  Eye,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactInfo } from "@/lib/data";

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
  description?: string;
  icon?: string;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();



  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch featured products
      const featuredResponse = await fetch(
        "/api/products?featured=true&limit=6&includeOffers=true"
      );
      const featuredData = await featuredResponse.json();

      // Fetch popular products (sorted by views)
      const popularResponse = await fetch(
        "/api/products?limit=4&includeOffers=true"
      );
      const popularData = await popularResponse.json();

      // Fetch categories
      const categoriesResponse = await fetch("/api/categories");
      const categoriesData = await categoriesResponse.json();

      if (featuredData.success) {
        setFeaturedProducts(featuredData.products);
      }

      if (popularData.success) {
        // Sort by views and take top 4
        const sortedProducts = popularData.products.sort(
          (a: Product, b: Product) => b.views - a.views
        );
        setPopularProducts(sortedProducts.slice(0, 4));
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "त्रुटि",
        description: "डेटा लोड करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeOffers: any[] = []; // TODO: Implement offers API

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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-hindi mb-4">
              आपके खेत की पूरी ज़रूरत — एक ही जगह
            </h1>
            <p className="text-xl md:text-2xl font-hindi mb-8">
              अच्छी फसल के लिए बढ़िया बीज और खाद
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-700 hover:bg-gray-100 font-hindi text-lg px-8 py-3 touch-target"
                onClick={() => (window.location.href = "/products")}
              >
                सभी उत्पाद देखें
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700 font-hindi text-lg px-8 py-3 touch-target bg-transparent"
                onClick={() =>
                  window.open(
                    `https://wa.me/${contactInfo.whatsapp.replace(
                      /[^0-9]/g,
                      ""
                    )}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp पर संपर्क करें
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-hindi mb-4">
              हमारी श्रेणियां
            </h2>
            <p className="text-gray-600 font-hindi">
              सभी प्रकार के कृषि उत्पाद उपलब्ध
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <a
                key={category._id}
                href={`/products?category=${category._id}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{category.icon || "📦"}</div>
                    <h3 className="font-bold font-hindi text-lg mb-2 group-hover:text-primary-green">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-hindi">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 font-hindi mb-4">
                फीचर्ड उत्पाद
              </h2>
              <p className="text-gray-600 font-hindi">
                हमारे चुनिंदा बेहतरीन उत्पाद
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => {
                return (
                  <Card
                    key={product._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <LazyImage
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48"
                        width={384}
                        height={192}
                      />
                      <Badge className="absolute top-2 left-2 bg-primary-green">
                        <Star className="h-3 w-3 mr-1" />
                        फीचर्ड
                      </Badge>
                      {product.hasActiveOffer && product.appliedOffer && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          <Percent className="h-3 w-3 mr-1" />
                          {product.appliedOffer.discountType === "percentage"
                            ? `${product.appliedOffer.discountValue}% छूट`
                            : `₹${product.appliedOffer.discountValue} छूट`}
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
                        onClick={() =>
                          (window.location.href = `/products/${product._id}`)
                        }
                      >
                        विवरण देखें
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Today's Offers */}
      {activeOffers.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 font-hindi mb-4">
                आज के ऑफ़र
              </h2>
              <p className="text-gray-600 font-hindi">
                सीमित समय के लिए विशेष छूट
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* TODO: Implement offers display */}
            </div>
          </div>
        </section>
      )}

      {/* Popular Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-hindi mb-4">
              लोकप्रिय उत्पाद
            </h2>
            <p className="text-gray-600 font-hindi">
              किसानों की पसंदीदा चुनिंदा वस्तुएं
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <Card
                key={product._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <LazyImage
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48"
                    width={384}
                    height={192}
                  />
                  {product.hasActiveOffer && product.appliedOffer ? (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      <Percent className="h-3 w-3 mr-1" />
                      {product.appliedOffer.discountType === "percentage"
                        ? `${product.appliedOffer.discountValue}% छूट`
                        : `₹${product.appliedOffer.discountValue} छूट`}
                    </Badge>
                  ) : (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-bold">लोकप्रिय</span>
                      </div>
                    </div>
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
                    onClick={() =>
                      (window.location.href = `/products/${product._id}`)
                    }
                  >
                    विवरण देखें
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              size="lg"
              variant="outline"
              className="font-hindi text-lg px-8 py-3 touch-target bg-transparent"
              onClick={() => (window.location.href = "/products")}
            >
              सभी उत्पाद देखें
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-primary-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-hindi mb-4">
            आज ही संपर्क करें
          </h2>
          <p className="text-xl font-hindi mb-8">
            बेहतरीन गुणवत्ता और सही दाम पर कृषि उत्पाद
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary-green hover:bg-gray-100 font-hindi text-lg px-8 py-3 touch-target"
              onClick={() =>
                (window.location.href = `tel:${contactInfo.phone}`)
              }
            >
              <Phone className="mr-2 h-5 w-5" />
              फोन करें: {contactInfo.phone}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary-green font-hindi text-lg px-8 py-3 touch-target bg-transparent"
              onClick={() =>
                window.open(
                  `https://wa.me/${contactInfo.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )}`,
                  "_blank"
                )
              }
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp पर चैट करें
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
