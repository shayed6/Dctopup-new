import { TopUpProduct, DepositRequest, Order, User, PaymentAccountInfo, AppNotice, HomeBanner } from '../types';

export const SUPPORT_PHONE = '01806030750';
export const SUPPORT_PHONE_FORMATTED = '01806-030750';
export const SUPPORT_WHATSAPP_LINK = 'https://wa.me/8801806030750';

export const PAYMENT_NUMBERS = [
  { id: 'num_2', number: '01806-030750', raw: '01806030750', label: 'বিকাশ ও নগদ পার্সোনাল' }
];

export const PAYMENT_ACCOUNTS: Record<'bkash' | 'nagad', PaymentAccountInfo> = {
  bkash: {
    method: 'bkash',
    name: 'bKash Personal (বিকাশ পার্সোনাল)',
    number: '01806-030750',
    numbers: ['01806-030750'],
    type: 'Personal',
    color: '#D82365', // Authentic bKash pink accent
    instructions: [
      'আপনার বিকাশ অ্যাপ অথবা *247# ডায়াল করে "Send Money" (সেন্ড মানি) অপশন বেছে নিন।',
      'প্রাপক নম্বর হিসেবে আমাদের নম্বরে পাঠান: 01806-030750 (এটিতে বিকাশ ও নগদ উভয়ই বিদ্যমান)।',
      'কাঙ্ক্ষিত পরিমাণ টাকা ও আপনার গোপন পিন দিয়ে ট্রানজেকশন সফল করুন।',
      'এসএমএস (SMS) বা অ্যাপ থেকে ৮-১০ ডিজিটের Transaction ID (TrxID) টি কপি করে নিচের বক্সে দিন।'
    ]
  },
  nagad: {
    method: 'nagad',
    name: 'Nagad Personal (নগদ পার্সোনাল)',
    number: '01806-030750',
    numbers: ['01806-030750'],
    type: 'Personal',
    color: '#F25822', // Authentic Nagad orange accent
    instructions: [
      'আপনার নগদ অ্যাপ অথবা *167# ডায়াল করে "Send Money" অপশন সিলেক্ট করুন।',
      'প্রাপক নম্বর হিসেবে আমাদের নম্বরে পাঠান: 01806-030750 (এটিতে বিকাশ ও নগদ উভয়ই বিদ্যমান)।',
      'টাকার পরিমাণ ও পিন দিয়ে কনফার্ম করুন (নগদে ক্যাশ-আউট নয়, শুধু সেন্ড মানি)।',
      'প্রাপ্ত ৮ ডিজিটের TrxID টি এবং আপনার যে নম্বর থেকে পাঠিয়েছেন তা দিয়ে সাবমিট করুন।'
    ]
  }
};

export const INITIAL_PRODUCTS: TopUpProduct[] = [
  {
    id: 'friday_offer',
    title: 'Friday offer',
    category: 'gaming',
    subCategory: 'Special Offer',
    badge: 'শুক্রবার স্পেশাল 🔥',
    badgeTag: 'Special Offer',
    description: 'প্রতি শুক্রবারের ধামাকা স্পেশাল অফার! বিশাল ছাড়ে অতিরিক্ত বোনাস ডায়মন্ড ও আকর্ষণীয় রিওয়ার্ড।',
    playerIdLabel: 'Player ID (UID)',
    image: '/images/ff_friday_offer_1790099054219.jpg',
    bannerImageUrl: '/images/ff_friday_offer_1790099054219.jpg',
    bannerGradient: 'from-amber-600/30 to-rose-950/40',
    isActive: true,
    sortOrder: 1,
    packages: [
      { id: 'fo_115', name: '115 + 115 Double Diamonds', amount: '230 💎', diamonds: '230 💎', price: 95, originalPrice: 130, popular: true, instantDelivery: true },
      { id: 'fo_240', name: '240 + 240 Double Diamonds', amount: '480 💎', diamonds: '480 💎', price: 190, originalPrice: 250, instantDelivery: true },
      { id: 'fo_bundle', name: 'Friday Super Bundle', amount: 'সুপার বান্ডেল', diamonds: 'সুপার বান্ডেল', price: 290, originalPrice: 380, popular: true },
      { id: 'fo_610', name: '610 + 300 Bonus Diamonds', amount: '910 💎', diamonds: '910 💎', price: 460, originalPrice: 590, instantDelivery: true }
    ]
  },
  {
    id: 'mystery_box',
    title: 'Mystery Box',
    category: 'gaming',
    subCategory: 'Lucky Box',
    badge: 'লাকি ড্রপ 🎁',
    badgeTag: 'Special Offer',
    description: 'ব্রোঞ্জ, সিলভার, গোল্ড ও ডায়মন্ড বক্স থেকে যেকোনো একটি নিশ্চিত আকর্ষণীয় রিওয়ার্ড পাবেন! যত বেশি মিস্ট্রি বক্স অর্ডার করবেন অত ভালো প্রাইস পাবেন 💎',
    playerIdLabel: 'Player ID (UID)',
    image: '/images/ff_mystery_box_1790099065451.jpg',
    bannerImageUrl: '/images/ff_mystery_box_1790099065451.jpg',
    bannerGradient: 'from-purple-600/30 to-indigo-950/40',
    isActive: true,
    sortOrder: 2,
    packages: [
      { id: 'mb_bronze', name: '১. ব্রোঞ্জ বক্স (Bronze Box)', amount: '১. ব্রোঞ্জ বক্স', diamonds: '25/110 💎 বা Weekly Light / 1টা Weekly', price: 45, originalPrice: 60 },
      { id: 'mb_silver', name: '২. সিলভার বক্স (Silver Box)', amount: '২. সিলভার বক্স', diamonds: '১০০/310 💎 বা 2টা Weekly / 1টা Monthly', price: 120, originalPrice: 150, popular: true },
      { id: 'mb_gold', name: '৩. গোল্ড বক্স (Gold Box)', amount: '৩. গোল্ড বক্স', diamonds: '1টা/3টা Weekly বা 520 💎 / ১টা Monthly', price: 390, originalPrice: 480, popular: true },
      { id: 'mb_diamond', name: '৪. ডায়মন্ড বক্স (Diamond Box)', amount: '৪. ডায়মন্ড বক্স', diamonds: '520/2100 💎 বা 1টা Monthly / 1টা Weekly', price: 790, originalPrice: 990 }
    ]
  },
  {
    id: 'uid_topup_bd',
    title: 'UID Top up(BD)',
    category: 'gaming',
    subCategory: 'BD Server',
    badge: 'ইনস্ট্যান্ট ডেলিভারি (১-২ মিনিট)',
    badgeTag: 'BD Server',
    description: 'বাংলাদেশ সার্ভারের অফিসিয়াল UID দিয়ে ডায়মন্ড টপ-আপ। ১০০% আইডি নিরাপদ ও দ্রুত ডেলিভারি।',
    playerIdLabel: 'Player ID (UID)',
    image: '/dc_logo.jpg',
    bannerImageUrl: '/dc_logo.jpg',
    bannerGradient: 'from-amber-600/30 to-rose-950/40',
    isActive: true,
    sortOrder: 3,
    packages: [
      { id: 'bd_25', name: '25 Diamonds', amount: '25 💎', diamonds: '25 💎', price: 22, originalPrice: 25 },
      { id: 'bd_50', name: '50 Diamonds', amount: '50 💎', diamonds: '50 💎', price: 43, originalPrice: 48 },
      { id: 'bd_115', name: '115 Diamonds', amount: '115 💎', diamonds: '115 💎', price: 85, originalPrice: 95, popular: true, instantDelivery: true },
      { id: 'bd_240', name: '240 Diamonds', amount: '240 💎', diamonds: '240 💎', price: 175, originalPrice: 190, instantDelivery: true },
      { id: 'bd_355', name: '355 Diamonds', amount: '355 💎', diamonds: '355 💎', price: 260, originalPrice: 280 },
      { id: 'bd_610', name: '610 Diamonds', amount: '610 💎', diamonds: '610 💎', price: 425, originalPrice: 460, popular: true, instantDelivery: true },
      { id: 'bd_1240', name: '1240 Diamonds', amount: '1,240 💎', diamonds: '1,240 💎', price: 840, originalPrice: 920 },
      { id: 'bd_2530', name: '2530 Diamonds', amount: '2,530 💎', diamonds: '2,530 💎', price: 1690, originalPrice: 1850 }
    ]
  },
  {
    id: 'weekly_monthly',
    title: 'weekly/monthly',
    category: 'gaming',
    subCategory: 'Membership',
    badge: 'অফিসিয়াল মেম্বারশিপ',
    badgeTag: 'Membership',
    description: 'সাপ্তাহিক ও মাসিক মেম্বারশিপ। প্রতিদিন লগইন করে ডায়মন্ড ক্লেইম করুন এবং উপভোগ করুন ভিআইপি প্রিভিলেজ।',
    playerIdLabel: 'Player ID (UID)',
    image: '/images/ff_weekly_monthly_1790099076947.jpg',
    bannerImageUrl: '/images/ff_weekly_monthly_1790099076947.jpg',
    bannerGradient: 'from-blue-600/30 to-indigo-950/40',
    isActive: true,
    sortOrder: 4,
    packages: [
      { id: 'wm_weekly', name: 'Weekly Membership', amount: 'সাপ্তাহিক মেম্বারশিপ (৪৫০ 💎)', diamonds: '৪৫০ 💎', price: 190, originalPrice: 220, popular: true, instantDelivery: true },
      { id: 'wm_monthly', name: 'Monthly Membership', amount: 'মাসিক মেম্বারশিপ (২৬০০ 💎)', diamonds: '২৬০০ 💎', price: 880, originalPrice: 950, instantDelivery: true }
    ]
  },
  {
    id: 'weekly_monthly_combo_offer',
    title: 'weekly/monthly combo offer',
    category: 'gaming',
    subCategory: 'Combo Offer',
    badge: 'মেগা সেভিং কম্বো 💥',
    badgeTag: 'Special Offer',
    description: 'একসাথে উইকলি ও মান্থলি মেম্বারশিপ নিয়ে উপভোগ করুন ৩০০০+ ডায়মন্ড এবং সুপার ক্যাশব্যাক ছাড়।',
    playerIdLabel: 'Player ID (UID)',
    image: '/images/ff_combo_offer_1790099090251.jpg',
    bannerImageUrl: '/images/ff_combo_offer_1790099090251.jpg',
    bannerGradient: 'from-teal-600/30 to-slate-950/40',
    isActive: true,
    sortOrder: 5,
    packages: [
      { id: 'combo_1w1m', name: '1 Weekly + 1 Monthly Combo', amount: 'উইকলি + মান্থলি কম্বো', diamonds: '৩০৫০ 💎', price: 1040, originalPrice: 1150, popular: true, instantDelivery: true },
      { id: 'combo_2w1m', name: '2 Weekly + 1 Monthly Super Combo', amount: '২ উইকলি + ১ মান্থলি', diamonds: '৩৫০০ 💎', price: 1220, originalPrice: 1350, instantDelivery: true }
    ]
  },
  {
    id: 'weekly_lite_bd',
    title: 'weekly lite(BD)',
    category: 'gaming',
    subCategory: 'Membership',
    badge: 'সাশ্রয়ী উইকলি 💎',
    badgeTag: 'Special Offer',
    description: 'বাংলাদেশ সার্ভারের জন্য স্পেশাল উইকলি লাইট মেম্বারশিপ। স্বল্প খরচে দ্রুত ডায়মন্ড জমার সেরা প্যাকেজ।',
    playerIdLabel: 'Player ID (UID)',
    image: '/images/ff_weekly_lite_1790099102077.jpg',
    bannerImageUrl: '/images/ff_weekly_lite_1790099102077.jpg',
    bannerGradient: 'from-cyan-600/30 to-blue-950/40',
    isActive: true,
    sortOrder: 6,
    packages: [
      { id: 'wl_1', name: '1x Weekly Lite (BD)', amount: '১টি উইকলি লাইট', diamonds: '৫০ 💎', price: 45, originalPrice: 55, popular: true, instantDelivery: true },
      { id: 'wl_2', name: '2x Weekly Lite (BD)', amount: '২টি উইকলি লাইট', diamonds: '১০০ 💎', price: 88, originalPrice: 105, instantDelivery: true },
      { id: 'wl_5', name: '5x Weekly Lite (BD)', amount: '৫টি উইকলি লাইট', diamonds: '২৫০ 💎', price: 215, originalPrice: 250, instantDelivery: true }
    ]
  },
  {
    id: 'new_level_up_pass',
    title: 'New level up pass',
    category: 'gaming',
    subCategory: 'Level Up Pass',
    badge: '৮০২ ডায়মন্ড রিওয়ার্ড ⭐',
    badgeTag: 'Special Offer',
    description: 'লেভেল ৩০ পর্যন্ত মোট ৮০২ টি ডায়মন্ড ক্লেইম করার অফিসিয়াল লেভেল আপ পাস। প্রতিটি আইডিতে একবারই প্রযোজ্য।',
    playerIdLabel: 'Player ID (UID)',
    image: '/images/ff_levelup_pass_1790099113083.jpg',
    bannerImageUrl: '/images/ff_levelup_pass_1790099113083.jpg',
    bannerGradient: 'from-amber-600/30 to-yellow-950/40',
    isActive: true,
    sortOrder: 7,
    packages: [
      { id: 'lup_802', name: 'New Level Up Pass (802 Diamonds)', amount: '৮০২ 💎 রিওয়ার্ড', diamonds: '৮০২ 💎', price: 185, originalPrice: 220, popular: true, instantDelivery: true }
    ]
  },
  {
    id: 'tiktok_video_like',
    title: 'TikTok video like',
    category: 'tiktok',
    subCategory: 'TikTok Engagement',
    badge: 'ইনস্ট্যান্ট লাইকস ⚡',
    badgeTag: 'TikTok Service',
    description: 'আপনার টিকটক ভিডিও ভাইরাল করার জন্য হাই কোয়ালিটি লাইক। কোনো পাসওয়ার্ড লাগবে না, শুধু ভিডিও লিংক দিন।',
    playerIdLabel: 'TikTok Video Link (ভিডিও লিংক)',
    image: '/images/tiktok_like_cover_1790098978170.jpg',
    bannerImageUrl: '/images/tiktok_like_cover_1790098978170.jpg',
    bannerGradient: 'from-rose-600/30 to-black/60',
    isActive: true,
    sortOrder: 8,
    packages: [
      { id: 'ttl_500', name: '500 Video Likes', amount: '৫০০ লাইক', diamonds: '৫০০ লাইক', price: 40, originalPrice: 50 },
      { id: 'ttl_1000', name: '1,000 Video Likes', amount: '১,০০০ লাইক', diamonds: '১,০০০ লাইক', price: 75, originalPrice: 90, popular: true, instantDelivery: true },
      { id: 'ttl_2500', name: '2,500 Video Likes', amount: '২,৫০০ লাইক', diamonds: '২,৫০০ লাইক', price: 170, originalPrice: 210 },
      { id: 'ttl_5000', name: '5,000 Video Likes', amount: '৫,০০০ লাইক', diamonds: '৫,০০০ লাইক', price: 320, originalPrice: 390, popular: true },
      { id: 'ttl_10000', name: '10,000 Video Likes', amount: '১০,০০০ লাইক', diamonds: '১০,০০০ লাইক', price: 590, originalPrice: 720 }
    ]
  },
  {
    id: 'tiktok_account_followers',
    title: 'TikTok account followers',
    category: 'tiktok',
    subCategory: 'TikTok Growth',
    badge: 'নন-ড্রপ ফলোয়ার্স 🚀',
    badgeTag: 'TikTok Service',
    description: 'টিকটক একাউন্ট গ্রোথ ও লাইভ অপশন আনলক করতে রিয়েল ও অ্যাক্টিভ ফলোয়ার্স। ১০০% নিরাপদ ও দ্রুত ডেলিভারি।',
    playerIdLabel: 'TikTok Profile Link / Username (প্রোফাইল লিংক বা ইউজারনেম)',
    image: '/images/tiktok_followers_cover_1790098990397.jpg',
    bannerImageUrl: '/images/tiktok_followers_cover_1790098990397.jpg',
    bannerGradient: 'from-pink-600/30 to-black/60',
    isActive: true,
    sortOrder: 9,
    packages: [
      { id: 'ttf_500', name: '500 Account Followers', amount: '৫০০ ফলোয়ার্স', diamonds: '৫০০ ফলোয়ার্স', price: 95, originalPrice: 120 },
      { id: 'ttf_1000', name: '1,000 Account Followers', amount: '১,০০০ ফলোয়ার্স', diamonds: '১,০০০ ফলোয়ার্স', price: 180, originalPrice: 220, popular: true, instantDelivery: true },
      { id: 'ttf_2500', name: '2,500 Account Followers', amount: '২,৫০০ ফলোয়ার্স', diamonds: '২,৫০০ ফলোয়ার্স', price: 430, originalPrice: 510 },
      { id: 'ttf_5000', name: '5,000 Account Followers', amount: '৫,০০০ ফলোয়ার্স', diamonds: '৫,০০০ ফলোয়ার্স', price: 820, originalPrice: 980, popular: true },
      { id: 'ttf_10000', name: '10,000 Account Followers', amount: '১০,০০০ ফলোয়ার্স', diamonds: '১০,০০০ ফলোয়ার্স', price: 1550, originalPrice: 1850 }
    ]
  },
  {
    id: 'facebook_page_followers',
    title: 'Facebook page followers',
    category: 'facebook',
    subCategory: 'Page Growth',
    badge: 'রিয়েল পেজ ফলোয়ার্স 👍',
    badgeTag: 'Facebook Service',
    description: 'ফেসবুক বিজনেস অথবা ক্রিয়েটর পেজের ফলোয়ার ও লাইক। পেজের গ্রহণযোগ্যতা ও মনিটাইজেশন বাড়াতে সহায়ক।',
    playerIdLabel: 'Facebook Page Link (পেজ লিংক)',
    image: '/images/facebook_page_cover_1790099001864.jpg',
    bannerImageUrl: '/images/facebook_page_cover_1790099001864.jpg',
    bannerGradient: 'from-blue-600/30 to-indigo-950/60',
    isActive: true,
    sortOrder: 10,
    packages: [
      { id: 'fbpf_500', name: '500 Page Followers', amount: '৫০০ ফলোয়ার্স', diamonds: '৫০০ ফলোয়ার্স', price: 85, originalPrice: 100 },
      { id: 'fbpf_1000', name: '1,000 Page Followers', amount: '১,০০০ ফলোয়ার্স', diamonds: '১,০০০ ফলোয়ার্স', price: 160, originalPrice: 190, popular: true, instantDelivery: true },
      { id: 'fbpf_2000', name: '2,000 Page Followers', amount: '২,০০০ ফলোয়ার্স', diamonds: '২,০০০ ফলোয়ার্স', price: 310, originalPrice: 370 },
      { id: 'fbpf_5000', name: '5,000 Page Followers', amount: '৫,০০০ ফলোয়ার্স', diamonds: '৫,০০০ ফলোয়ার্স', price: 750, originalPrice: 890, popular: true },
      { id: 'fbpf_10000', name: '10,000 Page Followers', amount: '১০,০০০ ফলোয়ার্স', diamonds: '১০,০০০ ফলোয়ার্স', price: 1450, originalPrice: 1720 }
    ]
  },
  {
    id: 'facebook_react',
    title: 'Facebook react',
    category: 'facebook',
    subCategory: 'Post Engagement',
    badge: 'মিক্সড রিয়েক্ট ❤️',
    badgeTag: 'Facebook Service',
    description: 'যেকোনো ফেসবুক পাবলিক পোস্ট বা ছবির জন্য লাভ, কেয়ার, হাহা বা ওয়াও রিঅ্যাক্ট। ইনস্ট্যান্ট ডেলিভারি।',
    playerIdLabel: 'Facebook Post Link (পোস্ট লিংক)',
    image: '/images/facebook_react_cover_1790099014624.jpg',
    bannerImageUrl: '/images/facebook_react_cover_1790099014624.jpg',
    bannerGradient: 'from-rose-600/30 to-blue-950/60',
    isActive: true,
    sortOrder: 11,
    packages: [
      { id: 'fbr_200', name: '200 Mixed Reacts (Love/Care/Like)', amount: '২০০ রিঅ্যাক্ট', diamonds: '২০০ রিঅ্যাক্ট', price: 35, originalPrice: 45 },
      { id: 'fbr_500', name: '500 Mixed Reacts (Love/Care/Like)', amount: '৫০০ রিঅ্যাক্ট', diamonds: '৫০০ রিঅ্যাক্ট', price: 75, originalPrice: 95, popular: true, instantDelivery: true },
      { id: 'fbr_1000', name: '1,000 Mixed Reacts', amount: '১,০০০ রিঅ্যাক্ট', diamonds: '১,০০০ রিঅ্যাক্ট', price: 140, originalPrice: 175 },
      { id: 'fbr_2500', name: '2,500 Mixed Reacts', amount: '২,৫০০ রিঅ্যাক্ট', diamonds: '২,৫০০ রিঅ্যাক্ট', price: 320, originalPrice: 390, popular: true },
      { id: 'fbr_5000', name: '5,000 Mixed Reacts', amount: '৫,০০০ রিঅ্যাক্ট', diamonds: '৫,০০০ রিঅ্যাক্ট', price: 590, originalPrice: 720 }
    ]
  },
  {
    id: 'facebook_video_views',
    title: 'Facebook video views',
    category: 'facebook',
    subCategory: 'Video / Reels',
    badge: 'ভিডিও ও রিলস ভিউজ 👁️',
    badgeTag: 'Facebook Service',
    description: 'ফেসবুক ভিডিও এবং রিলসের জন্য হাই রিটেনশন ওয়াচ-টাইম ও ভিউজ। ভিডিও ভাইরাল হওয়ার সুযোগ তৈরি করে।',
    playerIdLabel: 'Facebook Video / Reel Link (ভিডিও বা রিলস লিংক)',
    image: '/images/facebook_views_cover_1790099026190.jpg',
    bannerImageUrl: '/images/facebook_views_cover_1790099026190.jpg',
    bannerGradient: 'from-sky-600/30 to-blue-950/60',
    isActive: true,
    sortOrder: 12,
    packages: [
      { id: 'fbvv_1000', name: '1,000 Video Views', amount: '১,০০০ ভিউজ', diamonds: '১,০০০ ভিউজ', price: 30, originalPrice: 40 },
      { id: 'fbvv_3000', name: '3,000 Video Views', amount: '৩,০০০ ভিউজ', diamonds: '৩,০০০ ভিউজ', price: 70, originalPrice: 90, popular: true, instantDelivery: true },
      { id: 'fbvv_5000', name: '5,000 Video Views', amount: '৫,০০০ ভিউজ', diamonds: '৫,০০০ ভিউজ', price: 110, originalPrice: 140 },
      { id: 'fbvv_10000', name: '10,000 Video Views', amount: '১০,০০০ ভিউজ', diamonds: '১০,০০০ ভিউজ', price: 195, originalPrice: 240, popular: true },
      { id: 'fbvv_25000', name: '25,000 Video Views', amount: '২৫,০০০ ভিউজ', diamonds: '২৫,০০০ ভিউজ', price: 450, originalPrice: 550 }
    ]
  },
  {
    id: 'facebook_id_followers',
    title: 'facebook ID followers',
    category: 'facebook',
    subCategory: 'Profile Growth',
    badge: 'আইডি ফলোয়ার্স 👤',
    badgeTag: 'Facebook Service',
    description: 'ব্যক্তিগত ফেসবুক আইডি / প্রোফাইলের জন্য অর্গানিক ফলোয়ার্স। প্রোফাইল পাবলিক রেখে শুধু লিংক প্রদান করুন।',
    playerIdLabel: 'Facebook Profile / ID Link (প্রোফাইল লিংক)',
    image: '/images/facebook_id_followers_1790099038810.jpg',
    bannerImageUrl: '/images/facebook_id_followers_1790099038810.jpg',
    bannerGradient: 'from-blue-600/30 to-slate-950/60',
    isActive: true,
    sortOrder: 13,
    packages: [
      { id: 'fbif_500', name: '500 ID Followers', amount: '৫০০ ফলোয়ার্স', diamonds: '৫০০ ফলোয়ার্স', price: 75, originalPrice: 95 },
      { id: 'fbif_1000', name: '1,000 ID Followers', amount: '১,০০০ ফলোয়ার্স', diamonds: '১,০০০ ফলোয়ার্স', price: 140, originalPrice: 175, popular: true, instantDelivery: true },
      { id: 'fbif_2500', name: '2,500 ID Followers', amount: '২,৫০০ ফলোয়ার্স', diamonds: '২,৫০০ ফলোয়ার্স', price: 330, originalPrice: 410 },
      { id: 'fbif_5000', name: '5,000 ID Followers', amount: '৫,০০০ ফলোয়ার্স', diamonds: '৫,০০০ ফলোয়ার্স', price: 620, originalPrice: 760, popular: true },
      { id: 'fbif_10000', name: '10,000 ID Followers', amount: '১০,০০০ ফলোয়ার্স', diamonds: '১০,০০০ ফলোয়ার্স', price: 1180, originalPrice: 1420 }
    ]
  }
];

export const INITIAL_NOTICE: AppNotice = {
  id: 'notice_default',
  text: '⚡ ডিসি টপ-আপে বিকাশ ও নগদে সেন্ড মানি করে দ্রুত ওয়ালেট রিচার্জ করুন! ২৪/৭ অটো ইনস্ট্যান্ট ডেলিভারি ও কাস্টমার হেল্পলাইন চালু আছে।',
  type: 'urgent',
  isActive: true,
  updatedAt: '2025-02-23'
};

export const INITIAL_BANNERS: HomeBanner[] = [
  {
    id: 'banner_friday',
    title: 'Friday Special Mega Offer 🔥',
    subtitle: 'প্রতি শুক্রবারে ডাবল ডায়মন্ড বোনাস ও বিশাল ছাড়! সরাসরি UID দিয়ে টপ-আপ নিন।',
    imageUrl: '/images/ff_friday_offer_1790099054219.jpg',
    badge: 'ফ্রাইডে স্পেশাল',
    actionTab: 'home',
    actionText: 'অফার দেখুন',
    isActive: true
  },
  {
    id: 'banner_membership',
    title: 'সাপ্তাহিক ও মাসিক মেম্বারশিপ কম্বো',
    subtitle: 'একসাথে উইকলি ও মান্থলি নিয়ে ৩০০০+ ডায়মন্ড সেভ করুন এক ক্লিকে।',
    imageUrl: '/images/ff_weekly_monthly_1790099076947.jpg',
    badge: 'মেগা সেভিং',
    actionTab: 'home',
    actionText: 'প্যাকেজ দেখুন',
    isActive: true
  },
  {
    id: 'banner_combo',
    title: 'ফ্রি ফায়ার মেগা কম্বো প্যাক',
    subtitle: 'একসাথে পেয়ে যান আকর্ষণীয় গিফট বান্ডেল ও ডায়মন্ড বোনাস।',
    imageUrl: '/images/ff_combo_offer_1790099090251.jpg',
    badge: 'হট ডিল',
    actionTab: 'home',
    actionText: 'কম্বো দেখুন',
    isActive: true
  },
  {
    id: 'banner_levelup',
    title: 'লেভেল আপ পাস (Level Up Pass BD)',
    subtitle: 'লেভেল আপ পাসে পান সর্বোচ্চ ডায়মন্ড সরাসরি আপনার প্লেয়ার আইডিতে।',
    imageUrl: '/images/ff_levelup_pass_1790099113083.jpg',
    badge: 'লেভেল আপ',
    actionTab: 'home',
    actionText: 'টপ-আপ নিন',
    isActive: true
  },
  {
    id: 'banner_social',
    title: 'টিকটক ও ফেসবুক সোশ্যাল গ্রোথ সার্ভিস',
    subtitle: '১০০% রিয়েল অর্গানিক ফলোয়ার্স, লাইক, ভিউজ ও পোস্ট রিঅ্যাক্ট সার্ভিস।',
    imageUrl: '/images/tiktok_like_cover_1790098978170.jpg',
    badge: 'সোশ্যাল সার্ভিস',
    actionTab: 'home',
    actionText: 'অর্ডার করুন',
    isActive: true
  }
];

export const PRESET_PRODUCT_IMAGES: { label: string; url: string; category: string }[] = [
  { label: 'DC Top Up লোগো', url: '/dc_logo.jpg', category: 'General' },
  { label: 'DC Wallet ব্যানার', url: '/images/dc_topup_logo_1790094683501.jpg', category: 'General' },
  { label: 'Friday Offer (ফ্রাইডে অফার)', url: '/images/ff_friday_offer_1790099054219.jpg', category: 'Gaming' },
  { label: 'Mystery Box (মিস্ট্রি বক্স)', url: '/images/ff_mystery_box_1790099065451.jpg', category: 'Gaming' },
  { label: 'Weekly / Monthly (মেম্বারশিপ)', url: '/images/ff_weekly_monthly_1790099076947.jpg', category: 'Gaming' },
  { label: 'Combo Offer (কম্বো অফার)', url: '/images/ff_combo_offer_1790099090251.jpg', category: 'Gaming' },
  { label: 'Weekly Lite BD (উইকলি লাইট)', url: '/images/ff_weekly_lite_1790099102077.jpg', category: 'Gaming' },
  { label: 'Level Up Pass (লেভেল আপ পাস)', url: '/images/ff_levelup_pass_1790099113083.jpg', category: 'Gaming' },
  { label: 'TikTok Video Like (ভিডিও লাইক)', url: '/images/tiktok_like_cover_1790098978170.jpg', category: 'TikTok' },
  { label: 'TikTok Followers (ফলোয়ার্স)', url: '/images/tiktok_followers_cover_1790098990397.jpg', category: 'TikTok' },
  { label: 'Facebook Page Likes (পেজ লাইক)', url: '/images/facebook_page_cover_1790099001864.jpg', category: 'Facebook' },
  { label: 'Facebook Post React (পোস্ট রিঅ্যাক্ট)', url: '/images/facebook_react_cover_1790099014624.jpg', category: 'Facebook' },
  { label: 'Facebook Video Views (ভিডিও ভিউজ)', url: '/images/facebook_views_cover_1790099026190.jpg', category: 'Facebook' },
  { label: 'Facebook Profile Followers (আইডি ফলোয়ার্স)', url: '/images/facebook_id_followers_1790099038810.jpg', category: 'Facebook' }
];
