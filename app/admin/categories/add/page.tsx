"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryFormData {
  name: string;
  nameEnglish: string;
  description: string;
  icon: string;
}

export default function AddCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    nameEnglish: "",
    description: "",
    icon: "📦",
  });

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.nameEnglish) {
      toast({
        title: "त्रुटि",
        description: "कृपया सभी आवश्यक फील्ड भरें",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "सफल",
          description: data.message,
        });
        router.push("/admin/categories");
      } else {
        toast({
          title: "त्रुटि",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "त्रुटि",
        description: "श्रेणी बनाने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const commonIcons = [
    "📦",
    "🌱",
    "🚜",
    "💧",
    "🌾",
    "🔧",
    "🌿",
    "⚡",
    "🎯",
    "🛡️",
  ];

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              नई श्रेणी जोड़ें
            </h1>
            <p className="mt-2 text-gray-600 font-hindi">
              नई श्रेणी की जानकारी भरें
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">श्रेणी की जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-hindi">
                      श्रेणी का नाम (हिंदी) *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="font-hindi"
                      placeholder="उदाहरण: बीज"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameEnglish" className="font-hindi">
                      श्रेणी का नाम (अंग्रेजी) *
                    </Label>
                    <Input
                      id="nameEnglish"
                      value={formData.nameEnglish}
                      onChange={(e) =>
                        handleInputChange("nameEnglish", e.target.value)
                      }
                      placeholder="Example: Seeds"
                      required
                    />
                  </div>
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
                    placeholder="श्रेणी का संक्षिप्त विवरण"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="icon" className="font-hindi">
                    आइकन
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) =>
                        handleInputChange("icon", e.target.value)
                      }
                      placeholder="😀"
                      className="mb-3"
                    />
                    <div className="grid grid-cols-5 gap-2">
                      {commonIcons.map((icon) => (
                        <Button
                          key={icon}
                          type="button"
                          variant="outline"
                          className="aspect-square text-2xl"
                          onClick={() => handleInputChange("icon", icon)}
                        >
                          {icon}
                        </Button>
                      ))}
                    </div>
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
                {loading ? "सेव हो रहा है..." : "श्रेणी सेव करें"}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
