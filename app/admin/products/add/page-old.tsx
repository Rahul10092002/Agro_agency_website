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
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  _id: string;
  name: string;
  nameEnglish: string;
}

interface ProductFormData {
  name: string;
  nameEnglish: string;
  price: number;
  originalPrice?: number;
  unit: string;
  categoryId: string;
  description: string;
  usageInstructions: string;
  benefits: string[];
  precautions: string[];
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
}

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    nameEnglish: "",
    price: 0,
    originalPrice: undefined,
    unit: "",
    categoryId: "",
    description: "",
    usageInstructions: "",
    benefits: [""],
    precautions: [""],
    images: [""],
    inStock: true,
    stockQuantity: 0,
    featured: false,
  });

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
    fetchCategories();
  }, []);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: "benefits" | "precautions" | "images",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: "benefits" | "precautions" | "images") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (
    field: "benefits" | "precautions" | "images",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.name ||
      !formData.nameEnglish ||
      !formData.price ||
      !formData.unit ||
      !formData.categoryId
    ) {
      toast({
        title: "त्रुटि",
        description: "कृपया सभी आवश्यक फील्ड भरें",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Filter out empty array items
      const cleanedData = {
        ...formData,
        benefits: formData.benefits.filter((item) => item.trim() !== ""),
        precautions: formData.precautions.filter((item) => item.trim() !== ""),
        images: formData.images.filter((item) => item.trim() !== ""),
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
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
      console.error("Error creating product:", error);
      toast({
        title: "त्रुटि",
        description: "उत्पाद बनाने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              नया उत्पाद जोड़ें
            </h1>
            <p className="mt-2 text-gray-600 font-hindi">
              नए उत्पाद की जानकारी भरें
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">बुनियादी जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-hindi">
                      उत्पाद का नाम (हिंदी) *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="font-hindi"
                      placeholder="उदाहरण: धान के बीज"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameEnglish" className="font-hindi">
                      उत्पाद का नाम (अंग्रेजी) *
                    </Label>
                    <Input
                      id="nameEnglish"
                      value={formData.nameEnglish}
                      onChange={(e) =>
                        handleInputChange("nameEnglish", e.target.value)
                      }
                      placeholder="Example: Rice Seeds"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price" className="font-hindi">
                      कीमत (₹) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange(
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice" className="font-hindi">
                      मूल कीमत (₹)
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "originalPrice",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="वैकल्पिक"
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
                      className="font-hindi"
                      placeholder="प्रति किलो"
                      required
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

                <div>
                  <Label htmlFor="description" className="font-hindi">
                    विवरण
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="font-hindi"
                    placeholder="उत्पाद का विस्तृत विवरण"
                    rows={3}
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
                    className="font-hindi"
                    placeholder="उत्पाद का उपयोग कैसे करें"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">तस्वीरें</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => handleInputChange("images", urls)}
                  maxImages={5}
                  label="उत्पाद की तस्वीरें"
                  disabled={loading}
                />
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">लाभ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) =>
                          handleArrayChange("benefits", index, e.target.value)
                        }
                        placeholder="लाभ बताएं"
                        className="flex-1 font-hindi"
                      />
                      {formData.benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem("benefits", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem("benefits")}
                    className="font-hindi bg-transparent"
                  >
                    और लाभ जोड़ें
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Precautions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">सावधानियाँ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formData.precautions.map((precaution, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={precaution}
                        onChange={(e) =>
                          handleArrayChange(
                            "precautions",
                            index,
                            e.target.value
                          )
                        }
                        placeholder="सावधानी बताएं"
                        className="flex-1 font-hindi"
                      />
                      {formData.precautions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem("precautions", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem("precautions")}
                    className="font-hindi bg-transparent"
                  >
                    और सावधानी जोड़ें
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stock & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">स्टॉक और सेटिंग्स</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stockQuantity" className="font-hindi">
                      स्टॉक मात्रा
                    </Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        handleInputChange(
                          "stockQuantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
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
                    <Switch
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

            {/* Submit Button */}
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
                {loading ? "सेव हो रहा है..." : "उत्पाद सेव करें"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
