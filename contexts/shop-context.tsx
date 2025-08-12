"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface Shop {
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShopContextType {
  shop: Shop | null;
  loading: boolean;
  error: string | null;
  refreshShop: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShop = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/shop");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch shop information");
      }

      if (data.success && data.data) {
        setShop(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching shop:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch shop information"
      );
      setShop(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshShop = async () => {
    await fetchShop();
  };

  useEffect(() => {
    fetchShop();
  }, []);

  return (
    <ShopContext.Provider value={{ shop, loading, error, refreshShop }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}

// Hook for contact info compatibility
export function useContactInfo() {
  const { shop, loading, error } = useShop();

  if (!shop) {
    return {
      contactInfo: null,
      loading,
      error,
    };
  }

  // Transform shop data to match the old contactInfo format
  const contactInfo = {
    shopName: shop.shopName,
    shopNameEnglish: shop.shopNameEnglish,
    ownerName: shop.ownerName,
    ownerNameEnglish: shop.ownerNameEnglish,
    address: shop.address,
    addressEnglish: shop.addressEnglish,
    phone: shop.phone,
    whatsapp: shop.whatsapp,
    email: shop.email,
    website: shop.website || "",
    timings: shop.timings.weekdays,
    timingsEnglish: shop.timings.weekdaysEnglish,
    weekendTimings: shop.timings.weekends,
    weekendTimingsEnglish: shop.timings.weekendsEnglish,
    description: shop.description || "",
    descriptionEnglish: shop.descriptionEnglish || "",
    socialMedia: shop.socialMedia,
    mapUrl: "", // You can add this field to shop if needed
  };

  return {
    contactInfo,
    loading,
    error,
  };
}
