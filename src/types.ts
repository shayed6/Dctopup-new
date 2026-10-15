export type PaymentMethodType = 'bkash' | 'nagad' | 'manual' | 'refund';

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'failed' | 'rejected' | 'cancelled';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  method: PaymentMethodType | string;
  type?: 'deposit' | 'manual' | 'refund' | string;
  amount: number;
  senderPhone: string;
  trxId: string;
  status: DepositStatus;
  rejectReason?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  isManual?: boolean;
  orderId?: string;
}

export interface TopUpPackage {
  id: string;
  name: string; // e.g., "115 Diamonds" or "60 UC"
  amount: string; // "115 💎"
  diamonds?: string; // alias for amount
  price: number; // in BDT ৳
  originalPrice?: number;
  popular?: boolean;
  instantDelivery?: boolean;
  isOutOfStock?: boolean;
}

export type ProductCategory = 'gaming' | 'facebook' | 'tiktok' | 'games';

export interface TopUpProduct {
  id: string;
  title: string;
  description: string;
  bannerImageUrl?: string;
  image: string; // backward compatibility fallback
  badgeTag?: string; // e.g. "Special Offer"
  badge?: string; // alias
  isActive: boolean;
  sortOrder?: number;
  category: ProductCategory;
  subCategory?: string; // e.g. "Battle Royale", "MOBA", "FPS", "Steam", "Gift Card"
  playerIdLabel?: string; // e.g., "Player ID (UID)" or "Riot ID"
  requiresZoneId?: boolean;
  zoneIdLabel?: string;
  bannerGradient?: string;
  packages: TopUpPackage[];
  isOutOfStock?: boolean;
}

export interface AppNotice {
  id: string;
  text: string;
  date?: string;
  type: 'info' | 'warning' | 'urgent' | 'offer';
  isActive: boolean;
  updatedAt: string;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  badge?: string;
  actionTab?: 'deposit' | 'orders' | 'home';
  actionText?: string;
  isActive: boolean;
}

export interface SiteConfigHomepage {
  notice: {
    text: string;
    date?: string;
    isActive: boolean;
    type?: 'urgent' | 'offer' | 'warning' | 'info';
  };
  banners: Array<{
    id?: string;
    imageUrl: string;
    title: string;
    subtitle?: string;
    linkUrl?: string;
    badge?: string;
    actionTab?: 'deposit' | 'orders' | 'home';
    actionText?: string;
    isActive?: boolean;
  }>;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  productId: string;
  productTitle: string;
  packageId: string;
  packageName: string;
  price: number;
  playerId: string;
  zoneId?: string;
  status: OrderStatus;
  createdAt: string;
  processingAt?: string;
  deliveredAt?: string;
  serverRef?: string;
  estimatedDeliverySeconds?: number;
  notes?: string;
  refunded?: boolean;
  refundedAt?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoURL?: string;
  walletBalance: number;
  role: 'user' | 'admin' | 'customer';
  joinedAt: string;
  avatarUrl?: string;
  savedGameUid?: string;
  status?: 'active' | 'banned' | string;
}

export interface PaymentAccountInfo {
  method: PaymentMethodType;
  name: string;
  number: string;
  numbers?: string[];
  type: 'Personal' | 'Agent';
  qrPlaceholder?: string;
  instructions: string[];
  color: string;
}
