export interface Category {
  id: string
  name: string
  nameEnglish: string
  description: string
  icon: string
  slug: string
}

export interface Product {
  id: string
  name: string
  nameEnglish: string
  categoryId: string
  price: number
  originalPrice?: number
  unit: string
  description: string
  usageInstructions: string
  benefits: string[]
  precautions: string[]
  images: string[]
  inStock: boolean
  stockQuantity: number
  featured: boolean
  views: number
  createdAt: Date
  updatedAt: Date
}

export interface Offer {
  id: string
  title: string
  description: string
  discountPercentage: number
  productIds: string[]
  startDate: Date
  endDate: Date
  active: boolean
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  createdAt: Date
}

export interface ContactInfo {
  shopName: string
  ownerName: string
  address: string
  phone: string
  whatsapp: string
  email: string
  timings: string
  mapUrl: string
}
