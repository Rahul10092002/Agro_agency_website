import Offer from "@/models/Offer";
import Product from "@/models/Product";

export interface ProductWithOffer {
  _id: string;
  name: string;
  nameEnglish: string;
  price: number;
  originalPrice?: number;
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
  views: number;
  // Offer-related fields
  appliedOffer?: {
    _id: string;
    title: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountedPrice: number;
    savingsAmount: number;
  };
  effectivePrice: number;
  hasActiveOffer: boolean;
}

/**
 * Apply active offers to a single product
 */
export async function applyOffersToProduct(
  product: any,
  orderAmount?: number
): Promise<ProductWithOffer> {
  try {
    const now = new Date();

    // Find all active offers applicable to this product
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { applicableToAll: true },
        { productIds: product._id },
        { categoryIds: product.categoryId },
      ],
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
      ...(orderAmount !== undefined && {
        minimumOrderAmount: { $lte: orderAmount },
      }),
    }).sort({ discountValue: -1 }); // Sort by discount value (highest first)

    let bestOffer = null;
    let bestDiscountedPrice = product.price;
    let bestSavingsAmount = 0;

    // Find the best offer for this product
    for (const offer of offers) {
      let discountedPrice = product.price;
      let savingsAmount = 0;

      if (offer.discountType === "percentage") {
        savingsAmount = (product.price * offer.discountValue) / 100;
        discountedPrice = product.price - savingsAmount;
      } else if (offer.discountType === "fixed") {
        savingsAmount = Math.min(offer.discountValue, product.price);
        discountedPrice = Math.max(0, product.price - offer.discountValue);
      }

      // Apply maximum discount limit if specified
      if (
        offer.maximumDiscountAmount &&
        savingsAmount > offer.maximumDiscountAmount
      ) {
        savingsAmount = offer.maximumDiscountAmount;
        discountedPrice = product.price - savingsAmount;
      }

      // Check if this is the best offer so far
      if (discountedPrice < bestDiscountedPrice) {
        bestOffer = {
          _id: offer._id,
          title: offer.title,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          discountedPrice,
          savingsAmount,
        };
        bestDiscountedPrice = discountedPrice;
        bestSavingsAmount = savingsAmount;
      }
    }

    return {
      ...(product.toObject ? product.toObject() : product),
      appliedOffer: bestOffer,
      effectivePrice: bestDiscountedPrice,
      hasActiveOffer: bestOffer !== null,
    };
  } catch (error) {
    console.error("Error applying offers to product:", error);
    return {
      ...(product.toObject ? product.toObject() : product),
      appliedOffer: undefined,
      effectivePrice: product.price,
      hasActiveOffer: false,
    };
  }
}

/**
 * Apply active offers to multiple products
 */
export async function applyOffersToProducts(
  products: any[],
  orderAmount?: number
): Promise<ProductWithOffer[]> {
  try {
    return await Promise.all(
      products.map((product) => applyOffersToProduct(product, orderAmount))
    );
  } catch (error) {
    console.error("Error applying offers to products:", error);
    return products.map((product) => ({
      ...(product.toObject ? product.toObject() : product),
      appliedOffer: undefined,
      effectivePrice: product.price,
      hasActiveOffer: false,
    }));
  }
}

/**
 * Calculate cart total with offers applied
 */
export async function calculateCartTotal(
  cartItems: Array<{ productId: string; quantity: number; product?: any }>
): Promise<{
  subtotal: number;
  totalSavings: number;
  total: number;
  itemsWithOffers: Array<{
    productId: string;
    quantity: number;
    product: ProductWithOffer;
    itemTotal: number;
    itemSavings: number;
  }>;
}> {
  try {
    let subtotal = 0;
    let totalSavings = 0;
    const itemsWithOffers = [];

    // Calculate subtotal first to determine order amount for offers
    const tempSubtotal = cartItems.reduce((sum, item) => {
      const product = item.product;
      return sum + product.price * item.quantity;
    }, 0);

    for (const cartItem of cartItems) {
      const productWithOffer = await applyOffersToProduct(
        cartItem.product,
        tempSubtotal
      );

      const itemTotal = productWithOffer.effectivePrice * cartItem.quantity;
      const itemSavings =
        (cartItem.product.price - productWithOffer.effectivePrice) *
        cartItem.quantity;

      subtotal += cartItem.product.price * cartItem.quantity;
      totalSavings += itemSavings;

      itemsWithOffers.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        product: productWithOffer,
        itemTotal,
        itemSavings,
      });
    }

    return {
      subtotal,
      totalSavings,
      total: subtotal - totalSavings,
      itemsWithOffers,
    };
  } catch (error) {
    console.error("Error calculating cart total:", error);
    throw error;
  }
}

/**
 * Get the best offers for a specific product or category
 */
export async function getBestOffersForProduct(
  productId?: string,
  categoryId?: string
): Promise<any[]> {
  try {
    const now = new Date();

    const query: any = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    };

    if (productId || categoryId) {
      const orConditions: any[] = [{ applicableToAll: true }];

      if (productId) {
        orConditions.push({ productIds: productId });
      }

      if (categoryId) {
        orConditions.push({ categoryIds: categoryId });
      }

      query.$and = [{ $or: orConditions }];
    }

    return await Offer.find(query).sort({ discountValue: -1 }).limit(5).lean();
  } catch (error) {
    console.error("Error getting best offers:", error);
    return [];
  }
}
