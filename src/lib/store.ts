import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  quantity: number;
  durationIndex: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  image?: string;
  stockOut: boolean;
  category: string;
  categorySlug: string;
  pricing: Array<{
    duration: string;
    price: number;
  }>;
  reviews?: Array<{
    id: string;
    name: string;
    rating: number;
    comment: string;
  }>;
}

interface SiteConfig {
  heroBanner: string[];
  favicon?: string;
  contactInfo: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  usdToBdtRate: number;
  siteLogo?: string;
  heroSliderInterval: number;
  hotDealsSpeed: number;
}

interface AppState {
  // Currency
  currency: 'BDT' | 'USD';
  toggleCurrency: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (productId: string, quantity: number, durationIndex: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, change: number) => void;
  clearCart: () => void;

  // UI State
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: (open: boolean) => void;
  fabOpen: boolean;
  setFabOpen: (open: boolean) => void;

  // Products
  products: Product[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
  }>;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: any[]) => void;

  // Site Config
  siteConfig: SiteConfig | null;
  setSiteConfig: (config: SiteConfig) => void;

  // Orders
  orderHistory: any[];
  setOrderHistory: (orders: any[]) => void;
  newNotificationCount: number;
  setNewNotificationCount: (count: number) => void;

  // Coupons
  coupons: any[];
  setCoupons: (coupons: any[]) => void;

  // Hot Deals
  hotDeals: any[];
  setHotDeals: (hotDeals: any[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Currency
      currency: 'BDT',
      toggleCurrency: () => {
        const newCurrency = get().currency === 'BDT' ? 'USD' : 'BDT';
        set({ currency: newCurrency });
      },

      // Cart
      cart: [],
      addToCart: (productId, quantity, durationIndex) => {
        const { cart } = get();
        const existingItemIndex = cart.findIndex(
          item => item.productId === productId && item.durationIndex === durationIndex
        );

        if (existingItemIndex > -1) {
          const newCart = [...cart];
          newCart[existingItemIndex].quantity += quantity;
          set({ cart: newCart });
        } else {
          set({ cart: [...cart, { productId, quantity, durationIndex }] });
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.productId !== productId) });
      },
      updateCartQuantity: (productId, change) => {
        const { cart } = get();
        const item = cart.find(item => item.productId === productId);
        if (item) {
          item.quantity += change;
          if (item.quantity <= 0) {
            get().removeFromCart(productId);
          } else {
            set({ cart: [...cart] });
          }
        }
      },
      clearCart: () => set({ cart: [] }),

      // UI State
      isSideMenuOpen: false,
      setIsSideMenuOpen: (open) => set({ isSideMenuOpen: open }),
      fabOpen: false,
      setFabOpen: (open) => set({ fabOpen: open }),

      // Products
      products: [],
      categories: [],
      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),

      // Site Config
      siteConfig: null,
      setSiteConfig: (config) => set({ siteConfig: config }),

      // Orders
      orderHistory: [],
      setOrderHistory: (orders) => set({ orderHistory: orders }),
      newNotificationCount: 0,
      setNewNotificationCount: (count) => set({ newNotificationCount: count }),

      // Coupons
      coupons: [],
      setCoupons: (coupons) => set({ coupons }),

      // Hot Deals
      hotDeals: [],
      setHotDeals: (hotDeals) => set({ hotDeals }),
    }),
    {
      name: 'submonth-storage',
      partialize: (state) => ({
        currency: state.currency,
        cart: state.cart,
        orderHistory: state.orderHistory,
        newNotificationCount: state.newNotificationCount,
      }),
    }
  )
);