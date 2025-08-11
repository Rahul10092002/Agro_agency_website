"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Calendar, Percent, Tag } from "lucide-react";

interface Offer {
  _id: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategories: string[];
  applicableProducts: string[];
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
}

interface Category {
  _id: string;
  name: string;
  nameEnglish: string;
}

interface Product {
  _id: string;
  name: string;
  nameEnglish: string;
}

interface FormData {
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableCategories: string[];
  applicableProducts: string[];
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
}

export default function EditOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params?.id as string;
  const { toast } = useToast();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    isActive: true,
    applicableCategories: [],
    applicableProducts: [],
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
  });

  const fetchOffer = async () => {
    try {
      const response = await fetch(`/api/admin/offers/${offerId}`);
      const data = await response.json();

      if (data.success) {
        const offerData = data.offer;
        setOffer(offerData);
        setFormData({
          title: offerData.title || "",
          description: offerData.description || "",
          discountType: offerData.discountType || "percentage",
          discountValue: offerData.discountValue?.toString() || "",
          startDate: offerData.startDate
            ? new Date(offerData.startDate).toISOString().split("T")[0]
            : "",
          endDate: offerData.endDate
            ? new Date(offerData.endDate).toISOString().split("T")[0]
            : "",
          isActive:
            offerData.isActive !== undefined ? offerData.isActive : true,
          applicableCategories: offerData.applicableCategories || [],
          applicableProducts: offerData.applicableProducts || [],
          minOrderAmount: offerData.minOrderAmount?.toString() || "",
          maxDiscountAmount: offerData.maxDiscountAmount?.toString() || "",
          usageLimit: offerData.usageLimit?.toString() || "",
        });
      } else {
        toast({
          title: "त्रुटि",
          description: data.message || "ऑफर लोड करने में त्रुटि",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
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
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (offerId) {
      fetchOffer();
      fetchCategories();
      fetchProducts();
    }
  }, [offerId]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(categoryId)
        ? prev.applicableCategories.filter((id) => id !== categoryId)
        : [...prev.applicableCategories, categoryId],
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter((id) => id !== productId)
        : [...prev.applicableProducts, productId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.discountValue ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast({
        title: "त्रुटि",
        description: "सभी आवश्यक फील्ड भरें",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? parseFloat(formData.minOrderAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : undefined,
        usageLimit: formData.usageLimit
          ? parseInt(formData.usageLimit)
          : undefined,
      };

      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
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
      console.error("Error updating offer:", error);
      toast({
        title: "त्रुटि",
        description: "ऑफर अपडेट करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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

  if (!offer) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 font-hindi mb-4">
                ऑफर नहीं मिला
              </h1>
              <Button
                onClick={() => router.push("/admin/offers")}
                className="font-hindi"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                वापस जाएं
              </Button>
            </div>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-hindi">
                  ऑफर संपादित करें
                </h1>
                <p className="mt-2 text-gray-600 font-hindi">
                  {offer.title} की जानकारी अपडेट करें
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/offers")}
                className="font-hindi bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                वापस जाएं
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  मुख्य जानकारी
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="font-hindi">
                    ऑफर शीर्षक *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="जैसे: 20% छूट खरीदारी पर"
                    className="font-hindi"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-hindi">
                    ऑफर विवरण
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="ऑफर के बारे में विस्तार से बताएं"
                    rows={3}
                    className="font-hindi"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                  <Label htmlFor="isActive" className="font-hindi">
                    ऑफर सक्रिय है
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Discount Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi flex items-center">
                  <Percent className="h-5 w-5 mr-2" />
                  छूट की जानकारी
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType" className="font-hindi">
                      छूट का प्रकार *
                    </Label>
                    <select
                      id="discountType"
                      value={formData.discountType}
                      onChange={(e) =>
                        handleInputChange("discountType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-hindi"
                      required
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
                      value={formData.discountValue}
                      onChange={(e) =>
                        handleInputChange("discountValue", e.target.value)
                      }
                      placeholder={
                        formData.discountType === "percentage" ? "20" : "100"
                      }
                      className="font-hindi"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minOrderAmount" className="font-hindi">
                      न्यूनतम ऑर्डर राशि (₹)
                    </Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        handleInputChange("minOrderAmount", e.target.value)
                      }
                      placeholder="500"
                      className="font-hindi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDiscountAmount" className="font-hindi">
                      अधिकतम छूट राशि (₹)
                    </Label>
                    <Input
                      id="maxDiscountAmount"
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        handleInputChange("maxDiscountAmount", e.target.value)
                      }
                      placeholder="200"
                      className="font-hindi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="usageLimit" className="font-hindi">
                      उपयोग सीमा
                    </Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        handleInputChange("usageLimit", e.target.value)
                      }
                      placeholder="100"
                      className="font-hindi"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  ऑफर की अवधि
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="font-hindi">
                      शुरुआती तारीख *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="font-hindi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="font-hindi">
                      समाप्ति तारीख *
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="font-hindi"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applicable Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">लागू श्रेणियां</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`category-${category._id}`}
                        checked={formData.applicableCategories.includes(
                          category._id
                        )}
                        onCheckedChange={() =>
                          handleCategoryToggle(category._id)
                        }
                      />
                      <Label
                        htmlFor={`category-${category._id}`}
                        className="font-hindi text-sm"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Applicable Products */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">लागू उत्पाद</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`product-${product._id}`}
                        checked={formData.applicableProducts.includes(
                          product._id
                        )}
                        onCheckedChange={() => handleProductToggle(product._id)}
                      />
                      <Label
                        htmlFor={`product-${product._id}`}
                        className="font-hindi text-sm"
                      >
                        {product.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/offers")}
                className="font-hindi bg-transparent"
              >
                रद्द करें
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary-green hover:bg-secondary-green font-hindi"
              >
                {saving ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    सेव करें
                  </>
                )}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
