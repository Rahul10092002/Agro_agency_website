"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  RefreshCw,
  Store,
  Clock,
  Share2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
interface ShopDetails {
  _id: string;
  shopName: string;
  shopNameEnglish: string;
  ownerName: string;
  ownerNameEnglish: string;
  address: string;
  addressEnglish: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  description?: string;
  descriptionEnglish?: string;
  timings: {
    weekdays: string;
    weekdaysEnglish: string;
    weekends: string;
    weekendsEnglish: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export default function ShopSettingsPage() {
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [apiError, setApiError] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();
  // Validation rules
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "shopName":
      case "shopNameEnglish":
        if (!value.trim()) return "दुकान का नाम आवश्यक है";
        if (value.length > 200) return "नाम 200 अक्षरों से अधिक नहीं हो सकता";
        break;

      case "ownerName":
      case "ownerNameEnglish":
        if (!value.trim()) return "मालिक का नाम आवश्यक है";
        if (value.length > 100) return "नाम 100 अक्षरों से अधिक नहीं हो सकता";
        break;

      case "address":
      case "addressEnglish":
        if (!value.trim()) return "पता आवश्यक है";
        if (value.length > 500) return "पता 500 अक्षरों से अधिक नहीं हो सकता";
        break;

      case "phone":
      case "whatsapp":
        if (!value.trim()) return "फोन नंबर आवश्यक है";
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        if (!phoneRegex.test(value))
          return "कृपया वैध फोन नंबर दर्ज करें (जैसे: +91 98765 43210)";
        break;

      case "email":
        if (!value.trim()) return "ईमेल आवश्यक है";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "कृपया वैध ईमेल दर्ज करें";
        break;

      case "website":
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          return "कृपया वैध वेबसाइट URL दर्ज करें (https:// के साथ)";
        }
        break;

      case "socialMedia.facebook":
      case "socialMedia.instagram":
      case "socialMedia.youtube":
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          return "कृपया वैध URL दर्ज करें (https:// के साथ)";
        }
        break;

      case "timings.weekdays":
      case "timings.weekdaysEnglish":
      case "timings.weekends":
      case "timings.weekendsEnglish":
        if (!value.trim()) return "समय की जानकारी आवश्यक है";
        break;
    }
    return "";
  };

  const validateAllFields = (): boolean => {
    if (!shopDetails) return false;

    const errors: ValidationErrors = {};

    // Validate all required fields
    const fieldsToValidate = [
      "shopName",
      "shopNameEnglish",
      "ownerName",
      "ownerNameEnglish",
      "address",
      "addressEnglish",
      "phone",
      "whatsapp",
      "email",
      "website",
      "timings.weekdays",
      "timings.weekdaysEnglish",
      "timings.weekends",
      "timings.weekendsEnglish",
    ];

    fieldsToValidate.forEach((field) => {
      const value = getFieldValue(field);
      const error = validateField(field, value);
      if (error) errors[field] = error;
    });

    // Validate social media fields
    ["facebook", "instagram", "youtube"].forEach((platform) => {
      const field = `socialMedia.${platform}`;
      const value =
        shopDetails.socialMedia[
          platform as keyof typeof shopDetails.socialMedia
        ] || "";
      const error = validateField(field, value);
      if (error) errors[field] = error;
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getFieldValue = (field: string): string => {
    if (!shopDetails) return "";

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      return ((shopDetails as any)[parent]?.[child] || "").toString();
    }
    return ((shopDetails as any)[field] || "").toString();
  };

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      setApiError("");
      const response = await fetch("/api/shop");

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setShopDetails(data.data);
        setValidationErrors({});
      } else {
        const errorMessage =
          data.message || "दुकान की जानकारी लोड करने में त्रुटि";
        setApiError(errorMessage);
        toast({
          title: "त्रुटि",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching shop details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "सर्वर से कनेक्ट करने में त्रुटि";
      setApiError(errorMessage);
      toast({
        title: "त्रुटि",
        description: "सर्वर से कनेक्ट करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!shopDetails) return;

    // Clear previous errors
    setApiError("");

    // Validate all fields before saving
    if (!validateAllFields()) {
      toast({
        title: "त्रुटि",
        description: "कृपया सभी त्रुटियों को ठीक करें",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/admin/shop", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopDetails),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "सफलता",
          description: "दुकान की जानकारी सफलतापूर्वक अपडेट हो गई",
          variant: "default",
        });
        setValidationErrors({});
        // Refresh data to get latest from server
        router.push("/admin/dashboard");

        await fetchShopDetails();
      } else {
        const apiErrorData = data as ApiError;
        let errorMessage = apiErrorData.message || "अपडेट करने में त्रुटि";

        // Handle validation errors from API
        if (apiErrorData.errors && apiErrorData.errors.length > 0) {
          errorMessage = apiErrorData.errors.join(", ");
        }

        setApiError(errorMessage);
        toast({
          title: "त्रुटि",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating shop details:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "सर्वर से कनेक्ट करने में त्रुटि";
      setApiError(errorMessage);
      toast({
        title: "त्रुटि",
        description: "सर्वर से कनेक्ट करने में त्रुटि",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!shopDetails) return;

    // Clear API error when user starts typing
    if (apiError) setApiError("");

    // Handle nested objects
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setShopDetails({
        ...shopDetails,
        [parent]: {
          ...(shopDetails as any)[parent],
          [child]: value,
        },
      });
    } else {
      setShopDetails({
        ...shopDetails,
        [field]: value,
      });
    }

    // Real-time validation
    const error = validateField(field, value);
    setValidationErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const getInputClassName = (field: string): string => {
    const baseClass = "transition-colors duration-200";
    const hindiClass =
      field.includes("Name") && !field.includes("English") ? "font-hindi" : "";
    const errorClass = validationErrors[field]
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "";

    return `${baseClass} ${hindiClass} ${errorClass}`.trim();
  };

  useEffect(() => {
    fetchShopDetails();
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

  if (!shopDetails) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50">
          <AdminHeader />
          <div className="text-center py-12">
            <p className="text-gray-500 font-hindi">
              दुकान की जानकारी लोड नहीं हो सकी
            </p>
            <Button onClick={fetchShopDetails} className="mt-4 font-hindi">
              <RefreshCw className="h-4 w-4 mr-2" />
              पुनः प्रयास करें
            </Button>
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
            <h1 className="text-3xl font-bold text-gray-900 font-hindi">
              दुकान सेटिंग
            </h1>
            <p className="mt-2 text-gray-600 font-hindi">
              अपनी दुकान की जानकारी को अपडेट करें
            </p>
          </div>

          <div className="space-y-6">
            {/* API Error Alert */}
            {apiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-hindi">
                  {apiError}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-hindi">
                  <Store className="h-5 w-5 mr-2" />
                  बुनियादी जानकारी
                </CardTitle>
                <CardDescription className="font-hindi">
                  दुकान और मालिक की मुख्य जानकारी
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shopName" className="font-hindi">
                      दुकान का नाम (हिंदी/स्थानीय भाषा){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shopName"
                      value={shopDetails.shopName}
                      onChange={(e) =>
                        handleInputChange("shopName", e.target.value)
                      }
                      className={getInputClassName("shopName")}
                      placeholder="दुकान का नाम दर्ज करें"
                    />
                    {validationErrors.shopName && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.shopName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="shopNameEnglish" className="font-hindi">
                      दुकान का नाम (अंग्रेजी){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shopNameEnglish"
                      value={shopDetails.shopNameEnglish}
                      onChange={(e) =>
                        handleInputChange("shopNameEnglish", e.target.value)
                      }
                      className={getInputClassName("shopNameEnglish")}
                      placeholder="Enter shop name in English"
                    />
                    {validationErrors.shopNameEnglish && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.shopNameEnglish}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ownerName" className="font-hindi">
                      मालिक का नाम (हिंदी/स्थानीय भाषा){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ownerName"
                      value={shopDetails.ownerName}
                      onChange={(e) =>
                        handleInputChange("ownerName", e.target.value)
                      }
                      className={getInputClassName("ownerName")}
                      placeholder="मालिक का नाम दर्ज करें"
                    />
                    {validationErrors.ownerName && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.ownerName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ownerNameEnglish" className="font-hindi">
                      मालिक का नाम (अंग्रेजी){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ownerNameEnglish"
                      value={shopDetails.ownerNameEnglish}
                      onChange={(e) =>
                        handleInputChange("ownerNameEnglish", e.target.value)
                      }
                      className={getInputClassName("ownerNameEnglish")}
                      placeholder="Enter owner name in English"
                    />
                    {validationErrors.ownerNameEnglish && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.ownerNameEnglish}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="font-hindi">
                      फोन नंबर <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      value={shopDetails.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={getInputClassName("phone")}
                      placeholder="+91 98765 43210"
                    />
                    {validationErrors.phone && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="whatsapp" className="font-hindi">
                      WhatsApp नंबर <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="whatsapp"
                      value={shopDetails.whatsapp}
                      onChange={(e) =>
                        handleInputChange("whatsapp", e.target.value)
                      }
                      className={getInputClassName("whatsapp")}
                      placeholder="+91 98765 43210"
                    />
                    {validationErrors.whatsapp && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.whatsapp}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-hindi">
                      ईमेल पता <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={shopDetails.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={getInputClassName("email")}
                      placeholder="shop@example.com"
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="website" className="font-hindi">
                      वेबसाइट (वैकल्पिक)
                    </Label>
                    <Input
                      id="website"
                      value={shopDetails.website || ""}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className={getInputClassName("website")}
                      placeholder="https://yourwebsite.com"
                    />
                    {validationErrors.website && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors.website}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">पता जानकारी</CardTitle>
                <CardDescription className="font-hindi">
                  दुकान का पूरा पता
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address" className="font-hindi">
                    पता (हिंदी/स्थानीय भाषा){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={shopDetails.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={getInputClassName("address")}
                    rows={3}
                    placeholder="दुकान का पूरा पता दर्ज करें"
                  />
                  {validationErrors.address && (
                    <p className="text-sm text-red-500 mt-1 font-hindi">
                      {validationErrors.address}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="addressEnglish" className="font-hindi">
                    पता (अंग्रेजी) <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="addressEnglish"
                    value={shopDetails.addressEnglish}
                    onChange={(e) =>
                      handleInputChange("addressEnglish", e.target.value)
                    }
                    className={getInputClassName("addressEnglish")}
                    rows={3}
                    placeholder="Enter complete address in English"
                  />
                  {validationErrors.addressEnglish && (
                    <p className="text-sm text-red-500 mt-1 font-hindi">
                      {validationErrors.addressEnglish}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-hindi">
                  <Clock className="h-5 w-5 mr-2" />
                  समय सारिणी
                </CardTitle>
                <CardDescription className="font-hindi">
                  दुकान खुलने और बंद होने का समय
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weekdays" className="font-hindi">
                      सप्ताह के दिन (हिंदी/स्थानीय भाषा){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weekdays"
                      value={shopDetails.timings.weekdays}
                      onChange={(e) =>
                        handleInputChange("timings.weekdays", e.target.value)
                      }
                      className={getInputClassName("timings.weekdays")}
                      placeholder="सुबह 9:00 - शाम 7:00"
                    />
                    {validationErrors["timings.weekdays"] && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors["timings.weekdays"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weekdaysEnglish" className="font-hindi">
                      सप्ताह के दिन (अंग्रेजी){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weekdaysEnglish"
                      value={shopDetails.timings.weekdaysEnglish}
                      onChange={(e) =>
                        handleInputChange(
                          "timings.weekdaysEnglish",
                          e.target.value
                        )
                      }
                      className={getInputClassName("timings.weekdaysEnglish")}
                      placeholder="9:00 AM - 7:00 PM"
                    />
                    {validationErrors["timings.weekdaysEnglish"] && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors["timings.weekdaysEnglish"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weekends" className="font-hindi">
                      सप्ताहांत (हिंदी/स्थानीय भाषा){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weekends"
                      value={shopDetails.timings.weekends}
                      onChange={(e) =>
                        handleInputChange("timings.weekends", e.target.value)
                      }
                      className={getInputClassName("timings.weekends")}
                      placeholder="सुबह 9:00 - दोपहर 2:00"
                    />
                    {validationErrors["timings.weekends"] && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors["timings.weekends"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weekendsEnglish" className="font-hindi">
                      सप्ताहांत (अंग्रेजी){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weekendsEnglish"
                      value={shopDetails.timings.weekendsEnglish}
                      onChange={(e) =>
                        handleInputChange(
                          "timings.weekendsEnglish",
                          e.target.value
                        )
                      }
                      className={getInputClassName("timings.weekendsEnglish")}
                      placeholder="9:00 AM - 2:00 PM"
                    />
                    {validationErrors["timings.weekendsEnglish"] && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors["timings.weekendsEnglish"]}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">दुकान का विवरण</CardTitle>
                <CardDescription className="font-hindi">
                  अपनी दुकान के बारे में जानकारी
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description" className="font-hindi">
                    विवरण (हिंदी/स्थानीय भाषा)
                  </Label>
                  <Textarea
                    id="description"
                    value={shopDetails.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={getInputClassName("description")}
                    rows={4}
                    placeholder="अपनी दुकान के बारे में बताएं..."
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-red-500 mt-1 font-hindi">
                      {validationErrors.description}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="descriptionEnglish" className="font-hindi">
                    विवरण (अंग्रेजी)
                  </Label>
                  <Textarea
                    id="descriptionEnglish"
                    value={shopDetails.descriptionEnglish || ""}
                    onChange={(e) =>
                      handleInputChange("descriptionEnglish", e.target.value)
                    }
                    className={getInputClassName("descriptionEnglish")}
                    rows={4}
                    placeholder="Tell about your shop..."
                  />
                  {validationErrors.descriptionEnglish && (
                    <p className="text-sm text-red-500 mt-1 font-hindi">
                      {validationErrors.descriptionEnglish}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-hindi">
                  <Share2 className="h-5 w-5 mr-2" />
                  सोशल मीडिया लिंक
                </CardTitle>
                <CardDescription className="font-hindi">
                  आपके सोशल मीडिया पेज (वैकल्पिक)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="facebook" className="font-hindi">
                      Facebook Page
                    </Label>
                    <Input
                      id="facebook"
                      value={shopDetails.socialMedia.facebook || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "socialMedia.facebook",
                          e.target.value
                        )
                      }
                      className={getInputClassName("socialMedia.facebook")}
                      placeholder="https://facebook.com/yourpage"
                    />
                    {validationErrors["socialMedia.facebook"] && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors["socialMedia.facebook"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="font-hindi">
                      Instagram Profile
                    </Label>
                    <Input
                      id="instagram"
                      value={shopDetails.socialMedia.instagram || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "socialMedia.instagram",
                          e.target.value
                        )
                      }
                      className={getInputClassName("socialMedia.instagram")}
                      placeholder="https://instagram.com/yourprofile"
                    />
                    {validationErrors["socialMedia.instagram"] && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors["socialMedia.instagram"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="youtube" className="font-hindi">
                      YouTube Channel
                    </Label>
                    <Input
                      id="youtube"
                      value={shopDetails.socialMedia.youtube || ""}
                      onChange={(e) =>
                        handleInputChange("socialMedia.youtube", e.target.value)
                      }
                      className={getInputClassName("socialMedia.youtube")}
                      placeholder="https://youtube.com/yourchannel"
                    />
                    {validationErrors["socialMedia.youtube"] && (
                      <p className="text-sm text-red-500 mt-1 font-hindi">
                        {validationErrors["socialMedia.youtube"]}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 font-hindi">
                <span className="text-red-500">*</span> आवश्यक फ़ील्ड हैं
              </div>
              <Button
                onClick={handleSave}
                disabled={
                  saving ||
                  Object.keys(validationErrors).some(
                    (key) => validationErrors[key]
                  )
                }
                className="font-hindi bg-primary-green hover:bg-secondary-green disabled:opacity-50"
                size="lg"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    सेव हो रहा है...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    सेव करें
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
