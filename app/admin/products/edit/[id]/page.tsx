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
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, X } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  nameEnglish: string;
  price: number;
  unit: string;
  categoryId: string;
  description?: string;
  usageInstructions?: string;
  benefits?: string[];
  precautions?: string[];
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
}

interface Category {
  _id: string;
  name: string;
  nameEnglish: string;
}

interface FormData {
  name: string;
  nameEnglish: string;
  price: string;
  unit: string;
  categoryId: string;
  description: string;
  usageInstructions: string;
  benefits: string[];
  precautions: string[];
  images: string[];
  inStock: boolean;
  stockQuantity: string;
  featured: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    nameEnglish: "",
    price: "",
    unit: "",
    categoryId: "",
    description: "",
    usageInstructions: "",
    benefits: [],
    precautions: [],
    images: [],
    inStock: true,
    stockQuantity: "",
    featured: false,
  });

  const [newBenefit, setNewBenefit] = useState("");
  const [newPrecaution, setNewPrecaution] = useState("");

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        const productData = data.product;
        setProduct(productData);
        setFormData({
          name: productData.name || "",
          nameEnglish: productData.nameEnglish || "",
          price: productData.price?.toString() || "",
          unit: productData.unit || "",
          categoryId: productData.categoryId || "",
          description: productData.description || "",
          usageInstructions: productData.usageInstructions || "",
          benefits: productData.benefits || [],
          precautions: productData.precautions || [],
          images: productData.images || [],
          inStock: productData.inStock !== false,
          stockQuantity: productData.stockQuantity?.toString() || "",
          featured: productData.featured === true,
        });
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
      setLoading(true);
      await Promise.all([fetchProduct(), fetchCategories()]);
      setLoading(false);
    };

    if (productId) {
      loadData();
    }
  }, [productId]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const addPrecaution = () => {
    if (newPrecaution.trim()) {
      setFormData((prev) => ({
        ...prev,
        precautions: [...prev.precautions, newPrecaution.trim()],
      }));
      setNewPrecaution("");
    }
  };

  const removePrecaution = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      precautions: prev.precautions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.nameEnglish ||
      !formData.price ||
      !formData.unit ||
      !formData.categoryId
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
      const updateData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
      };

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "सफल",
          description: data.message,
        });
        router.push("/admin/products");
      } else {
        toast({
          title: "त्रुटि",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "त्रुटि",
        description: "उत्पाद अपडेट करने में त्रुटि",
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

  if (!product) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 font-hindi mb-4">
                उत्पाद नहीं मिला
              </h1>
              <Button
                onClick={() => router.push("/admin/products")}
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
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-hindi text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>💰</span>
                <span>ऑफर प्रबंधन</span>
              </a>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-hindi">
                  उत्पाद संपादित करें
                </h1>
                <p className="mt-2 text-gray-600 font-hindi">
                  {product.name} की जानकारी अपडेट करें
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/products")}
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
                <CardTitle className="font-hindi">मुख्य जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-hindi">
                      उत्पाद नाम (हिंदी) *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="उत्पाद का नाम हिंदी में"
                      className="font-hindi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameEnglish" className="font-hindi">
                      उत्पाद नाम (English) *
                    </Label>
                    <Input
                      id="nameEnglish"
                      value={formData.nameEnglish}
                      onChange={(e) =>
                        handleInputChange("nameEnglish", e.target.value)
                      }
                      placeholder="Product name in English"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price" className="font-hindi">
                      कीमत *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit" className="font-hindi">
                      इकाई *
                    </Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) =>
                        handleInputChange("unit", e.target.value)
                      }
                      placeholder="किलो, लीटर, पैकेट, आदि"
                      className="font-hindi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stockQuantity" className="font-hindi">
                      स्टॉक मात्रा
                    </Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        handleInputChange("stockQuantity", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categoryId" className="font-hindi">
                    श्रेणी *
                  </Label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                      handleInputChange("categoryId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-input bg-background rounded-md font-hindi"
                    required
                  >
                    <option value="">श्रेणी चुनें</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) =>
                        handleInputChange("inStock", checked)
                      }
                    />
                    <Label htmlFor="inStock" className="font-hindi">
                      स्टॉक में उपलब्ध
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        handleInputChange("featured", checked)
                      }
                    />
                    <Label htmlFor="featured" className="font-hindi">
                      फीचर्ड उत्पाद
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">उत्पाद की तस्वीरें</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => handleInputChange("images", urls)}
                  maxImages={5}
                />
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">विस्तृत जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description" className="font-hindi">
                    उत्पाद विवरण
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="उत्पाद के बारे में विस्तार से बताएं"
                    rows={4}
                    className="font-hindi"
                  />
                </div>
                <div>
                  <Label htmlFor="usageInstructions" className="font-hindi">
                    उपयोग विधि
                  </Label>
                  <Textarea
                    id="usageInstructions"
                    value={formData.usageInstructions}
                    onChange={(e) =>
                      handleInputChange("usageInstructions", e.target.value)
                    }
                    placeholder="उत्पाद का उपयोग कैसे करें"
                    rows={4}
                    className="font-hindi"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">लाभ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="लाभ जोड़ें"
                    className="font-hindi"
                    onKeyPress={(e) => e.key === "Enter" && addBenefit()}
                  />
                  <Button type="button" onClick={addBenefit}>
                    जोड़ें
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="font-hindi">{benefit}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Precautions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">सावधानियाँ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newPrecaution}
                    onChange={(e) => setNewPrecaution(e.target.value)}
                    placeholder="सावधानी जोड़ें"
                    className="font-hindi"
                    onKeyPress={(e) => e.key === "Enter" && addPrecaution()}
                  />
                  <Button type="button" onClick={addPrecaution}>
                    जोड़ें
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.precautions.map((precaution, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="font-hindi">{precaution}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePrecaution(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                onClick={() => router.push("/admin/products")}
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
