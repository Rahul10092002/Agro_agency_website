import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { useContactInfo } from "@/contexts/shop-context";

export function PublicFooter() {
  const { contactInfo, loading, error } = useContactInfo();

  // Show loading state
  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-4 w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Show error state
  if (error || !contactInfo) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-400 font-hindi">
              दुकान की जानकारी लोड करने में त्रुटि
            </p>
            <p className="text-gray-400 text-sm mt-2">
              कृपया पेज को रीफ्रेश करें
            </p>
          </div>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shop Info */}
          <div>
            <h3 className="text-lg font-bold font-hindi mb-4">
              {contactInfo.shopName}
            </h3>
            <p className="text-gray-300 font-hindi mb-4">
              किसानों के लिए बेहतरीन गुणवत्ता वाले बीज, खाद, कीटनाशक और कृषि
              उपकरण। सही दाम पर सही सामान।
            </p>
            <div className="flex items-center space-x-2 text-gray-300">
              <span className="text-2xl">🌾</span>
              <span className="font-hindi">
                आपके खेत की पूरी ज़रूरत — एक ही जगह
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold font-hindi mb-4">
              संपर्क जानकारी
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-green mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 font-hindi text-sm">
                  {contactInfo.address}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-green flex-shrink-0" />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-gray-300 hover:text-white font-hindi"
                >
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-primary-green flex-shrink-0" />
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  className="text-gray-300 hover:text-white font-hindi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp पर संदेश भेजें
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-green flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-gray-300 hover:text-white"
                >
                  {contactInfo.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary-green flex-shrink-0" />
                <p className="text-gray-300 font-hindi text-sm">
                  {contactInfo.timings}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold font-hindi mb-4">त्वरित लिंक</h3>
            <div className="space-y-2">
              <a
                href="/"
                className="block text-gray-300 hover:text-white font-hindi"
              >
                होम पेज
              </a>
              <a
                href="/products?category=1"
                className="block text-gray-300 hover:text-white font-hindi"
              >
                बीज
              </a>
              <a
                href="/products?category=2"
                className="block text-gray-300 hover:text-white font-hindi"
              >
                खाद
              </a>
              <a
                href="/products?category=3"
                className="block text-gray-300 hover:text-white font-hindi"
              >
                कीटनाशक
              </a>
              <a
                href="/products?category=4"
                className="block text-gray-300 hover:text-white font-hindi"
              >
                कृषि उपकरण
              </a>
              <a
                href="/about"
                className="block text-gray-300 hover:text-white font-hindi"
              >
                हमारे बारे में
              </a>
              <a
                href="/contact"
                className="block text-gray-300 hover:text-white font-hindi"
              >
                संपर्क करें
              </a>
              <a
                href="/admin/login"
                className="block text-gray-300 hover:text-white font-hindi text-sm"
              >
                एडमिन लॉगिन
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 font-hindi">
            © 2024 {contactInfo.shopName}. सभी अधिकार सुरक्षित। | मालिक:{" "}
            {contactInfo.ownerName}
          </p>
          <p className="text-gray-500 font-hindi text-sm mt-2">
            डेवलपर: राहुल मनोहर पाटीदार (Rahul Manohar Patidar)
          </p>
        </div>
      </div>
    </footer>
  );
}
