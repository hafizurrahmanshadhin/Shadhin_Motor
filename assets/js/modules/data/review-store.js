const REVIEW_AVATAR_FALLBACKS = Object.freeze([
  'assets/images/reviews/reviewer-rk.jpeg',
  'assets/images/reviews/reviewer-na.jpeg',
  'assets/images/reviews/reviewer-ma.jpeg',
  'assets/images/reviews/reviewer-sa.jpeg',
  'assets/images/reviews/reviewer-fa.jpeg',
  'assets/images/reviews/reviewer-ta.jpeg'
]);

const DEFAULT_REVIEW_MEDIA_IMAGES = Object.freeze([
  ...Array.from({ length: 17 }, (_, idx) =>
    `assets/media/reviews/images/review-work-${String(idx + 1).padStart(2, '0')}.jpeg`
  ),
  ...Array.from({ length: 8 }, (_, idx) =>
    `assets/media/reviews/images/review-free-${String(idx + 1).padStart(2, '0')}.jpeg`
  )
]);

const DEFAULT_REVIEW_MEDIA_VIDEOS = Object.freeze([
  'assets/media/reviews/videos/review-video-01.mp4',
  'assets/media/reviews/videos/review-video-02.mp4',
  'assets/media/reviews/videos/review-video-03.mp4',
  'assets/media/reviews/videos/review-video-04.mp4'
]);

const DEFAULT_REVIEW_SEED = Object.freeze([
  {
    name: 'রাশেদ করিম',
    work: 'Toyota Corolla Axio • মিরপুর, ঢাকা',
    rating: 5,
    comment: 'Factory-fit finishing, premium stitch line আর color match নিয়ে আমি পুরোপুরি সন্তুষ্ট।'
  },
  {
    name: 'নাফিসা আহমেদ',
    work: 'Toyota Premio • উত্তরা, ঢাকা',
    rating: 5,
    comment: 'Timeline maintain করে কাজ দিয়েছে, leather feel এবং cabin look দুটোই অসাধারণ হয়েছে।'
  },
  {
    name: 'মাসুদ হোসেন',
    work: 'Yamaha R15 • সাভার',
    rating: 4,
    comment: 'Daily ride comfort অনেক improve হয়েছে, grip and finish খুব clean ছিল।'
  },
  {
    name: 'সাইফ রহমান',
    work: 'Honda Vezel • গাজীপুর',
    rating: 5,
    comment: 'পুরো গাড়ির interior theme ধরে design করেছে, fitting একদম mismatch ছাড়া।'
  },
  {
    name: 'ফারজানা নূর',
    work: 'Toyota Noah • নারায়ণগঞ্জ',
    rating: 5,
    comment: 'Family use এর জন্য soft কিন্তু durable seat finish পেয়েছি, service খুব responsive।'
  },
  {
    name: 'তানভীর আলম',
    work: 'Bajaj Pulsar • ধানমন্ডি, ঢাকা',
    rating: 5,
    comment: 'Sample match করার পরে final কাজ দিয়েছে, output preview এর সাথে পুরো মিলেছে।'
  },
  {
    name: 'সাব্বির ইসলাম',
    work: 'Honda Civic • বসুন্ধরা, ঢাকা',
    rating: 4,
    comment: 'Design recommendation ভাল ছিল, cabin overall premium feel পেয়েছি।'
  },
  {
    name: 'মাহি চৌধুরী',
    work: 'Suzuki Swift • বাড্ডা, ঢাকা',
    rating: 5,
    comment: 'Color combo suggest করার পর final look গাড়ির সাথে খুব মানিয়েছে।'
  },
  {
    name: 'রুমান হক',
    work: 'Mitsubishi Pajero • তেজগাঁও, ঢাকা',
    rating: 5,
    comment: 'Large cabin গাড়িতেও detailing ঠিক রেখেছে, stitching খুব neat ছিল।'
  },
  {
    name: 'তাসনিম আরা',
    work: 'Nissan X-Trail • বনানী, ঢাকা',
    rating: 4,
    comment: 'Work quality ভালো, delivery day-তে communication clear ছিল।'
  },
  {
    name: 'ইফতেখার সজীব',
    work: 'Yamaha FZS • মোহাম্মদপুর, ঢাকা',
    rating: 5,
    comment: 'Bike seat contour অনুযায়ী custom cut দিয়েছে, ride fatigue noticeably কমেছে।'
  },
  {
    name: 'জুনাইদ হাসান',
    work: 'Toyota Allion • মগবাজার, ঢাকা',
    rating: 5,
    comment: 'আগের worn seat replace করে cabin fresh look এসেছে, materials quality solid।'
  },
  {
    name: 'মেহরিন সুলতানা',
    work: 'Honda Grace • টঙ্গী, গাজীপুর',
    rating: 4,
    comment: 'Finishing আর edge alignment সুন্দর হয়েছে, overall experience smooth।'
  },
  {
    name: 'আরিফুল কবির',
    work: 'Microbus Hiace • যাত্রাবাড়ী, ঢাকা',
    rating: 5,
    comment: 'Commercial use এর জন্য heavy-duty build চেয়েছিলাম, ঠিক সেটাই পেয়েছি।'
  },
  {
    name: 'শাওন মোল্লা',
    work: 'Suzuki Gixxer • কেরানীগঞ্জ, ঢাকা',
    rating: 5,
    comment: 'Seat padding balance ঠিক থাকায় long ride এও pressure কম লেগেছে।'
  },
  {
    name: 'রাইসা নাসরিন',
    work: 'Toyota Aqua • মিরপুর DOHS, ঢাকা',
    rating: 4,
    comment: 'Clean finishing, tidy stitch আর সময়মতো handover - সব মিলিয়ে good service।'
  },
  {
    name: 'নাবিল মাহমুদ',
    work: 'Honda CBR • শ্যামলী, ঢাকা',
    rating: 5,
    comment: 'Sport bike seat shape বজায় রেখেই comfort increase করেছে, কাজ দারুণ।'
  },
  {
    name: 'সামিয়া রহমান',
    work: 'Toyota Fielder • আজিমপুর, ঢাকা',
    rating: 5,
    comment: 'Family trip এর জন্য easy-clean material নিয়েছিলাম, decision টা খুব ভালো ছিল।'
  },
  {
    name: 'রাশিকুল ইমরান',
    work: 'Nissan Sunny • রামপুরা, ঢাকা',
    rating: 4,
    comment: 'Budget friendly package এর ভেতরেও good finish দিয়েছে, value for money।'
  },
  {
    name: 'তাহমিনা হক',
    work: 'Honda Fit • কল্যাণপুর, ঢাকা',
    rating: 5,
    comment: 'Pickup থেকে fitting সবকিছু coordinated ছিল, final look exactly আমার পছন্দমতো।'
  }
].map(item => Object.freeze({ ...item })));

export function getFallbackAvatar(index = 0) {
  return REVIEW_AVATAR_FALLBACKS[index % REVIEW_AVATAR_FALLBACKS.length];
}

export function buildDefaultReviews() {
  return DEFAULT_REVIEW_SEED.map((seed, idx) => {
    const firstImage = DEFAULT_REVIEW_MEDIA_IMAGES[idx % DEFAULT_REVIEW_MEDIA_IMAGES.length];
    const secondImage = DEFAULT_REVIEW_MEDIA_IMAGES[(idx + 7) % DEFAULT_REVIEW_MEDIA_IMAGES.length];
    const video = DEFAULT_REVIEW_MEDIA_VIDEOS[idx % DEFAULT_REVIEW_MEDIA_VIDEOS.length];

    return {
      id: `demo-review-${String(idx + 1).padStart(2, '0')}`,
      name: seed.name,
      work: seed.work,
      rating: seed.rating,
      comment: seed.comment,
      avatar: getFallbackAvatar(idx),
      media: [
        { type: 'image', src: firstImage },
        { type: 'image', src: secondImage },
        { type: 'video', src: video }
      ],
      approved: true,
      selected: true,
      status: 'approved',
      createdAt: new Date(Date.UTC(2026, 0, idx + 1)).toISOString()
    };
  });
}

function sanitizeMediaSrc(src = '', type = 'image') {
  const clean = String(src || '').trim();
  if (!clean) return '';

  const isImageData = clean.startsWith('data:image/');
  const isVideoData = clean.startsWith('data:video/');
  const isHttp = /^https?:\/\//i.test(clean);
  const isRelative = clean.startsWith('assets/') || clean.startsWith('./') || clean.startsWith('../');

  if (type === 'video') {
    if (isVideoData || isHttp || isRelative) return clean;
    return '';
  }

  if (isImageData || isHttp || isRelative) return clean;
  return '';
}

function normalizeMediaItem(rawMedia) {
  if (!rawMedia) return null;

  if (typeof rawMedia === 'string') {
    const src = rawMedia.trim();
    const isVideo = src.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(src);
    const type = isVideo ? 'video' : 'image';
    const safeSrc = sanitizeMediaSrc(src, type);
    return safeSrc ? { type, src: safeSrc } : null;
  }

  if (typeof rawMedia === 'object') {
    const src = (rawMedia.src || rawMedia.url || '').trim();
    const fallbackType = src.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(src)
      ? 'video'
      : 'image';
    const type = rawMedia.type === 'video' ? 'video' : fallbackType;
    const safeSrc = sanitizeMediaSrc(src, type);
    if (!safeSrc) return null;

    return {
      type,
      src: safeSrc,
      name: rawMedia.name ? String(rawMedia.name) : ''
    };
  }

  return null;
}

function normalizeMediaCollection(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeMediaItem)
    .filter(Boolean)
    .slice(0, 12);
}

export function normalizeReview(rawReview, index = 0) {
  if (!rawReview || typeof rawReview !== 'object') return null;

  const rawRating = Number(
    rawReview.rating
    ?? rawReview.score
    ?? rawReview.stars
    ?? rawReview.userRating
    ?? rawReview.reviewScore
    ?? 0
  );
  const rating = Math.max(1, Math.min(5, Math.round(rawRating || 0)));

  const name = String(rawReview.name || rawReview.customerName || rawReview.reviewerName || '').trim();
  const work = String(rawReview.work || rawReview.meta || rawReview.workInfo || rawReview.vehicleInfo || rawReview.workTitle || '').trim();
  const comment = String(rawReview.comment || rawReview.reviewText || rawReview.review || rawReview.text || '').trim();

  if (!name || !work || !comment) return null;

  const avatarCandidate = String(rawReview.avatar || rawReview.avatarUrl || rawReview.profilePic || '').trim();
  const avatar = sanitizeMediaSrc(avatarCandidate, 'image') || getFallbackAvatar(index);

  const directMedia = normalizeMediaCollection(rawReview.media);
  const imageList = Array.isArray(rawReview.images)
    ? rawReview.images.map(src => ({ type: 'image', src }))
    : [];
  const videoList = Array.isArray(rawReview.videos)
    ? rawReview.videos.map(src => ({ type: 'video', src }))
    : [];
  const mergedMedia = directMedia.length
    ? directMedia
    : normalizeMediaCollection([...imageList, ...videoList]);

  return {
    id: String(rawReview.id || rawReview.reviewId || `review-${Date.now()}-${index}`),
    name,
    work,
    rating,
    comment,
    avatar,
    media: mergedMedia,
    approved: rawReview.approved !== false && rawReview.isApproved !== false,
    selected: rawReview.selected !== false && rawReview.isSelected !== false,
    status: String(rawReview.status || ((rawReview.approved === false || rawReview.isApproved === false) ? 'pending' : 'approved')),
    createdAt: String(rawReview.createdAt || rawReview.dateISO || rawReview.date || '')
  };
}
