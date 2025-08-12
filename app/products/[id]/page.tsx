"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Eye,
  Percent,
  CheckCircle,
  AlertTriangle,
  Package,
  Shield,
  Lightbulb,
} from "lucide-react";
import { useContactInfo } from "@/contexts/shop-context";

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
  usageInstructions?: string;
  benefits?: string[];
  precautions?: string[];
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

export default function ProductDetailPage() {
  const { contactInfo } = useContactInfo();
  const params = useParams();
  const productId = params?.id as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.product);

        // Fetch related products
        const relatedResponse = await fetch(
          `/api/products?category=${data.product.categoryId}&limit=4&includeOffers=true`
        );
        const relatedData = await relatedResponse.json();

        if (relatedData.success) {
          // Filter out the current product from related products
          const filtered = relatedData.products.filter(
            (p: Product) => p._id !== productId
          );
          setRelatedProducts(filtered.slice(0, 4));
        }
      } else {
        toast({
          title: "त्रुटि",
          description: data.message || "उत्पाद लोड करने में त्रुटि",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
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
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const activeOffers: any[] = []; // TODO: Implement offers API
  const offer = product?.appliedOffer;

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

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-hindi mb-4">
            उत्पाद नहीं मिला
          </h1>
          <p className="text-gray-600 font-hindi mb-8">
            यह उत्पाद उपलब्ध नहीं है या हटा दिया गया है।
          </p>
          <Button onClick={() => window.history.back()} className="font-hindi">
            <ArrowLeft className="h-4 w-4 mr-2" />
            वापस जाएं
          </Button>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const category: Category | null = null; // TODO: Fetch category info from API
  const discountedPrice = product?.hasActiveOffer
    ? product.effectivePrice
    : null;

  const handleWhatsAppContact = () => {
    if (!contactInfo?.whatsapp || !product) {
      toast({
        title: "त्रुटि",
        description: "संपर्क जानकारी उपलब्ध नहीं है",
        variant: "destructive",
      });
      return;
    }

    const message = `नमस्ते! मुझे ${product.name} के बारे में जानकारी चाहिए। कीमत: ₹${product.price} ${product.unit}`;
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePhoneCall = () => {
    if (!contactInfo?.phone) {
      toast({
        title: "त्रुटि",
        description: "फोन नंबर उपलब्ध नहीं है",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `tel:${contactInfo.phone}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 font-hindi">
            <a href="/" className="hover:text-primary-green">
              होम
            </a>
            <span>/</span>
            <a href="/products" className="hover:text-primary-green">
              उत्पाद
            </a>
            <span>/</span>
            <a
              href={`/products?category=${product.categoryId}`}
              className="hover:text-primary-green"
            >
              {(category as Category | null)?.name || "श्रेणी"}
            </a>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
              <img
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {offer && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  <Percent className="h-4 w-4 mr-1" />
                  {offer.discountType === "percentage"
                    ? `${offer.discountValue}% छूट`
                    : `₹${offer.discountValue} छूट`}
                </Badge>
              )}
              {!product.inStock && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  स्टॉक समाप्त
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? "border-primary-green"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <Badge variant="secondary" className="mb-2 font-hindi">
                {(category as Category | null)?.name || "श्रेणी"}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 font-hindi mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-4">
                {discountedPrice ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">
                      ₹{discountedPrice}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.originalPrice || product.price}
                    </span>
                    <Badge className="bg-red-500">
                      {offer?.discountType === "percentage"
                        ? `${offer.discountValue}% बचत`
                        : `₹${offer?.savingsAmount} बचत`}
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary-green">
                    ₹{product.price}
                  </span>
                )}
              </div>
              <p className="text-gray-600 font-hindi">{product.unit}</p>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 mt-4">
                {product.inStock ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-hindi">
                      स्टॉक में उपलब्ध ({product.stockQuantity} उपलब्ध)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 font-hindi">
                      स्टॉक समाप्त
                    </span>
                  </>
                )}
              </div>

              {/* Views */}
              <div className="flex items-center space-x-2 mt-2 text-gray-500">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-hindi">
                  {product.views} लोगों ने देखा है
                </span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-4 mb-8">
              <Button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 hover:bg-green-700 font-hindi text-lg py-3 touch-target"
                disabled={!product.inStock || !contactInfo?.whatsapp}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp पर संपर्क करें
              </Button>
              <Button
                onClick={handlePhoneCall}
                variant="outline"
                className="w-full font-hindi text-lg py-3 touch-target bg-transparent"
                disabled={!product.inStock || !contactInfo?.phone}
              >
                <Phone className="h-5 w-5 mr-2" />
                फोन करें: {contactInfo?.phone || "जल्द आएगा"}
              </Button>
            </div>

            {/* Product Description */}
            {product.description && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-hindi flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    उत्पाद विवरण
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-hindi leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Usage Instructions */}
            {product.usageInstructions && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-hindi flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    उपयोग विधि
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-hindi leading-relaxed">
                    {product.usageInstructions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="font-hindi flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    लाभ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-hindi">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Precautions */}
            {product.precautions && product.precautions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-hindi flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-orange-500" />
                    सावधानियाँ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-hindi">
                          {precaution}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold text-gray-900 font-hindi mb-8">
              संबंधित उत्पाद
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={relatedProduct.images[0] || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {relatedProduct.hasActiveOffer &&
                      relatedProduct.appliedOffer && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                          {relatedProduct.appliedOffer.discountType ===
                          "percentage"
                            ? `${relatedProduct.appliedOffer.discountValue}%`
                            : `₹${relatedProduct.appliedOffer.discountValue}`}
                        </Badge>
                      )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold font-hindi text-lg mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {relatedProduct.hasActiveOffer ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-red-600">
                              ₹{relatedProduct.effectivePrice}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹
                              {relatedProduct.originalPrice ||
                                relatedProduct.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-primary-green">
                            ₹{relatedProduct.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="h-3 w-3 mr-1" />
                        {relatedProduct.views}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary-green hover:bg-secondary-green font-hindi touch-target"
                      onClick={() =>
                        (window.location.href = `/products/${relatedProduct._id}`)
                      }
                    >
                      विवरण देखें
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
