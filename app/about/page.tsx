"use client";

import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContactInfo } from "@/contexts/shop-context";
import { Users, Heart, Target, CheckCircle, Star } from "lucide-react";

export default function AboutPage() {
  const { contactInfo, loading, error } = useContactInfo();
  const achievements = [
    // { icon: "🏆", title: "15+ साल का अनुभव", description: "कृषि क्षेत्र में लंबा अनुभव" },
    {
      icon: "👥",
      title: "100+ खुश किसान",
      description: "हजारों किसानों का भरोसा",
    },
    {
      icon: "🌾",
      title: "500+ उत्पाद",
      description: "सभी प्रकार के कृषि उत्पाद",
    },
    {
      icon: "⭐",
      title: "98% संतुष्टि दर",
      description: "ग्राहकों की पूर्ण संतुष्टि",
    },
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "किसानों के लिए प्रेम",
      description:
        "हम किसानों की सेवा को अपना धर्म मानते हैं और उनकी समृद्धि के लिए काम करते हैं।",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      title: "गुणवत्ता की गारंटी",
      description:
        "हम केवल प्रमाणित और उच्च गुणवत्ता वाले उत्पाद ही बेचते हैं।",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "समुदाय की सेवा",
      description:
        "हमारा लक्ष्य पूरे गांव के किसानों की मदद करना और उन्हें आगे बढ़ाना है।",
    },
    {
      icon: <Target className="h-8 w-8 text-purple-500" />,
      title: "निष्पक्ष व्यापार",
      description:
        "हम हमेशा ईमानदारी से व्यापार करते हैं और उचित दाम लगाते हैं।",
    },
  ];

  const services = [
    "उच्च गुणवत्ता वाले बीज की आपूर्ति",
    "जैविक और रासायनिक खाद",
    "प्रभावी कीटनाशक और फफूंदनाशक",
    "आधुनिक कृषि उपकरण",
    "मुफ्त कृषि सलाह और मार्गदर्शन",
    "फसल की समस्याओं का समाधान",
    "नई तकनीकों की जानकारी",
    "किसान मित्र योजनाओं की सहायता",
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green mx-auto"></div>
            <p className="mt-4 text-lg font-hindi">
              दुकान की जानकारी लोड हो रही है...
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
              दुकान की जानकारी लोड करने में त्रुटि
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
            हमारे बारे में
          </h1>
          <p className="text-xl text-gray-600 font-hindi">
            किसानों की सेवा में समर्पित - 15 साल से आपका भरोसेमंद साथी
          </p>
        </div>

        {/* Hero Section */}
        <div className="mb-16">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video lg:aspect-square bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="text-6xl mb-4">🌾</div>
                  <h2 className="text-3xl font-bold font-hindi mb-2">
                    {contactInfo.shopName}
                  </h2>
                  <p className="text-xl font-hindi">
                    आपके खेत की पूरी ज़रूरत — एक ही जगह
                  </p>
                </div>
              </div>
              <CardContent className="p-8 flex items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-hindi mb-4">
                    हमारी कहानी
                  </h2>
                  <p className="text-gray-700 font-hindi leading-relaxed mb-4">
                    {contactInfo.shopName} की स्थापना 2009 में{" "}
                    {contactInfo.ownerName} जी द्वारा की गई थी। एक किसान परिवार
                    से आने वाले राम प्रसाद जी ने देखा कि गांव के किसानों को
                    अच्छे बीज, खाद और कृषि उपकरण मिलने में कठिनाई होती है।
                  </p>
                  <p className="text-gray-700 font-hindi leading-relaxed mb-4">
                    इसी समस्या को हल करने के लिए उन्होंने अपनी छोटी सी दुकान
                    शुरू की। हम गर्व से कह सकते हैं कि हमने हजारों किसानों की
                    मदद की है और उनकी फसल को बेहतर बनाने में योगदान दिया है।
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 font-hindi text-center mb-8">
            हमारी उपलब्धियां
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{achievement.icon}</div>
                  <h3 className="font-bold font-hindi text-lg mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 font-hindi text-sm">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-hindi flex items-center">
                  <Target className="h-6 w-6 mr-2 text-primary-green" />
                  हमारा मिशन
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-hindi leading-relaxed">
                  हमारा मिशन है भारत के किसानों को उच्च गुणवत्ता वाले कृषि
                  उत्पाद उचित दाम पर उपलब्ध कराना। हम चाहते हैं कि हर किसान को
                  बेहतरीन बीज, खाद और उपकरण मिले ताकि वे अपनी फसल से अधिकतम लाभ
                  उठा सकें।
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-hindi flex items-center">
                  <Star className="h-6 w-6 mr-2 text-yellow-500" />
                  हमारा विजन
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-hindi leading-relaxed">
                  हमारा विजन है एक ऐसा भारत बनाना जहां हर किसान समृद्ध हो और
                  आधुनिक कृषि तकनीकों का उपयोग करके अपनी आय बढ़ाए। हम चाहते हैं
                  कि ��ृषि क्षेत्र में नवाचार और गुणवत्ता का नाम हो।
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 font-hindi text-center mb-8">
            हमारे मूल्य
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{value.icon}</div>
                    <div>
                      <h3 className="font-bold font-hindi text-lg mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-700 font-hindi leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 font-hindi text-center mb-8">
            हमारी सेवाएं
          </h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-hindi">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Owner Info */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl text-white">👨‍🌾</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-hindi mb-2">
                  {contactInfo.ownerName}
                </h2>
                <p className="text-gray-600 font-hindi mb-4">
                  मालिक एवं संस्थापक
                </p>
                <p className="text-gray-700 font-hindi leading-relaxed max-w-3xl mx-auto">
                  "मैं एक किसान का बेटा हूं और मैं जानता हूं कि अच्छे बीज और खाद
                  कितने महत्वपूर्ण हैं। मेरा सपना है कि हर किसान को बेहतरीन
                  गुणवत्ता का सामान मिले और वे अपनी मेहनत का सही फल पाएं। आपका
                  भरोसा ही हमारी सबसे बड़ी पूंजी है।"
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact CTA */}
        <section>
          <Card className="bg-primary-green text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold font-hindi mb-4">
                आज ही हमसे जुड़ें
              </h2>
              <p className="text-xl font-hindi mb-6">
                बेहतरीन कृषि उत्पाद और विशेषज्ञ सलाह के लिए संपर्क करें
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-white text-primary-green px-8 py-3 rounded-md font-hindi font-medium hover:bg-gray-100 transition-colors touch-target"
                >
                  संपर्क करें
                </a>
                <a
                  href="/products"
                  className="border-2 border-white text-white px-8 py-3 rounded-md font-hindi font-medium hover:bg-white hover:text-primary-green transition-colors touch-target"
                >
                  उत्पाद देखें
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
