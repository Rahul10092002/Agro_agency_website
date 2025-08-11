"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Package, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/loading-spinner";

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

interface OfferFormData {
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number;
  productIds: string[];
  categoryIds: string[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit: number;
  applicableToAll: boolean;
}

export default function AddOfferPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<OfferFormData>({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    productIds: [],
    categoryIds: [],
    isActive: true,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    applicableToAll: false,
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products?limit=1000");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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

  useEffect(() => {
    const loadData = async () => {
      setProductsLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setProductsLoading(false);
    };
    loadData();
  }, []);

  const handleInputChange = (field: keyof OfferFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductSelection = (productId: string, isSelected: boolean) => {
    setFormData((prev) => ({
      ...prev,
      productIds: isSelected
        ? [...prev.productIds, productId]
        : prev.productIds.filter((id) => id !== productId),
    }));
  };

  const handleCategorySelection = (categoryId: string, isSelected: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: isSelected
        ? [...prev.categoryIds, categoryId]
        : prev.categoryIds.filter((id) => id !== categoryId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast({
        title: "त्रुटि",
        description: "कृपया सभी आवश्यक फील्ड भरें",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast({
        title: "त्रुटि",
        description: "समाप्ति तारीख शुरुआती तारीख के बाद होनी चाहिए",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.discountType === "percentage" &&
      formData.discountValue > 100
    ) {
      toast({
        title: "त्रुटि",
        description: "प्रतिशत छूट 100% से अधिक नहीं हो सकती",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.applicableToAll &&
      formData.productIds.length === 0 &&
      formData.categoryIds.length === 0
    ) {
      toast({
        title: "त्रुटि",
        description:
          "कृपया कम से कम एक उत्पाद या श्रेणी चुनें, या 'सभी उत्पादों पर लागू' का चयन करें",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          usageLimit: formData.usageLimit > 0 ? formData.usageLimit : undefined,
          maximumDiscountAmount:
            formData.maximumDiscountAmount > 0
              ? formData.maximumDiscountAmount
              : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "सफल",
          description: data.message,
        });
        router.push("/admin/offers");
      } else {
        toast({
          title: "त्रुटि",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      toast({
        title: "त्रुटि",
        description: "ऑफर बनाने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (productsLoading) {
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
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4 font-hindi bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              वापस जाएं
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 font-hindi">
              नया ऑफर जोड़ें
            </h1>
            <p className="mt-2 text-gray-600 font-hindi">
              नए ऑफर की जानकारी भरें
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">बुनियादी जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="font-hindi">
                    ऑफर का शीर्षक *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="font-hindi"
                    placeholder="उदाहरण: दिवाली धमाका ऑफर"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-hindi">
                    विवरण *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="font-hindi"
                    placeholder="ऑफर का विस्तृत विवरण"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                  <Label htmlFor="isActive" className="font-hindi">
                    ऑफर सक्रिय करें
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Discount Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">छूट की जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType" className="font-hindi">
                      छूट का प्रकार
                    </Label>
                    <select
                      id="discountType"
                      value={formData.discountType}
                      onChange={(e) =>
                        handleInputChange(
                          "discountType",
                          e.target.value as "percentage" | "fixed"
                        )
                      }
                      className="w-full px-3 py-2 border border-input bg-background rounded-md font-hindi"
                    >
                      <option value="percentage">प्रतिशत (%)</option>
                      <option value="fixed">निश्चित राशि (₹)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="discountValue" className="font-hindi">
                      छूट की मात्रा *
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      max={
                        formData.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                      value={formData.discountValue}
                      onChange={(e) =>
                        handleInputChange(
                          "discountValue",
                          parseFloat(e.target.value)
                        )
                      }
                      placeholder={
                        formData.discountType === "percentage" ? "10" : "100"
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minimumOrderAmount" className="font-hindi">
                      न्यूनतम ऑर्डर राशि (₹)
                    </Label>
                    <Input
                      id="minimumOrderAmount"
                      type="number"
                      min="0"
                      value={formData.minimumOrderAmount}
                      onChange={(e) =>
                        handleInputChange(
                          "minimumOrderAmount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="maximumDiscountAmount"
                      className="font-hindi"
                    >
                      अधिकतम छूट राशि (₹)
                    </Label>
                    <Input
                      id="maximumDiscountAmount"
                      type="number"
                      min="0"
                      value={formData.maximumDiscountAmount}
                      onChange={(e) =>
                        handleInputChange(
                          "maximumDiscountAmount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="कोई सीमा नहीं"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date and Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">समय सीमा और उपयोग</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="font-hindi">
                      शुरुआती तारीख *
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="font-hindi">
                      समाप्ति तारीख *
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="usageLimit" className="font-hindi">
                    उपयोग सीमा (वैकल्पिक)
                  </Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      handleInputChange(
                        "usageLimit",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="असीमित उपयोग के लिए खाली छोड़ें"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product and Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">
                  लागू उत्पाद और श्रेणियां
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applicableToAll"
                    checked={formData.applicableToAll}
                    onCheckedChange={(checked) => {
                      handleInputChange("applicableToAll", checked);
                      if (checked) {
                        handleInputChange("productIds", []);
                        handleInputChange("categoryIds", []);
                      }
                    }}
                  />
                  <Label htmlFor="applicableToAll" className="font-hindi">
                    सभी उत्पादों पर लागू करें
                  </Label>
                </div>

                {!formData.applicableToAll && (
                  <>
                    {/* Categories */}
                    <div>
                      <h4 className="font-medium font-hindi mb-3 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        श्रेणियां चुनें
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {categories.map((category) => (
                          <div
                            key={category._id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category._id}`}
                              checked={formData.categoryIds.includes(
                                category._id
                              )}
                              onCheckedChange={(checked) =>
                                handleCategorySelection(category._id, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`category-${category._id}`}
                              className="text-sm font-hindi cursor-pointer"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <h4 className="font-medium font-hindi mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        उत्पाद चुनें
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                        {products.map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`product-${product._id}`}
                              checked={formData.productIds.includes(
                                product._id
                              )}
                              onCheckedChange={(checked) =>
                                handleProductSelection(product._id, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`product-${product._id}`}
                              className="text-sm font-hindi cursor-pointer"
                            >
                              {product.name} - ₹{product.price}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="font-hindi bg-transparent"
              >
                रद्द करें
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-green hover:bg-secondary-green font-hindi"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "सेव हो रहा है..." : "ऑफर सेव करें"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
