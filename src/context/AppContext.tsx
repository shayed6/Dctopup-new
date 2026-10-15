import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, DepositRequest, Order, OrderStatus, TopUpProduct, TopUpPackage, PaymentMethodType, AppNotice, HomeBanner } from '../types';
import { INITIAL_PRODUCTS, INITIAL_NOTICE, INITIAL_BANNERS } from '../data/initialData';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  collection, 
  query,
  where,
  serverTimestamp, 
  increment,
  runTransaction
} from 'firebase/firestore';

export type ActiveTab = 'home' | 'deposit' | 'orders' | 'profile' | 'login';

export const formatOrderDateTime = (date: Date = new Date()): string => {
  try {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const dateStr = date.toLocaleDateString('bn-BD', {
      month: 'short',
      day: 'numeric'
    });
    return `${timeStr}, ${dateStr}`;
  } catch {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = String(hours % 12 || 12).padStart(2, '0');
    return `${formattedHours}:${minutes} ${ampm}`;
  }
};

export const cleanDisplayTimestamp = (ts?: string): string => {
  if (!ts) return '';
  // Clean up any double seconds or invalid padding (e.g. "০৩:০৮:৪৪" or ":৮৮" -> "০৩:০৮")
  return ts.replace(/(:\d{2}):\d{2}/, '$1').replace(/(:[০-৯]{2}):[০-৯]{2}/, '$1');
};

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  isAuthReady: boolean;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  products: TopUpProduct[];
  deposits: DepositRequest[];
  orders: Order[];
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;
  deleteOrder: (orderId: string) => Promise<boolean>;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  // Profile
  updateUserProfile: (updates: Partial<User>) => Promise<void>;

  // Notice & Announcement
  notice: AppNotice;
  updateNotice: (newNotice: Partial<AppNotice>) => Promise<void>;

  // Promotional Banners
  banners: HomeBanner[];
  addBanner: (banner: HomeBanner) => Promise<void>;
  updateBanner: (banner: HomeBanner) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  reorderBanners: (startIndex: number, endIndex: number) => Promise<void>;
  saveAllBanners: (newBanners: HomeBanner[]) => Promise<void>;

  // Users Management (Admin)
  allUsers: User[];
  toggleUserBan: (userId: string, newStatus: 'banned' | 'active') => Promise<void>;
  addManualDeposit: (userId: string, amount: number, note?: string) => Promise<boolean>;

  // Auth
  signupWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPhone: (phone: string, name?: string) => void;
  logout: () => Promise<void>;
  
  // Deposit flow
  submitDeposit: (method: PaymentMethodType, amount: number, senderPhone: string, trxId: string) => Promise<boolean>;
  
  // Purchase flow
  selectedProduct: TopUpProduct | null;
  setSelectedProduct: (p: TopUpProduct | null) => void;
  purchaseProduct: (productId: string, packageId: string, playerId: string, zoneId?: string) => Promise<{ success: boolean; error?: string; order?: Order }>;
  
  // Admin actions (direct Firestore client SDK operations)
  approveDeposit: (depositId: string) => Promise<void>;
  rejectDeposit: (depositId: string, reason: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  addProduct: (product: TopUpProduct) => Promise<void>;
  updateProduct: (product: TopUpProduct) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductStock: (productId: string) => Promise<void>;
  toggleProductActive: (productId: string) => Promise<void>;
  togglePackageStock: (productId: string, packageId: string) => Promise<void>;
  updateProductImage: (productId: string, newImageUrl: string) => Promise<void>;
  updateProductPackages: (productId: string, packages: TopUpPackage[]) => Promise<void>;
  seedProductsToFirestore: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // CRITICAL: Pure Firebase Auth state only — no local mock fallback!
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<TopUpProduct | null>(null);

  const [products, setProducts] = useState<TopUpProduct[]>(() => {
    const ver = localStorage.getItem('dc_catalog_ver');
    if (ver === 'v8_mystery_box_rewards') {
      const saved = localStorage.getItem('dc_products');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    // Refresh to the exact items with matching images requested by the user
    localStorage.setItem('dc_catalog_ver', 'v8_mystery_box_rewards');
    localStorage.setItem('dc_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });

  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  const [notice, setNotice] = useState<AppNotice>(() => {
    const saved = localStorage.getItem('dc_notice');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.text && (parsed.text.includes('01845735906') || parsed.text.includes('01845-735906'))) {
          return INITIAL_NOTICE;
        }
        return parsed;
      } catch (e) {
        return INITIAL_NOTICE;
      }
    }
    return INITIAL_NOTICE;
  });

  const [banners, setBanners] = useState<HomeBanner[]>(() => {
    const ver = localStorage.getItem('dc_banners_ver');
    if (ver === 'v9_remove_old_phone') {
      const saved = localStorage.getItem('dc_banners');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    localStorage.setItem('dc_banners_ver', 'v9_remove_old_phone');
    localStorage.setItem('dc_banners', JSON.stringify(INITIAL_BANNERS));
    return INITIAL_BANNERS;
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // In-flight operation deduplication to guarantee idempotency and prevent double-clicks
  const inFlightDepositsRef = useRef<Set<string>>(new Set());
  const inFlightOrdersRef = useRef<Set<string>>(new Set());
  const inFlightPurchasesRef = useRef<boolean>(false);

  useEffect(() => {
    localStorage.setItem('dc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dc_notice', JSON.stringify(notice));
  }, [notice]);

  useEffect(() => {
    localStorage.setItem('dc_banners', JSON.stringify(banners));
  }, [banners]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Listen to Firebase Auth State Changes & live user document
  // Sole source of truth for logged-in/logged-out state!
  useEffect(() => {
    // Clear any previous mock user cache from localStorage
    localStorage.removeItem('dc_user');

    let userUnsub: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (userUnsub) {
        userUnsub();
        userUnsub = null;
      }

      if (!firebaseUser) {
        setCurrentUser(null);
        setIsAuthReady(true);
        return;
      }

      const userRef = doc(db, 'users', firebaseUser.uid);

      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const initialDoc: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'গ্রাহক'),
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            walletBalance: 0.00,
            role: 'customer',
            status: 'active',
            joinedAt: new Date().toISOString().split('T')[0]
          };
          await setDoc(userRef, {
            ...initialDoc,
            createdAt: serverTimestamp()
          }, { merge: true });
          setCurrentUser(initialDoc);
        } else {
          const data = snap.data();
          setCurrentUser({
            id: firebaseUser.uid,
            name: data.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'গ্রাহক'),
            email: data.email || firebaseUser.email || '',
            phone: data.phone || firebaseUser.phoneNumber || '',
            walletBalance: typeof data.walletBalance === 'number' ? data.walletBalance : 0.00,
            role: data.role || 'customer',
            status: data.status || 'active',
            joinedAt: data.joinedAt || new Date().toISOString().split('T')[0],
            photoURL: firebaseUser.photoURL || data.photoURL || '',
            savedGameUid: data.savedGameUid || ''
          });
        }
      } catch (e) {
        console.warn('Initial user doc check note:', e);
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'গ্রাহক'),
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          walletBalance: 0.00,
          role: 'customer',
          status: 'active',
          joinedAt: new Date().toISOString().split('T')[0]
        });
      }

      // Real-time live listener for current user document
      userUnsub = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentUser((prev) => ({
            id: firebaseUser.uid,
            name: data.name || firebaseUser.displayName || prev?.name || 'গ্রাহক',
            email: data.email || firebaseUser.email || prev?.email || '',
            phone: data.phone || firebaseUser.phoneNumber || prev?.phone || '',
            walletBalance: typeof data.walletBalance === 'number' ? data.walletBalance : (prev?.walletBalance ?? 0.00),
            role: data.role || 'customer',
            status: data.status || 'active',
            joinedAt: data.joinedAt || prev?.joinedAt || new Date().toISOString().split('T')[0],
            photoURL: firebaseUser.photoURL || data.photoURL || prev?.photoURL || '',
            savedGameUid: data.savedGameUid || prev?.savedGameUid || ''
          }));
        }
      }, (err) => {
        console.warn('User snapshot subscription note:', err);
      });

      setIsAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (userUnsub) userUnsub();
    };
  }, []);

  // Real-time Firestore sync for deposits collection (scoped by role to prevent permission denied)
  useEffect(() => {
    if (!currentUser) {
      setDeposits([]);
      return;
    }
    try {
      const q = currentUser.role === 'admin'
        ? collection(db, 'deposits')
        : query(collection(db, 'deposits'), where('userId', '==', currentUser.id));

      const unsub = onSnapshot(q, (snapshot) => {
        const firestoreDeposits: DepositRequest[] = [];
        snapshot.forEach((d) => {
          firestoreDeposits.push({ ...(d.data() as DepositRequest), id: d.id });
        });
        setDeposits(firestoreDeposits);
      }, (err) => {
        console.warn('Firestore deposits live listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore deposits subscription error:', e);
    }
  }, [currentUser?.id, currentUser?.role]);

  // Real-time Firestore sync for orders collection (scoped by role to prevent permission denied)
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }
    try {
      const q = currentUser.role === 'admin'
        ? collection(db, 'orders')
        : query(collection(db, 'orders'), where('userId', '==', currentUser.id));

      const unsub = onSnapshot(q, (snapshot) => {
        const firestoreOrders: Order[] = [];
        snapshot.forEach((o) => {
          firestoreOrders.push({ ...(o.data() as Order), id: o.id });
        });
        setOrders(firestoreOrders);
      }, (err) => {
        console.warn('Firestore orders live listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore orders subscription error:', e);
    }
  }, [currentUser?.id, currentUser?.role]);
  // Real-time Firestore sync for products collection (read by public store & admin)
  useEffect(() => {
    try {
      const productsColl = collection(db, 'products');
      const unsub = onSnapshot(productsColl, (snapshot) => {
        if (!snapshot.empty) {
          const firestoreProducts: TopUpProduct[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const normPackages: TopUpPackage[] = Array.isArray(data.packages)
              ? data.packages.map((pkg: any, idx: number) => ({
                  id: pkg.id || `pkg_${idx}`,
                  name: pkg.name || '',
                  amount: pkg.amount || pkg.diamonds || pkg.name || '',
                  diamonds: pkg.diamonds || pkg.amount || pkg.name || '',
                  price: Number(pkg.price || 0),
                  originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
                  popular: !!pkg.popular,
                  instantDelivery: pkg.instantDelivery !== false,
                  isOutOfStock: !!pkg.isOutOfStock
                }))
              : [];

            firestoreProducts.push({
              id: docSnap.id,
              title: data.title || '',
              description: data.description || '',
              bannerImageUrl: data.bannerImageUrl || data.image || '',
              image: data.bannerImageUrl || data.image || '/images/dc_topup_logo_1790094683501.jpg',
              badgeTag: data.badgeTag || data.badge || '',
              badge: data.badgeTag || data.badge || '',
              isActive: data.isActive !== false,
              sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 999,
              category: data.category || 'gaming',
              subCategory: data.subCategory || '',
              playerIdLabel: data.playerIdLabel || 'Player ID (UID)',
              requiresZoneId: !!data.requiresZoneId,
              zoneIdLabel: data.zoneIdLabel || '',
              bannerGradient: data.bannerGradient || 'from-blue-600/30 to-purple-950/40',
              packages: normPackages,
              isOutOfStock: !!data.isOutOfStock
            });
          });

          firestoreProducts.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
          setProducts(firestoreProducts);
        } else {
          // Auto-seed initial products into Firestore if empty
          INITIAL_PRODUCTS.forEach(async (p, i) => {
            try {
              await setDoc(doc(db, 'products', p.id), {
                id: p.id,
                title: p.title,
                description: p.description,
                bannerImageUrl: p.bannerImageUrl || p.image,
                image: p.bannerImageUrl || p.image,
                badgeTag: p.badgeTag || p.badge || '',
                badge: p.badgeTag || p.badge || '',
                isActive: p.isActive !== false,
                sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : i + 1,
                category: p.category,
                subCategory: p.subCategory || '',
                playerIdLabel: p.playerIdLabel || 'Player ID (UID)',
                requiresZoneId: !!p.requiresZoneId,
                zoneIdLabel: p.zoneIdLabel || '',
                bannerGradient: p.bannerGradient || 'from-blue-600/30 to-purple-950/40',
                packages: p.packages.map((pkg, idx) => ({
                  id: pkg.id || `pkg_${idx}`,
                  name: pkg.name,
                  amount: pkg.amount || pkg.diamonds || '',
                  diamonds: pkg.diamonds || pkg.amount || '',
                  price: Number(pkg.price),
                  originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
                  popular: !!pkg.popular,
                  instantDelivery: pkg.instantDelivery !== false,
                  isOutOfStock: !!pkg.isOutOfStock
                })),
                isOutOfStock: !!p.isOutOfStock,
                createdAt: serverTimestamp()
              }, { merge: true });
            } catch (seedErr) {
              console.warn('Auto seed product error:', seedErr);
            }
          });
        }
      }, (err) => {
        console.warn('Firestore products live listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore products subscription error:', e);
    }
  }, []);

  // Real-time Firestore sync for siteConfig/homepage (banners & notice)
  useEffect(() => {
    try {
      const siteConfigRef = doc(db, 'siteConfig', 'homepage');
      const unsub = onSnapshot(siteConfigRef, async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.notice) {
            setNotice({
              id: 'notice_live',
              text: data.notice.text || '',
              date: data.notice.date || data.notice.updatedAt || '১ অক্টোবর, ২০২৬',
              updatedAt: data.notice.date || data.notice.updatedAt || new Date().toISOString().split('T')[0],
              type: data.notice.type || 'offer',
              isActive: data.notice.isActive !== false
            });
          }
          if (Array.isArray(data.banners) && data.banners.length > 0) {
            setBanners(data.banners.map((b: any, idx: number) => ({
              id: b.id || `banner_${idx}`,
              title: b.title || '',
              subtitle: b.subtitle || '',
              imageUrl: b.imageUrl || '/dc_logo.jpg',
              linkUrl: b.linkUrl || '',
              badge: b.badge || 'অফার',
              actionTab: b.actionTab || 'deposit',
              actionText: b.actionText || 'টাকা যোগ করুন',
              isActive: b.isActive !== false
            })));
          }
        } else {
          // If document does not exist yet in Firestore, seed with initial banners & notice
          try {
            await setDoc(siteConfigRef, {
              notice: {
                text: INITIAL_NOTICE.text,
                date: INITIAL_NOTICE.date || INITIAL_NOTICE.updatedAt || '১ অক্টোবর, ২০২৬',
                isActive: INITIAL_NOTICE.isActive,
                type: INITIAL_NOTICE.type || 'offer'
              },
              banners: INITIAL_BANNERS.map((b) => ({
                id: b.id,
                imageUrl: b.imageUrl,
                title: b.title,
                subtitle: b.subtitle || '',
                linkUrl: b.linkUrl || '',
                badge: b.badge || '',
                actionTab: b.actionTab || 'deposit',
                actionText: b.actionText || 'টাকা যোগ করুন',
                isActive: b.isActive !== false
              })),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (seedErr) {
            console.warn('Auto seed siteConfig note (will persist when admin saves):', seedErr);
          }
        }
      }, (err) => {
        console.warn('siteConfig snapshot listener note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('siteConfig listener error:', e);
    }
  }, []);

  // Real-time Firestore sync for users collection (accessible by admin only)
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setAllUsers([]);
      return;
    }
    try {
      const usersColl = collection(db, 'users');
      const unsub = onSnapshot(usersColl, (snapshot) => {
        const list: User[] = [];
        snapshot.forEach((u) => {
          const d = u.data();
          list.push({
            id: u.id,
            name: d.name || 'গ্রাহক',
            email: d.email || '',
            phone: d.phone || '',
            walletBalance: typeof d.walletBalance === 'number' ? d.walletBalance : 0.00,
            role: d.role || 'customer',
            status: d.status || 'active',
            joinedAt: d.joinedAt || '২০২৬',
            photoURL: d.photoURL || '',
            savedGameUid: d.savedGameUid || ''
          });
        });
        setAllUsers(list);
      }, (err) => {
        console.warn('Firestore users live subscription note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Users listener setup error:', e);
    }
  }, [currentUser?.id, currentUser?.role]);

  const signupWithEmail = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) return { success: false, error: 'আপনার পুরো নাম লিখুন।' };
    if (!email.trim() || !email.includes('@')) return { success: false, error: 'সঠিক ইমেইল ঠিকানা দিন।' };
    if (!password || password.length < 6) return { success: false, error: 'পাসওয়ার্ড খুব দুর্বল, কমপক্ষে ৬ ক্যারেক্টার দিন।' };

    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. Call Firebase Auth createUserWithEmailAndPassword
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const firebaseUser = userCred.user;

      if (name.trim()) {
        try {
          await updateProfile(firebaseUser, { displayName: name.trim() });
        } catch (pErr) {
          console.warn('Update profile note:', pErr);
        }
      }

      // 2. ONLY create Firestore users/{uid} document AFTER createUserWithEmailAndPassword succeeds!
      const userDocData: User = {
        id: firebaseUser.uid,
        name: name.trim(),
        email: cleanEmail,
        phone: '',
        walletBalance: 0.00,
        role: 'customer',
        status: 'active',
        joinedAt: new Date().toISOString().split('T')[0]
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userDocData,
        createdAt: serverTimestamp()
      }, { merge: true });

      showToast(`অভিনন্দন ${name.trim()}! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।`, 'success');
      return { success: true };
    } catch (authErr: any) {
      console.warn('Firebase createUser note:', authErr?.code || authErr?.message);
      let errorMsg = 'অ্যাকাউন্ট তৈরি করা যায়নি, আবার চেষ্টা করুন।';
      const code = authErr?.code || '';
      if (code === 'auth/email-already-in-use') {
        errorMsg = 'এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট তৈরি করা আছে। লগইন করুন।';
      } else if (code === 'auth/weak-password') {
        errorMsg = 'পাসওয়ার্ড খুব দুর্বল, কমপক্ষে ৬ ক্যারেক্টার দিন।';
      } else if (code === 'auth/invalid-email') {
        errorMsg = 'অবৈধ ইমেইল ঠিকানা।';
      }
      return { success: false, error: errorMsg };
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.trim() || !password) {
      return { success: false, error: 'ইমেইল এবং পাসওয়ার্ড পূরণ করুন।' };
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. Call real Firebase Auth signInWithEmailAndPassword
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const displayName = userCred.user.displayName || cleanEmail.split('@')[0];
      showToast(`স্বাগতম, ${displayName}! লগইন সফল হয়েছে।`, 'success');
      return { success: true };
    } catch (authErr: any) {
      console.warn('Firebase signIn note:', authErr?.code || authErr?.message);
      let errorMsg = 'ভুল ইমেইল বা পাসওয়ার্ড। আবার চেষ্টা করুন।';
      const code = authErr?.code || '';
      if (code === 'auth/user-not-found') {
        errorMsg = 'কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন-আপ করুন।';
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        errorMsg = 'ভুল ইমেইল বা পাসওয়ার্ড। সঠিক তথ্য দিন।';
      } else if (code === 'auth/invalid-email') {
        errorMsg = 'ইমেইল ঠিকানাটি সঠিক নয়।';
      } else if (code === 'auth/user-disabled') {
        errorMsg = 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।';
      } else if (code === 'auth/too-many-requests') {
        errorMsg = 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      }
      // CRITICAL: Do NOT set any user state or grant access on error!
      return { success: false, error: errorMsg };
    }
  };

  const loginWithPhone = (phone: string, name?: string) => {
    showToast('মোবাইল ওটিপি লগইন সাময়িকভাবে বন্ধ আছে। দয়া করে Google অথবা Email ও পাসওয়ার্ড দিয়ে লগইন করুন।', 'info');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out note:', e);
    }
    setCurrentUser(null);
    setIsAdminMode(false);
    localStorage.removeItem('dc_user');
    showToast('লগআউট সফল হয়েছে।', 'info');
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!auth.currentUser || !currentUser) {
      showToast('প্রোফাইল আপডেট করতে প্রথমে লগইন করুন।', 'error');
      return;
    }

    // Sanitize: never allow role, walletBalance, or status to be changed by profile update
    const allowedUpdates: any = {};
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
    if (updates.email !== undefined) allowedUpdates.email = updates.email;
    if (updates.savedGameUid !== undefined) allowedUpdates.savedGameUid = updates.savedGameUid;
    if (updates.photoURL !== undefined) allowedUpdates.photoURL = updates.photoURL;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), allowedUpdates);
      setCurrentUser((prev) => (prev ? { ...prev, ...allowedUpdates } : null));
      showToast('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!', 'success');
    } catch (err: any) {
      console.warn('Update profile note:', err?.message || err);
      showToast('প্রোফাইল আপডেট করা যায়নি।', 'error');
    }
  };

  const submitDeposit = async (method: PaymentMethodType, amount: number, senderPhone: string, trxId: string): Promise<boolean> => {
    if (!auth.currentUser || !currentUser) {
      showToast('ডিপোজিট করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।', 'error');
      setActiveTab('login');
      return false;
    }

    if (currentUser.status === 'banned') {
      showToast('আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Banned) করা হয়েছে। ডিপোজিট গ্রহণ করা সম্ভব নয়।', 'error');
      return false;
    }

    const newDeposit: DepositRequest = {
      id: 'DEP-' + Math.floor(1000 + Math.random() * 9000),
      userId: auth.currentUser.uid, // REAL Firebase Auth UID
      userName: currentUser.name || auth.currentUser.displayName || 'গ্রাহক',
      method,
      amount,
      senderPhone,
      trxId: trxId.trim().toUpperCase(),
      status: 'pending',
      createdAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Persist directly to Firestore deposits collection
    try {
      await setDoc(doc(db, 'deposits', newDeposit.id), {
        ...newDeposit,
        userEmail: auth.currentUser.email || '',
        createdAtTimestamp: serverTimestamp()
      }, { merge: true });

      setDeposits((prev) => [newDeposit, ...prev.filter((d) => d.id !== newDeposit.id)]);
      showToast('ডিপোজিট রিকোয়েস্ট জমা হয়েছে! এডমিন যাচাই করে ব্যালেন্স যোগ করবেন।', 'success');
      return true;
    } catch (fsErr: any) {
      console.warn('Firestore submitDeposit note:', fsErr?.message || fsErr);
      showToast(`ডিপোজিট জমা দিতে সমস্যা হয়েছে: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
      return false;
    }
  };

  const purchaseProduct = async (
    productId: string,
    packageId: string,
    playerId: string,
    zoneId?: string
  ): Promise<{ success: boolean; error?: string; order?: Order }> => {
    if (!auth.currentUser || !currentUser) {
      showToast('অর্ডার করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।', 'error');
      setActiveTab('login');
      return { success: false, error: 'অর্ডার করতে অনুগ্রহ করে লগইন করুন।' };
    }

    if (inFlightPurchasesRef.current) {
      return { success: false, error: 'অর্ডার প্রক্রিয়া চলছে, অনুগ্রহ করে অপেক্ষা করুন...' };
    }
    inFlightPurchasesRef.current = true;

    try {
      const userUid = auth.currentUser.uid;

      if (currentUser.status === 'banned') {
        showToast('আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Banned) করা হয়েছে। নতুন অর্ডার করা সম্ভব নয়।', 'error');
        return { success: false, error: 'অ্যাকাউন্ট স্থগিত (Banned) রয়েছে।' };
      }

      const product = products.find((p) => p.id === productId);
      if (!product) return { success: false, error: 'পণ্য খুঁজে পাওয়া যায়নি।' };

      if (product.isOutOfStock) {
        return { success: false, error: 'দুঃখিত, এই প্রোডাক্টটি বর্তমানে স্টক আউট (Out of Stock)।' };
      }

      const pkg = product.packages.find((p) => p.id === packageId);
      if (!pkg) return { success: false, error: 'প্যাকেজ খুঁজে পাওয়া যায়নি।' };

      if (pkg.isOutOfStock) {
        return { success: false, error: `দুঃখিত, '${pkg.name}' প্যাকেজটি বর্তমানে স্টক আউট (Out of Stock)।` };
      }

      const orderPrice = Number(pkg.price);
      const orderId = 'ORD-' + Math.floor(5000 + Math.random() * 5000);
      const serverRef = '#DC-' + Math.floor(100000 + Math.random() * 900000);
      const nowTimeStr = formatOrderDateTime(new Date());

      const newOrder: Order = {
        id: orderId,
        userId: userUid,
        userName: currentUser.name || auth.currentUser.displayName || 'গ্রাহক',
        productId: product.id,
        productTitle: product.title,
        packageId: pkg.id,
        packageName: `${pkg.name} (${pkg.amount || pkg.diamonds || ''})`,
        price: orderPrice,
        playerId,
        zoneId: zoneId || '',
        status: 'pending',
        createdAt: nowTimeStr,
        serverRef,
        estimatedDeliverySeconds: 8,
        notes: 'অর্ডার সিস্টেমে গৃহীত হয়েছে। ওয়ালেট থেকে টাকা কর্তন সম্পন্ন।'
      };

      const userRef = doc(db, 'users', userUid);
      const orderRef = doc(db, 'orders', orderId);

      let finalDeductedBalance = 0;

      // STEP 1: Use a transaction ONLY to validate balance and create the order document.
      // We deliberately do NOT write to userRef inside this transaction.
      // Reason: The Firestore security rule for orders/{id} create calls isNotBanned() which
      // internally does get(users/{uid}). If the same transaction also writes to users/{uid},
      // Firestore's rule evaluator sees a conflict — and rejects with 'Missing or insufficient
      // permissions', even when balance is sufficient. Fix: write to userRef AFTER commit.
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('গ্রাহক অ্যাকাউন্ট ডাটাবেজে পাওয়া যায়নি।');
        }

        const userData = userSnap.data();
        if (userData.status === 'banned') {
          throw new Error('আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Banned) করা হয়েছে।');
        }

        const currentBal = typeof userData.walletBalance === 'number' ? userData.walletBalance : 0.00;
        if (currentBal < orderPrice) {
          throw new Error('পর্যাপ্ত ব্যালেন্স নেই, আগে ওয়ালেটে টাকা যোগ করুন');
        }

        finalDeductedBalance = Number((currentBal - orderPrice).toFixed(2));

        // a. Create the order document with status "pending" (MUST be pending)
        transaction.set(orderRef, {
          ...newOrder,
          userEmail: auth.currentUser?.email || '',
          createdAtTimestamp: serverTimestamp()
        });

      });

      // STEP 2: Deduct walletBalance in a separate write AFTER the order is committed.
      // At this point the order already exists in Firestore with status 'pending'.
      // The users rule allows a non-admin owner to decrement walletBalance (>= 0).
      await updateDoc(userRef, {
        walletBalance: finalDeductedBalance,
        savedGameUid: playerId
      });

      // Update local states immediately upon successful commit
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              walletBalance: finalDeductedBalance,
              savedGameUid: playerId
            }
          : null
      );

      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      setActiveTrackingOrderId(newOrder.id);

      showToast(`অর্ডার সফল! ৳ ${orderPrice} ওয়ালেট থেকে কেটে নেওয়া হয়েছে এবং অর্ডার কিউতে জমা হয়েছে।`, 'success');
      return { success: true, order: newOrder };
    } catch (fsErr: any) {
      console.error('Firestore runTransaction purchaseProduct error:', fsErr);
      const errMsg = fsErr?.message || 'অর্ডার সম্পন্ন করা সম্ভব হয়নি।';
      if (errMsg.includes('পর্যাপ্ত ব্যালেন্স নেই')) {
        showToast('পর্যাপ্ত ব্যালেন্স নেই, আগে ওয়ালেটে টাকা যোগ করুন', 'error');
        return { success: false, error: 'পর্যাপ্ত ব্যালেন্স নেই, আগে ওয়ালেটে টাকা যোগ করুন' };
      }
      showToast(`অর্ডার সম্পন্ন করা সম্ভব হয়নি: ${errMsg}`, 'error');
      return { success: false, error: errMsg };
    } finally {
      inFlightPurchasesRef.current = false;
    }
  };

  const approveDeposit = async (depositId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ডিপোজিট অনুমোদন করতে পারেন।', 'error');
      return;
    }

    if (inFlightDepositsRef.current.has(depositId)) {
      return; // Already in flight, ignore duplicate click
    }
    inFlightDepositsRef.current.add(depositId);

    const nowStr = new Date().toLocaleDateString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
      let creditedAmount = 0;
      let targetUserId = '';
      let newBalance = 0;

      // ATOMIC TRANSACTION: 1. Verify pending status -> 2. Increment wallet balance -> 3. Mark approved
      await runTransaction(db, async (transaction) => {
        const depRef = doc(db, 'deposits', depositId);
        const depSnap = await transaction.get(depRef);

        if (!depSnap.exists()) {
          throw new Error('ডিপোজিট রেকর্ড পাওয়া যায়নি।');
        }

        const depData = depSnap.data();
        if (depData.status === 'approved') {
          throw new Error('এই ডিপোজিটটি ইতিমধ্যেই অনুমোদিত হয়েছে।');
        }
        if (depData.status !== 'pending') {
          throw new Error(`এই ডিপোজিটের বর্তমান স্ট্যাটাস '${depData.status}', অনুমোদন করা সম্ভব নয়।`);
        }

        creditedAmount = Number(depData.amount || 0);
        targetUserId = depData.userId;

        if (targetUserId) {
          const userRef = doc(db, 'users', targetUserId);
          const userSnap = await transaction.get(userRef);
          if (userSnap.exists()) {
            const currentBal = typeof userSnap.data().walletBalance === 'number' ? userSnap.data().walletBalance : 0.00;
            newBalance = Number((currentBal + creditedAmount).toFixed(2));
            transaction.update(userRef, {
              walletBalance: newBalance
            });
          }
        }

        transaction.update(depRef, {
          status: 'approved',
          verifiedAt: nowStr,
          verifiedBy: currentUser.id
        });
      });

      // Update local state
      setDeposits((prev) =>
        prev.map((d) =>
          d.id === depositId
            ? {
                ...d,
                status: 'approved',
                verifiedAt: nowStr
              }
            : d
        )
      );

      if (targetUserId === currentUser.id) {
        setCurrentUser((prev) => (prev ? {
          ...prev,
          walletBalance: newBalance
        } : null));
      }

      showToast(`ডিপোজিট ${depositId} (৳ ${creditedAmount}) সফলভাবে অনুমোদন ও ওয়ালেটে যুক্ত হয়েছে!`, 'success');
    } catch (fsErr: any) {
      console.error('Firestore runTransaction approveDeposit error:', fsErr);
      showToast(`ডিপোজিট অনুমোদন ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    } finally {
      inFlightDepositsRef.current.delete(depositId);
    }
  };

  const rejectDeposit = async (depositId: string, reason: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ডিপোজিট বাতিল করতে পারেন।', 'error');
      return;
    }

    if (inFlightDepositsRef.current.has(depositId)) {
      return;
    }
    inFlightDepositsRef.current.add(depositId);

    const nowStr = new Date().toLocaleDateString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'rejected',
        rejectReason: reason || 'লেনদেন ভেরিফিকেশন ব্যর্থ হয়েছে।',
        verifiedAt: nowStr,
        verifiedBy: currentUser.id
      });

      setDeposits((prev) =>
        prev.map((d) =>
          d.id === depositId
            ? {
                ...d,
                status: 'rejected',
                rejectReason: reason || 'লেনদেন ভেরিফিকেশন ব্যর্থ হয়েছে।',
                verifiedAt: nowStr
              }
            : d
        )
      );
      showToast(`ডিপোজিট ${depositId} সরাসরি Firestore-এ রিজেক্ট করা হয়েছে।`, 'info');
    } catch (fsErr: any) {
      console.error('Firestore updateDoc reject deposit error:', fsErr);
      showToast(`Firestore রিজেক্ট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    } finally {
      inFlightDepositsRef.current.delete(depositId);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা অর্ডার স্ট্যাটাস আপডেট করতে পারেন।', 'error');
      return;
    }

    if (inFlightOrdersRef.current.has(orderId)) {
      return; // Already in-flight
    }
    inFlightOrdersRef.current.add(orderId);

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      inFlightOrdersRef.current.delete(orderId);
      return;
    }

    const nowTime = formatOrderDateTime(new Date());

    const isCancelling = status === 'rejected' || status === 'cancelled';
    const shouldRefund = isCancelling && !targetOrder.refunded && targetOrder.price > 0 && !!targetOrder.userId;

    const updateFields: any = {
      status,
      notes: notes || (status === 'delivered' ? 'ডেলিভারি সম্পন্ন।' : status === 'processing' ? 'সার্ভার প্রসেসিং চলছে...' : status === 'pending' ? 'অপেক্ষমাণ।' : 'অর্ডারটি বাতিল ও রিফান্ড করা হয়েছে।')
    };

    if (status === 'delivered') updateFields.deliveredAt = nowTime;
    if (status === 'processing') updateFields.processingAt = nowTime;

    const refundDepId = `REFUND-${targetOrder.id}`;
    let refundDepositObj: DepositRequest | null = null;
    let finalRefundedBalance: number | null = null;

    try {
      if (shouldRefund) {
        // ATOMIC TRANSACTION: 1. Update order -> 2. Refund walletBalance -> 3. Create approved refund deposit record
        await runTransaction(db, async (transaction) => {
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) {
            throw new Error('অর্ডার ডকুমেন্ট পাওয়া যায়নি।');
          }

          const currentOrderData = orderSnap.data();
          if (currentOrderData.refunded) {
            // Already refunded, avoid double refunding
            transaction.update(orderRef, { status, notes: notes || currentOrderData.notes });
            return;
          }

          const userRef = doc(db, 'users', targetOrder.userId);
          const userSnap = await transaction.get(userRef);

          let currentBal = 0.00;
          let userEmail = targetOrder.userEmail || '';
          let userName = targetOrder.userName || 'গ্রাহক';

          if (userSnap.exists()) {
            const uData = userSnap.data();
            currentBal = typeof uData.walletBalance === 'number' ? uData.walletBalance : 0.00;
            userEmail = uData.email || userEmail;
            userName = uData.name || userName;
          }

          finalRefundedBalance = Number((currentBal + targetOrder.price).toFixed(2));

          refundDepositObj = {
            id: refundDepId,
            userId: targetOrder.userId,
            userName,
            userEmail,
            method: 'refund',
            type: 'refund',
            amount: targetOrder.price,
            senderPhone: 'রিফান্ড সিস্টেম (DC Refund)',
            trxId: refundDepId,
            status: 'approved',
            orderId: targetOrder.id,
            createdAt: nowTime,
            verifiedAt: nowTime,
            verifiedBy: currentUser.id,
            rejectReason: notes || `অর্ডার #${targetOrder.id} (${targetOrder.productTitle}) বাতিলের মূল্য ফেরত (Refund)`
          };

          const refundRef = doc(db, 'deposits', refundDepId);

          // 1. Update order
          transaction.update(orderRef, {
            ...updateFields,
            refunded: true,
            refundedAt: nowTime
          });

          // 2. Increment user's walletBalance
          if (userSnap.exists()) {
            transaction.update(userRef, {
              walletBalance: finalRefundedBalance
            });
          }

          // 3. Create refund deposit record
          transaction.set(refundRef, {
            ...refundDepositObj,
            createdAtTimestamp: serverTimestamp()
          });
        });

        // Update local states on successful transaction
        if (refundDepositObj) {
          setDeposits((prev) => [refundDepositObj!, ...prev.filter((d) => d.id !== refundDepId)]);
        }

        if (finalRefundedBalance !== null) {
          if (targetOrder.userId === currentUser.id) {
            setCurrentUser((prev) => prev ? { ...prev, walletBalance: finalRefundedBalance! } : null);
          }
          setAllUsers((prev) => prev.map((u) => u.id === targetOrder.userId ? { ...u, walletBalance: finalRefundedBalance! } : u));
        }

        showToast(`অর্ডার #${orderId} বাতিল করা হয়েছে এবং ৳ ${targetOrder.price} সফলভাবে ওয়ালেটে রিফান্ড হয়েছে (Transaction সফল)!`, 'success');
      } else {
        // Non-refund status update
        await updateDoc(doc(db, 'orders', orderId), updateFields);
        showToast(`অর্ডার #${orderId} স্ট্যাটাস সরাসরি Firestore-এ ${status.toUpperCase()} করা হয়েছে!`, 'info');
      }
    } catch (fsErr: any) {
      console.error('Firestore runTransaction updateOrderStatus error:', fsErr);
      showToast(`Firestore অর্ডার আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    } finally {
      inFlightOrdersRef.current.delete(orderId);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              ...updateFields,
              ...(shouldRefund ? { refunded: true, refundedAt: nowTime } : {})
            }
          : o
      )
    );
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা অর্ডার মুছতে পারেন।', 'error');
      return false;
    }

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(`অর্ডার #${orderId} সফলভাবে মুছে ফেলা হয়েছে!`, 'success');
      return true;
    } catch (fsErr: any) {
      console.error('Firestore deleteDoc order error:', fsErr);
      showToast(`অর্ডার ডিলিট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
      return false;
    }
  };

  const seedProductsToFirestore = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ক্যাটালগ সিড করতে পারেন।', 'error');
      return;
    }

    try {
      showToast('Firestore-এ প্রোডাক্ট ডাটা সিড হচ্ছে...', 'info');
      for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
        const p = INITIAL_PRODUCTS[i];
        const docRef = doc(db, 'products', p.id);
        const data = {
          id: p.id,
          title: p.title,
          description: p.description,
          bannerImageUrl: p.bannerImageUrl || p.image,
          image: p.bannerImageUrl || p.image,
          badgeTag: p.badgeTag || p.badge || 'Special Offer',
          badge: p.badgeTag || p.badge || 'Special Offer',
          isActive: p.isActive !== false,
          sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : i + 1,
          category: p.category,
          subCategory: p.subCategory || '',
          playerIdLabel: p.playerIdLabel || 'Player ID (UID)',
          requiresZoneId: !!p.requiresZoneId,
          zoneIdLabel: p.zoneIdLabel || '',
          bannerGradient: p.bannerGradient || 'from-blue-600/30 to-purple-950/40',
          packages: p.packages.map((pkg, idx) => ({
            id: pkg.id || `pkg_${idx}`,
            name: pkg.name,
            amount: pkg.amount || pkg.diamonds || '',
            diamonds: pkg.diamonds || pkg.amount || '',
            price: Number(pkg.price),
            originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
            popular: !!pkg.popular,
            instantDelivery: pkg.instantDelivery !== false,
            isOutOfStock: !!pkg.isOutOfStock
          })),
          isOutOfStock: !!p.isOutOfStock,
          createdAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });
      }
      showToast('সবগুলো প্রোডাক্ট সফলভাবে Firestore "products" কালেকশনে সংরক্ষিত হয়েছে!', 'success');
    } catch (err: any) {
      console.error('Firestore seed products error:', err);
      showToast(`Firestore সিড ত্রুটি: ${err?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const addProduct = async (product: TopUpProduct) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা নতুন প্রোডাক্ট যোগ করতে পারেন।', 'error');
      return;
    }

    const id = product.id && product.id.trim()
      ? product.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : 'prod_' + Math.random().toString(36).substring(2, 9);

    const bannerImg = product.bannerImageUrl || product.image || '/images/dc_topup_logo_1790094683501.jpg';
    const badgeText = product.badgeTag || product.badge || '';

    const newProductDoc: TopUpProduct = {
      ...product,
      id,
      title: product.title.trim(),
      description: product.description.trim(),
      bannerImageUrl: bannerImg,
      image: bannerImg,
      badgeTag: badgeText,
      badge: badgeText,
      isActive: product.isActive !== false,
      sortOrder: product.sortOrder || products.length + 1,
      category: product.category || 'gaming',
      subCategory: product.subCategory || 'Special Offer',
      playerIdLabel: product.playerIdLabel || 'Player ID (UID)',
      requiresZoneId: !!product.requiresZoneId,
      zoneIdLabel: product.zoneIdLabel || '',
      bannerGradient: product.bannerGradient || 'from-blue-600/30 to-purple-950/40',
      packages: (product.packages || []).map((pkg, idx) => ({
        id: pkg.id || `pkg_${Date.now()}_${idx}`,
        name: pkg.name,
        price: Number(pkg.price),
        amount: pkg.amount || pkg.diamonds || pkg.name,
        diamonds: pkg.diamonds || pkg.amount || pkg.name,
        originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
        popular: !!pkg.popular,
        instantDelivery: pkg.instantDelivery !== false,
        isOutOfStock: !!pkg.isOutOfStock
      })),
      isOutOfStock: !!product.isOutOfStock
    };

    try {
      await setDoc(doc(db, 'products', id), newProductDoc);
      setProducts((prev) => [newProductDoc, ...prev.filter((p) => p.id !== id)]);
      showToast(`নতুন প্রোডাক্ট '${product.title}' সফলভাবে Firestore-এ যোগ করা হয়েছে!`, 'success');
    } catch (fsErr: any) {
      console.error('Firestore add product error:', fsErr);
      showToast(`Firestore প্রোডাক্ট যোগে ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const updateProduct = async (updatedProduct: TopUpProduct) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্রোডাক্ট আপডেট করতে পারেন।', 'error');
      return;
    }

    try {
      const bannerImg = updatedProduct.bannerImageUrl || updatedProduct.image;
      const badgeText = updatedProduct.badgeTag || updatedProduct.badge || '';
      const docData = {
        ...updatedProduct,
        bannerImageUrl: bannerImg,
        image: bannerImg,
        badgeTag: badgeText,
        badge: badgeText,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'products', updatedProduct.id), docData, { merge: true });
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...docData } : p)));
      showToast(`প্রোডাক্ট '${updatedProduct.title}' সরাসরি Firestore-এ আপডেট হয়েছে!`, 'success');
    } catch (fsErr: any) {
      console.error('Firestore update product error:', fsErr);
      showToast(`Firestore প্রোডাক্ট আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্রোডাক্ট মুছতে পারেন।', 'error');
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('প্রোডাক্ট সরাসরি Firestore থেকে মুছে ফেলা হয়েছে!', 'info');
    } catch (fsErr: any) {
      console.error('Firestore delete product error:', fsErr);
      showToast(`Firestore প্রোডাক্ট ডিলিট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const toggleProductActive = async (productId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্রোডাক্ট হাইড/শো করতে পারেন।', 'error');
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newActive = prod.isActive === false ? true : false;
    try {
      await updateDoc(doc(db, 'products', productId), {
        isActive: newActive
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isActive: newActive } : p))
      );
      showToast(
        `প্রোডাক্ট '${prod.title}' এখন ${newActive ? 'পাবলিক স্টোরে দৃশ্যমান (Active)' : 'লুকানো (Hidden/Inactive)'}!`,
        newActive ? 'success' : 'info'
      );
    } catch (fsErr: any) {
      console.error('Firestore toggle active error:', fsErr);
      showToast(`Firestore স্ট্যাটাস পরিবর্তন ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const toggleProductStock = async (productId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা স্টক নিয়ন্ত্রণ করতে পারেন।', 'error');
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newStock = !prod.isOutOfStock;
    try {
      await updateDoc(doc(db, 'products', productId), {
        isOutOfStock: newStock
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isOutOfStock: newStock } : p))
      );
      showToast(
        `প্রোডাক্ট '${prod.title}' এখন ${newStock ? 'স্টক আউট (Stock Out)' : 'স্টকে রয়েছে (In Stock)'}!`,
        newStock ? 'info' : 'success'
      );
    } catch (fsErr: any) {
      console.error('Firestore toggle stock error:', fsErr);
      showToast(`Firestore স্টক আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const togglePackageStock = async (productId: string, packageId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্যাকেজ স্টক নিয়ন্ত্রণ করতে পারেন।', 'error');
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const updatedPkgs = prod.packages.map((pkg) => {
      if (pkg.id !== packageId) return pkg;
      return { ...pkg, isOutOfStock: !pkg.isOutOfStock };
    });

    try {
      await updateDoc(doc(db, 'products', productId), {
        packages: updatedPkgs
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, packages: updatedPkgs } : p))
      );
      showToast('প্যাকেজ স্টক সফলভাবে আপডেট হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore toggle package stock error:', fsErr);
      showToast(`Firestore প্যাকেজ স্টক ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const updateProductImage = async (productId: string, newImageUrl: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ছবি পরিবর্তন করতে পারেন।', 'error');
      return;
    }

    try {
      await updateDoc(doc(db, 'products', productId), {
        bannerImageUrl: newImageUrl,
        image: newImageUrl
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, bannerImageUrl: newImageUrl, image: newImageUrl } : p))
      );
      showToast('প্রোডাক্ট ব্যানার ছবি সরাসরি Firestore-এ আপডেট হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore update product image error:', fsErr);
      showToast(`Firestore ব্যানার আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const updateProductPackages = async (productId: string, packages: TopUpPackage[]) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা প্যাকেজ পরিবর্তন করতে পারেন।', 'error');
      return;
    }

    const formattedPkgs = packages.map((pkg, idx) => ({
      id: pkg.id || `pkg_${Date.now()}_${idx}`,
      name: pkg.name,
      price: Number(pkg.price),
      amount: pkg.amount || pkg.diamonds || pkg.name,
      diamonds: pkg.diamonds || pkg.amount || pkg.name,
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : undefined,
      popular: !!pkg.popular,
      instantDelivery: pkg.instantDelivery !== false,
      isOutOfStock: !!pkg.isOutOfStock
    }));

    try {
      await updateDoc(doc(db, 'products', productId), {
        packages: formattedPkgs
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, packages: formattedPkgs } : p))
      );
      showToast('প্যাকেজ ও মূল্য তালিকা সরাসরি Firestore-এ আপডেট হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore update packages error:', fsErr);
      showToast(`Firestore প্যাকেজ আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const updateNotice = async (newNotice: Partial<AppNotice>) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা নোটিশ পরিবর্তন করতে পারেন।', 'error');
      return;
    }

    const dateVal = newNotice.date || notice.date || notice.updatedAt || new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const updated: AppNotice = {
      ...notice,
      ...newNotice,
      date: dateVal,
      updatedAt: dateVal
    };

    setNotice(updated);

    try {
      await setDoc(doc(db, 'siteConfig', 'homepage'), {
        notice: {
          text: updated.text,
          date: updated.date || updated.updatedAt,
          isActive: updated.isActive !== false,
          type: updated.type || 'offer'
        }
      }, { merge: true });
      showToast('হোমপেজ নোটিশ সরাসরি Firestore siteConfig-এ আপডেট হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore update notice error:', fsErr);
      showToast(`Firestore নোটিশ আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const saveAllBanners = async (newBanners: HomeBanner[]) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ব্যানার পরিবর্তন করতে পারেন।', 'error');
      return;
    }

    setBanners(newBanners);

    try {
      await setDoc(doc(db, 'siteConfig', 'homepage'), {
        banners: newBanners.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          imageUrl: b.imageUrl,
          linkUrl: b.linkUrl || '',
          badge: b.badge || '',
          actionTab: b.actionTab || 'deposit',
          actionText: b.actionText || 'টাকা যোগ করুন',
          isActive: b.isActive !== false
        }))
      }, { merge: true });
      showToast('ব্যানার তালিকা সরাসরি Firestore siteConfig-এ সংরক্ষিত হয়েছে!', 'success');
    } catch (fsErr: any) {
      console.error('Firestore save banners error:', fsErr);
      showToast(`Firestore ব্যানার আপডেট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const addBanner = async (banner: HomeBanner) => {
    const updated = [banner, ...banners];
    await saveAllBanners(updated);
  };

  const updateBanner = async (updatedBanner: HomeBanner) => {
    const updated = banners.map((b) => (b.id === updatedBanner.id ? updatedBanner : b));
    await saveAllBanners(updated);
  };

  const deleteBanner = async (bannerId: string) => {
    const updated = banners.filter((b) => b.id !== bannerId);
    await saveAllBanners(updated);
  };

  const reorderBanners = async (startIndex: number, endIndex: number) => {
    if (startIndex < 0 || endIndex < 0 || startIndex >= banners.length || endIndex >= banners.length) return;
    const result = Array.from(banners);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    await saveAllBanners(result);
  };

  const toggleUserBan = async (userId: string, newStatus: 'banned' | 'active') => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা ইউজার ব্যান/আনব্যান করতে পারেন।', 'error');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus
      });

      setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));

      if (userId === currentUser.id) {
        setCurrentUser((prev) => prev ? { ...prev, status: newStatus } : null);
      }

      showToast(`ইউজার স্ট্যাটাস '${newStatus === 'banned' ? 'স্থগিত (Banned)' : 'সক্রিয় (Active)'}' করা হয়েছে!`, newStatus === 'banned' ? 'info' : 'success');
    } catch (fsErr: any) {
      console.error('Firestore toggleUserBan error:', fsErr);
      showToast(`Firestore স্ট্যাটাস পরিবর্তন ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
    }
  };

  const addManualDeposit = async (userId: string, amount: number, note?: string): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('অননুমোদিত: শুধুমাত্র role: "admin" ব্যবহারকারীরা সরাসরি ডিপোজিট দিতে পারেন।', 'error');
      return false;
    }

    if (!userId || isNaN(amount) || amount <= 0) {
      showToast('সঠিক ইউজার এবং টাকার পরিমাণ দিন।', 'error');
      return false;
    }

    const cleanInput = userId.trim();
    const targetUser = allUsers.find(
      (u) => u.id === cleanInput || u.email?.toLowerCase() === cleanInput.toLowerCase()
    );

    const targetUid = targetUser?.id || cleanInput;

    const nowStr = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const depositId = 'MAN-DEP-' + Date.now();
    const trxId = 'MANUAL-' + Math.floor(100000 + Math.random() * 900000);

    let finalNewBalance = 0;
    let finalUserName = targetUser?.name || 'গ্রাহক';
    let finalUserEmail = targetUser?.email || '';

    try {
      // ATOMIC TRANSACTION: 1. Read user balance -> 2. Create approved deposit (method: 'manual') -> 3. Increment user walletBalance
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', targetUid);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          throw new Error(`'${cleanInput}' দিয়ে কোনো ইউজার অ্যাকাউন্ট পাওয়া যায়নি।`);
        }

        const userData = userSnap.data();
        finalUserName = userData.name || finalUserName;
        finalUserEmail = userData.email || finalUserEmail;
        const currentBal = typeof userData.walletBalance === 'number' ? userData.walletBalance : 0.00;
        finalNewBalance = Number((currentBal + Number(amount)).toFixed(2));

        const depositRef = doc(db, 'deposits', depositId);

        // 1. Create deposit doc
        transaction.set(depositRef, {
          id: depositId,
          userId: targetUid,
          userName: finalUserName,
          userEmail: finalUserEmail,
          method: 'manual',
          type: 'manual',
          amount: Number(amount),
          senderPhone: 'এডমিন সরাসরি জমা',
          trxId,
          status: 'approved',
          isManual: true,
          verifiedAt: nowStr,
          verifiedBy: currentUser.id,
          createdAt: nowStr,
          createdAtTimestamp: serverTimestamp(),
          rejectReason: note || 'এডমিন দ্বারা সরাসরি ওয়ালেট রিচার্জ (Manual Deposit)'
        });

        // 2. Atomically increment user's walletBalance
        transaction.update(userRef, {
          walletBalance: finalNewBalance,
          lastDepositAt: serverTimestamp()
        });
      });

      const newDeposit: DepositRequest = {
        id: depositId,
        userId: targetUid,
        userName: finalUserName,
        userEmail: finalUserEmail,
        method: 'manual',
        type: 'manual',
        amount: Number(amount),
        senderPhone: 'এডমিন সরাসরি জমা',
        trxId,
        status: 'approved',
        isManual: true,
        verifiedAt: nowStr,
        verifiedBy: currentUser.id,
        createdAt: nowStr,
        rejectReason: note || 'এডমিন দ্বারা সরাসরি ওয়ালেট রিচার্জ (Manual Deposit)'
      };

      // Update local states
      setDeposits((prev) => [newDeposit, ...prev.filter((d) => d.id !== depositId)]);
      setAllUsers((prev) => prev.map((u) => u.id === targetUid ? { ...u, walletBalance: finalNewBalance } : u));

      if (targetUid === currentUser.id) {
        setCurrentUser((prev) => prev ? { ...prev, walletBalance: finalNewBalance } : null);
      }

      showToast(`সরাসরি ৳ ${amount} ইউজার '${finalUserName}'-এর ওয়ালেটে সফলভাবে যোগ করা হয়েছে (Transaction সফল)!`, 'success');
      return true;
    } catch (fsErr: any) {
      console.error('Firestore runTransaction addManualDeposit error:', fsErr);
      showToast(`ম্যানুয়াল ডিপোজিট ত্রুটি: ${fsErr?.message || 'অনুমতি নেই'}`, 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthReady,
        isAdminMode,
        setIsAdminMode,
        activeTab,
        setActiveTab,
        products,
        deposits,
        orders,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        deleteOrder,
        toasts,
        showToast,
        notice,
        updateNotice,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        reorderBanners,
        saveAllBanners,
        allUsers,
        toggleUserBan,
        addManualDeposit,
        signupWithEmail,
        loginWithEmail,
        loginWithPhone,
        logout,
        updateUserProfile,
        submitDeposit,
        selectedProduct,
        setSelectedProduct,
        purchaseProduct,
        approveDeposit,
        rejectDeposit,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        toggleProductActive,
        togglePackageStock,
        updateProductImage,
        updateProductPackages,
        seedProductsToFirestore
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
