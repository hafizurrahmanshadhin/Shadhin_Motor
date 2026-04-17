/**
 * Shared site configuration and fallback content.
 *
 * Keeps default catalog data and storage keys in one place so homepage and
 * dedicated catalog pages stay in sync without copy-pasted seed data.
 */
export const storageKeys = Object.freeze({
  samples: 'ac_samples',
  gallery: 'ac_gallery',
  orders: 'ac_orders',
  selectedSample: 'ac_selected_sample_id',
  reviews: 'ac_reviews',
  pendingReviews: 'ac_review_submissions',
  selectedReviewIds: 'ac_selected_review_ids',
  accessibilityPrefs: 'shadhinMotorA11yPrefs.v1'
});

export const defaultSamples = Object.freeze([
    { id: 'RX-001', name: 'ডায়মন্ড কোয়িল্ট', material: 'rexine', color: 'কালো', hex: '#1a1a1a', available: true, note: 'সবচেয়ে জনপ্রিয় ডিজাইন। টেকসই ও পরিষ্কার করা সহজ।', img: '', featured: true },
    { id: 'RX-002', name: 'স্ট্রাইপ প্যাটার্ন', material: 'rexine', color: 'বাদামি-কালো', hex: '#3d2010', available: true, note: 'ক্লাসিক স্ট্রাইপ ডিজাইন, দীর্ঘস্থায়ী।', img: '', featured: true },
    { id: 'RX-003', name: 'প্লেইন ম্যাট', material: 'rexine', color: 'নেভি ব্লু', hex: '#1a2a4a', available: true, note: 'সিম্পল ও এলিগেন্ট। অফিসের গাড়ির জন্য উপযুক্ত।', img: '', featured: true },
    { id: 'RX-004', name: 'হানিকম্ব টেক্সচার', material: 'rexine', color: 'ধূসর', hex: '#4a4a4a', available: true, note: 'হেক্সাগোনাল প্যাটার্ন, স্পোর্টি লুক।', img: '' },
    { id: 'RX-005', name: 'ক্লাসিক পাঞ্চ', material: 'rexine', color: 'লাল-কালো', hex: '#6b0f0f', available: true, note: 'পাঞ্চড ডিজাইন, বায়ু চলাচল ভালো।', img: '' },
    { id: 'RX-006', name: 'বাক্স কোয়িল্ট', material: 'rexine', color: 'বেইজ', hex: '#c4a882', available: true, note: 'লাক্সারি বক্স কোয়িল্ট, গাড়ির ভেতর প্রিমিয়াম ফিল।', img: '' },
    { id: 'RX-007', name: 'ডবল স্টিচ লাইন', material: 'rexine', color: 'সাদা-ধূসর', hex: '#d0d0d0', available: true, note: 'দুই রঙের সেলাই, মডার্ন লুক।', img: '' },
    { id: 'RX-008', name: 'স্পোর্ট মেশ', material: 'rexine', color: 'কমলা-কালো', hex: '#c45010', available: false, note: 'স্টক শেষ। শীঘ্রই আসছে।', img: '' },
    { id: 'LT-001', name: 'স্মুথ ফুল লেদার', material: 'leather', color: 'কালো', hex: '#0d0d0d', available: true, note: 'খাঁটি নরম লেদার। প্রিমিয়াম গাড়ির জন্য পারফেক্ট।', img: '', featured: true },
    { id: 'LT-002', name: 'টেক্সচার্ড লেদার', material: 'leather', color: 'গাঢ় বাদামি', hex: '#3b1f0a', available: true, note: 'টেক্সচার্ড ফিনিশ, দীর্ঘস্থায়ী ও স্ক্র্যাচ-রেজিস্ট্যান্ট।', img: '', featured: true },
    { id: 'LT-003', name: 'পার্ফোরেটেড লেদার', material: 'leather', color: 'ধূসর', hex: '#5a5a5a', available: true, note: 'ছিদ্রযুক্ত লেদার — বায়ু চলাচল ও স্টাইল দুটোই।', img: '', featured: true },
    { id: 'LT-004', name: 'নাপা সফট লেদার', material: 'leather', color: 'আইভরি ক্রিম', hex: '#e8dbc8', available: true, note: 'অত্যন্ত নরম নাপা লেদার, উচ্চমানের ফিনিশ।', img: '' }
].map(item => Object.freeze({ ...item })));

export const defaultGallery = Object.freeze([
    { id: 'G1', title: 'প্রাইভেট কার ডিজাইন 01', cat: 'car', img: 'assets/images/cars/1.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla Axio/Fielder'] },
    { id: 'G2', title: 'প্রাইভেট কার ডিজাইন 02', cat: 'car', img: 'assets/images/cars/2.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Aqua Hybrid'] },
    { id: 'G3', title: 'প্রাইভেট কার ডিজাইন 03', cat: 'car', img: 'assets/images/cars/3.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Allion'] },
    { id: 'G4', title: 'প্রাইভেট কার ডিজাইন 04', cat: 'car', img: 'assets/images/cars/4.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla Axio/Fielder'] },
    { id: 'G5', title: 'প্রাইভেট কার ডিজাইন 05', cat: 'car', img: 'assets/images/cars/5.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Premio'] },
    { id: 'G6', title: 'প্রাইভেট কার ডিজাইন 06', cat: 'car', img: 'assets/images/cars/6.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla Axio/Fielder'] },
    { id: 'G7', title: 'প্রাইভেট কার ডিজাইন 07', cat: 'car', img: 'assets/images/cars/7.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Noah'] },
    { id: 'G8', title: 'প্রাইভেট কার ডিজাইন 08', cat: 'car', img: 'assets/images/cars/8.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Aqua Hybrid'] },
    { id: 'G9', title: 'প্রাইভেট কার ডিজাইন 09', cat: 'car', img: 'assets/images/cars/9.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Corolla'] },
    { id: 'G10', title: 'প্রাইভেট কার ডিজাইন 10', cat: 'car', img: 'assets/images/cars/10.jpeg', desc: 'কার সিট কভার ডিজাইন', models: ['Toyota Allion'] },
    { id: 'G11', title: 'মোটরসাইকেল ডিজাইন 01', cat: 'bike', img: 'assets/images/bikes/11.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Yamaha R15'] },
    { id: 'G12', title: 'মোটরসাইকেল ডিজাইন 02', cat: 'bike', img: 'assets/images/bikes/12.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Bajaj Pulsar'] },
    { id: 'G13', title: 'মোটরসাইকেল ডিজাইন 03', cat: 'bike', img: 'assets/images/bikes/13.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Honda Hornet'] },
    { id: 'G14', title: 'মোটরসাইকেল ডিজাইন 04', cat: 'bike', img: 'assets/images/bikes/14.jpeg', desc: 'মোটরসাইকেল সিট কভার ডিজাইন', models: ['Suzuki Gixxer'] },
    { id: 'G15', title: 'রিপেয়ার ডিজাইন 01', cat: 'repair', img: 'assets/images/others/15.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ', models: ['সিট রিপেয়ার'] },
    { id: 'G16', title: 'রিপেয়ার ডিজাইন 02', cat: 'repair', img: 'assets/images/others/16.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ', models: ['ড্যাশবোর্ড রিফিনিশ'] },
    { id: 'G17', title: 'রিপেয়ার ডিজাইন 03', cat: 'repair', img: 'assets/images/others/17.jpeg', desc: 'রিপেয়ার ও রিফিনিশ কাজ', models: ['হোম ফিটিং'] }
].map(item => Object.freeze({
  ...item,
  models: Object.freeze(Array.isArray(item.models) ? [...item.models] : [])
})));

export function cloneDefaultSamples() {
  return defaultSamples.map(sample => ({ ...sample }));
}

export function cloneDefaultGallery() {
  return defaultGallery.map(item => ({
    ...item,
    models: Array.isArray(item.models) ? [...item.models] : []
  }));
}
