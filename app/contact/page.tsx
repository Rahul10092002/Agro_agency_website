"use client";

import type React from "react";

import { useState } from "react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContactInfo } from "@/contexts/shop-context";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
} from "lucide-react";

export default function ContactPage() {
  const { contactInfo, loading, error } = useContactInfo();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo) return;

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, this would send to backend
    const whatsappMessage = `नमस्ते! मेरा नाम ${formData.name} है।\nफोन: ${formData.phone}\nसंदेश: ${formData.message}`;
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");

    setFormData({ name: "", phone: "", message: "" });
    setIsSubmitting(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWhatsAppDirect = () => {
    if (!contactInfo) return;
    const message = "नमस्ते! मुझे आपके उत्पादों के बारे में जानकारी चाहिए।";
    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePhoneCall = () => {
    if (!contactInfo) return;
    window.location.href = `tel:${contactInfo.phone}`;
  };

  const handleEmailClick = () => {
    if (!contactInfo) return;
    window.location.href = `mailto:${contactInfo.email}`;
  };

  const handleMapClick = () => {
    if (!contactInfo?.mapUrl) return;
    window.open(contactInfo.mapUrl, "_blank");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green mx-auto"></div>
            <p className="mt-4 text-lg font-hindi">
              संपर्क जानकारी लोड हो रही है...
            </p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Error state
  if (error || !contactInfo) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600 text-lg font-hindi">
              संपर्क जानकारी लोड करने में त्रुटि
            </p>
            <p className="text-gray-600 mt-2">कृपया पेज को रीफ्रेश करें</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-hindi mb-4">
            संपर्क करें
          </h1>
          <p className="text-xl text-gray-600 font-hindi">
            हमसे जुड़ें और अपनी खेती की जरूरतों के लिए सही सलाह पाएं
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  संदेश भेजें
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 font-hindi mb-2"
                    >
                      आपका नाम *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="अपना नाम लिखें"
                        className="pl-10 font-hindi"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 font-hindi mb-2"
                    >
                      फोन नंबर *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="आपका फोन नंबर"
                        className="pl-10 font-hindi"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 font-hindi mb-2"
                    >
                      आपका संदेश *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="आप क्या जानना चाहते हैं? कौन से उत्पाद चाहिए?"
                      rows={5}
                      className="font-hindi"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-green hover:bg-secondary-green font-hindi text-lg py-3 touch-target"
                  >
                    {isSubmitting ? (
                      "भेजा जा रहा है..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        WhatsApp पर भेजें
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-hindi">
                    📱 यह फॉर्म आपको सीधे हमारे WhatsApp पर भेज देगा। आप तुरंत
                    जवाब पा सकेंगे!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">तुरंत संपर्क करें</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handlePhoneCall}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-hindi text-lg py-3 touch-target"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  फोन करें: {contactInfo.phone}
                </Button>

                <Button
                  onClick={handleWhatsAppDirect}
                  className="w-full bg-green-600 hover:bg-green-700 font-hindi text-lg py-3 touch-target"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp पर चैट करें
                </Button>

                <Button
                  onClick={handleEmailClick}
                  variant="outline"
                  className="w-full font-hindi text-lg py-3 touch-target bg-transparent"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  ईमेल भेजें
                </Button>
              </CardContent>
            </Card>

            {/* Shop Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">दुकान की जानकारी</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary-green mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium font-hindi">पता:</p>
                    <p className="text-gray-600 font-hindi text-sm">
                      {contactInfo.address}
                    </p>
                    <Button
                      onClick={handleMapClick}
                      variant="link"
                      className="p-0 h-auto font-hindi text-primary-green"
                    >
                      मैप पर देखें
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary-green flex-shrink-0" />
                  <div>
                    <p className="font-medium font-hindi">खुलने का समय:</p>
                    <p className="text-gray-600 font-hindi text-sm">
                      {contactInfo.timings}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary-green flex-shrink-0" />
                  <div>
                    <p className="font-medium font-hindi">मालिक:</p>
                    <p className="text-gray-600 font-hindi text-sm">
                      {contactInfo.ownerName}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi">हमारी लोकेशन</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.674!2d77.7064!3d28.9845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDU5JzA0LjIiTiA3N8KwNDInMjMuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="राम कृषि उत्पाद भंडार का स्थान"
                  />
                </div>
                <Button
                  onClick={handleMapClick}
                  variant="outline"
                  className="w-full mt-4 font-hindi touch-target bg-transparent"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Google Maps में खोलें
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 font-hindi mb-4">
                  हमसे क्यों खरीदें?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">🌱</span>
                    </div>
                    <h3 className="font-bold font-hindi mb-2">
                      बेहतरीन गुणवत्ता
                    </h3>
                    <p className="text-gray-600 font-hindi text-sm">
                      सभी उत्पाद प्रमाणित और उच्च गुणवत्ता वाले हैं
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">💰</span>
                    </div>
                    <h3 className="font-bold font-hindi mb-2">सही दाम</h3>
                    <p className="text-gray-600 font-hindi text-sm">
                      बाजार से कम दाम में बेहतरीन सामान
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white">🤝</span>
                    </div>
                    <h3 className="font-bold font-hindi mb-2">
                      विश्वसनीय सेवा
                    </h3>
                    <p className="text-gray-600 font-hindi text-sm">
                      15 साल से किसानों की सेवा कर रहे हैं
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
