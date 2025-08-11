import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "उत्पाद का नाम आवश्यक है").max(200, "नाम 200 अक्षरों से अधिक नहीं हो सकता"),
  category: z.enum(["बीज", "खाद", "कीटनाशक", "कृषि उपकरण"], {
    errorMap: () => ({ message: "कृपया वैध श्रेणी चुनें" }),
  }),
  price: z.number().min(0, "कीमत 0 से कम नहीं हो सकती"),
  description: z.string().min(1, "विवरण आवश्यक है").max(2000, "विवरण 2000 अक्षरों से अधिक नहीं हो सकता"),
  usage: z.string().min(1, "उपयोग विधि आवश्यक है").max(1000, "उपयोग विधि 1000 अक्षरों से अधिक नहीं हो सकती"),
  benefits: z.string().min(1, "लाभ आवश्यक है").max(1000, "लाभ 1000 अक्षरों से अधिक नहीं हो सकते"),
  precautions: z.string().min(1, "सावधानियां आवश्यक हैं").max(1000, "सावधानियां 1000 अक्षरों से अधिक नहीं हो सकतीं"),
  images: z.array(z.string().url("अवैध छवि URL")).min(1, "कम से कम एक छवि आवश्यक है"),
  stockStatus: z.enum(["उपलब्ध", "समाप्त"]),
  unit: z.string().min(1, "इकाई आवश्यक है"),
  featured: z.boolean().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "श्रेणी का नाम आवश्यक है").max(100, "नाम 100 अक्षरों से अधिक नहीं हो सकता"),
  description: z.string().min(1, "विवरण आवश्यक है").max(500, "विवरण 500 अक्षरों से अधिक नहीं हो सकता"),
  icon: z.string().min(1, "आइकन आवश्यक है"),
})

export const loginSchema = z.object({
  email: z.string().email("कृपया वैध ईमेल दर्ज करें"),
  password: z.string().min(6, "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए"),
})

export const offerSchema = z.object({
  discountPercentage: z.number().min(0, "छूट 0% से कम नहीं हो सकती").max(100, "छूट 100% से अधिक नहीं हो सकती"),
  startDate: z.string().datetime("अवैध प्रारंभ तिथि"),
  endDate: z.string().datetime("अवैध समाप्ति तिथि"),
})
