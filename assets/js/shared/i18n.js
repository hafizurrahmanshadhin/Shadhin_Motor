const STORAGE_KEY = 'shadhinMotorLanguage';

const LANGUAGE_LABELS = {
  bn: {
    short: 'EN',
    title: 'Switch to English',
    aria: 'Switch website language to English'
  },
  en: {
    short: 'বাং',
    title: 'বাংলায় দেখুন',
    aria: 'Switch website language to Bangla'
  }
};

const SAMPLE_TRANSLATIONS = {
  'RX-001': {
    name: 'Diamond Quilt',
    color: 'Black',
    note: 'Most popular design. Durable and easy to clean.'
  },
  'RX-002': {
    name: 'Stripe Pattern',
    color: 'Brown-Black',
    note: 'Classic striped design with long-lasting durability.'
  },
  'RX-003': {
    name: 'Plain Matte',
    color: 'Navy Blue',
    note: 'Simple and elegant. A great fit for office cars.'
  },
  'RX-004': {
    name: 'Honeycomb Texture',
    color: 'Grey',
    note: 'Hexagonal pattern with a sporty look.'
  },
  'RX-005': {
    name: 'Classic Punch',
    color: 'Red-Black',
    note: 'Perforated design for better airflow.'
  },
  'RX-006': {
    name: 'Box Quilt',
    color: 'Beige',
    note: 'Luxury box quilting for a premium cabin feel.'
  },
  'RX-007': {
    name: 'Double Stitch Line',
    color: 'White-Grey',
    note: 'Two-tone stitching with a modern finish.'
  },
  'RX-008': {
    name: 'Sport Mesh',
    color: 'Orange-Black',
    note: 'Currently out of stock. Coming back soon.'
  },
  'LT-001': {
    name: 'Smooth Full Leather',
    color: 'Black',
    note: 'Soft genuine leather. Perfect for premium vehicles.'
  },
  'LT-002': {
    name: 'Textured Leather',
    color: 'Dark Brown',
    note: 'Textured finish with long-lasting, scratch-resistant performance.'
  },
  'LT-003': {
    name: 'Perforated Leather',
    color: 'Grey',
    note: 'Perforated leather for airflow and style together.'
  },
  'LT-004': {
    name: 'Nappa Soft Leather',
    color: 'Ivory Cream',
    note: 'Ultra-soft Nappa leather with a refined premium finish.'
  }
};

const GALLERY_TRANSLATIONS = [
  { category: 'Private Car', title: 'Private Car Design 01', desc: 'Car seat cover design', model: 'Toyota Corolla Axio/Fielder' },
  { category: 'Private Car', title: 'Private Car Design 02', desc: 'Car seat cover design', model: 'Toyota Aqua Hybrid' },
  { category: 'Private Car', title: 'Private Car Design 03', desc: 'Car seat cover design', model: 'Toyota Allion' },
  { category: 'Private Car', title: 'Private Car Design 04', desc: 'Car seat cover design', model: 'Toyota Corolla Axio/Fielder' },
  { category: 'Private Car', title: 'Private Car Design 05', desc: 'Car seat cover design', model: 'Toyota Premio' },
  { category: 'Private Car', title: 'Private Car Design 06', desc: 'Car seat cover design', model: 'Toyota Corolla Axio/Fielder' },
  { category: 'Private Car', title: 'Private Car Design 07', desc: 'Car seat cover design', model: 'Toyota Noah' },
  { category: 'Private Car', title: 'Private Car Design 08', desc: 'Car seat cover design', model: 'Toyota Aqua Hybrid' },
  { category: 'Private Car', title: 'Private Car Design 09', desc: 'Car seat cover design', model: 'Toyota Corolla' },
  { category: 'Private Car', title: 'Private Car Design 10', desc: 'Car seat cover design', model: 'Toyota Allion' },
  { category: 'Motorbike', title: 'Motorbike Design 01', desc: 'Motorbike seat cover design', model: 'Yamaha R15' },
  { category: 'Motorbike', title: 'Motorbike Design 02', desc: 'Motorbike seat cover design', model: 'Bajaj Pulsar' },
  { category: 'Motorbike', title: 'Motorbike Design 03', desc: 'Motorbike seat cover design', model: 'Honda Hornet' },
  { category: 'Motorbike', title: 'Motorbike Design 04', desc: 'Motorbike seat cover design', model: 'Suzuki Gixxer' },
  { category: 'Repair', title: 'Repair Design 01', desc: 'Repair and refinish work', model: 'Seat Repair' },
  { category: 'Repair', title: 'Repair Design 02', desc: 'Repair and refinish work', model: 'Dashboard Refinish' },
  { category: 'Repair', title: 'Repair Design 03', desc: 'Repair and refinish work', model: 'Home Fitting' }
];

const ABOUT_TEAM_TRANSLATIONS = [
  {
    name: 'Md. Raihan Islam',
    role: 'Master Cutting Craftsman',
    duty: 'Prepares accurate patterns and cuts material according to the vehicle seat frame.',
    exp: 'Experience: 12+ years'
  },
  {
    name: 'Md. Sagor Hossain',
    role: 'Stitching & Design Specialist',
    duty: 'Handles panel joining, thread matching and detailed design line finishing step by step.',
    exp: 'Experience: 9+ years'
  },
  {
    name: 'Md. Naim Ahmed',
    role: 'Fitting & Finishing Technician',
    duty: 'Ensures final stretch, edge alignment and wrinkle-free fitting.',
    exp: 'Experience: 8+ years'
  },
  {
    name: 'Md. Tanvir Rahman',
    role: 'Customer Support & Delivery Assistant',
    duty: 'Looks after order follow-up, delivery coordination and after-service support.',
    exp: 'Experience: 6+ years'
  },
  {
    name: 'Md. Rakib Hasan',
    role: 'Foam Shaping Craftsman',
    duty: 'Shapes foam and balances edges to improve comfort based on the seat cushion contour.',
    exp: 'Experience: 7+ years'
  },
  {
    name: 'Md. Zahid Mia',
    role: 'Cutting Assistant',
    duty: 'Supports the master cutter with precision marking and pre-cut preparation.',
    exp: 'Experience: 5+ years'
  },
  {
    name: 'Md. Faruk Khan',
    role: 'Sewing Machine Operator',
    duty: 'Completes daily production with consistent seam depth on heavy stitch machines.',
    exp: 'Experience: 6+ years'
  },
  {
    name: 'Md. Manik Sarker',
    role: 'Side Panel Fitting Assistant',
    duty: 'Sets up door panel covers, side fitting and corner locking with care.',
    exp: 'Experience: 4+ years'
  },
  {
    name: 'Md. Al-Amin',
    role: 'Final Cleaning Executive',
    duty: 'Handles loose thread cleanup, surface finishing and final shine balance before delivery.',
    exp: 'Experience: 5+ years'
  },
  {
    name: 'Md. Hridoy Islam',
    role: 'Quality Check Assistant',
    duty: 'Checks stitch lines, fitting tension and the final quality checklist against customer specs.',
    exp: 'Experience: 4+ years'
  },
  {
    name: 'Md. Sabbir Ahmed',
    role: 'Installation & Delivery Tech',
    duty: 'Handles on-spot fitment adjustments, handover briefing and basic care instructions.',
    exp: 'Experience: 5+ years'
  }
];

const ACCESSIBILITY_EN = {
  shellAriaLabel: 'Accessibility tools',
  featureStatusTemplate: '{label} is {state}',
  featureOnLabel: 'on',
  featureOffLabel: 'off',
  targetMissingMessage: 'The target section could not be found',
  targetFoundMessage: 'You have been taken to the order section',
  readUnsupportedMessage: 'Page read-aloud is not available in this browser',
  readEmptyMessage: 'No readable page content was found',
  readStartMessage: 'Page read-aloud has started',
  readEndMessage: 'Page read-aloud has finished',
  readErrorMessage: 'Sorry, the page could not be read aloud',
  stopMessage: 'Read-aloud has been stopped',
  resetMessage: 'All settings have been reset',
  readyMessage: 'Accessibility tools are ready. Turn on any option you need.',
  toggleText: 'Accessibility',
  title: 'Accessibility tools',
  copy: 'If reading is difficult, you need more contrast, or you want simpler controls, use these options.',
  largeText: 'Large text',
  highContrast: 'High contrast',
  easyRead: 'Easy read mode',
  gotoContact: 'Go to order section',
  readAloud: 'Read page aloud',
  stopRead: 'Stop reading',
  call: 'Call now',
  reset: 'Reset all'
};

const HOME_SAMPLES_UI_TEXT_EN = {
  countAllTemplate: '{count} selected samples on the homepage',
  countFilteredTemplate: '{count} selected samples from {label}',
  buttonSelectedLabel: '✓ Selected',
  buttonDefaultLabel: '+ Add to order',
  buttonUnavailableLabel: 'Out of stock',
  materialRexineShort: 'Rexine',
  materialLeatherShort: 'Leather',
  materialRexineLong: 'Rexine',
  materialLeatherLong: 'Leather',
  modalIdPrefix: 'Sample ID:',
  modalStockAvailableLabel: '✅ Available',
  modalStockUnavailableLabel: '❌ Out of stock',
  modalOrderAvailableLabel: '✅ Select this sample',
  modalOrderSelectedLabel: '✓ Already selected — go to order',
  modalOrderUnavailableLabel: '❌ Out of stock',
  modalPreviewAlt: 'Sample preview',
  toastSampleSelectedTitle: '✅ Sample selected',
  toastSampleSelectedMessage: '{sampleId} — {sampleName} has been selected. Now fill in the order form.',
  toastChooseSampleTitle: '🪡 Choose a sample',
  toastChooseSampleMessage: 'Selecting a Sample ID helps us match the design, color and price much faster.',
  toastIncompleteTitle: '⚠️ Incomplete information',
  toastIncompleteMessage: 'Name, phone number, vehicle type and service are required.',
  toastOrderSuccessTitle: '✅ Order submitted',
  toastOrderSuccessMessage: 'Your order request has been received. We will contact you soon.',
  integrationRequiredTitle: '⚙️ Backend integration required',
  integrationRequiredMessage: 'This form is not connected to a server yet. Configure a Laravel route/controller action to enable submission.',
  confirmSelectedBadge: 'Sample selected',
  confirmSelectedTitle: 'Submit the order with this Sample ID?',
  confirmSelectedCopy: 'Your order will include sample {sampleId}. Once you confirm, we will follow up based on this sample.',
  confirmSelectedPrimaryMeta: '{material} · {color}',
  confirmSelectedSecondaryTitle: 'Before you submit',
  confirmSelectedSecondaryCopy: 'If you want to change the form or sample, you can go back and review everything now.',
  confirmSelectedSecondaryBtn: '✏️ Review again',
  confirmSelectedPrimaryBtn: '✅ Yes, submit the order',
  confirmUnselectedBadge: 'No sample selected yet',
  confirmUnselectedTitle: 'Submit the order without a Sample ID?',
  confirmUnselectedCopy: 'You can submit the form now, but choosing a sample helps us match the color, finish and material faster and more accurately.',
  confirmUnselectedPrimaryTitle: 'If you choose a sample',
  confirmUnselectedPrimaryCopy: 'Price and design matching becomes much faster',
  confirmUnselectedSecondaryTitle: 'If you submit without one',
  confirmUnselectedSecondaryCopy: 'The order will still be sent, and we will collect the details later',
  confirmUnselectedSecondaryBtn: '🪡 Choose a sample first',
  confirmUnselectedPrimaryBtn: '✅ Submit without a sample'
};

const HOME_REVIEWS_UI_TEXT_EN = {
  approvedEmptyMessage: 'No approved reviews are available yet.',
  displayMetaTemplate: 'Showing {from}-{to} of {total} reviews',
  previewTitleDefault: 'Review media',
  previewEmptyMessage: 'No preview item was found.',
  missingMediaTitle: 'Media not found',
  missingMediaMessage: 'No preview media could be prepared for this review.',
  previewCounterEmpty: '0 / 0',
  profilePreviewTitle: 'Profile photo',
  uploadMediaPreviewTitle: 'Your uploaded media',
  workMediaPreviewTitle: 'Work photos/videos',
  previewProfileExpandLabel: 'Open the profile photo in a larger view',
  previewImageExpandLabel: 'Open the image in a larger view',
  previewVideoExpandLabel: 'Open the video in a larger view',
  previewImageRemoveLabel: 'Remove this image',
  previewVideoRemoveLabel: 'Remove this video',
  previewFileRemoveLabel: 'Remove this file',
  removeActionLabel: 'Remove',
  avatarPreviewInvalid: 'This file cannot be shown as a profile preview.',
  avatarPreviewEmpty: 'Choose a profile photo to preview it here.',
  mediaPreviewEmpty: 'Choose work photos or videos to preview them here.',
  fileMetaEmpty: 'No file has been selected yet.',
  fileMetaTemplate: 'Profile: {avatar} | Media: {media}',
  mediaCountOnlyTemplate: '{count} item(s)',
  mediaCountWithNamesTemplate: '{count} item(s) ({names}{extra})',
  mediaExtraCountTemplate: ' +{count} more',
  previewKindImage: 'Image',
  previewKindVideo: 'Video',
  previewUnavailable: 'Preview unavailable',
  confirmAvatarNone: 'Not provided',
  confirmMediaNone: 'Not provided',
  confirmMediaTotalTemplate: 'Total {count} item(s)',
  confirmSummaryNameLabel: 'Your name',
  confirmSummaryWorkLabel: 'Vehicle / work info',
  confirmSummaryRatingLabel: 'Rating',
  confirmSummaryAvatarLabel: 'Profile photo',
  confirmSummaryMediaLabel: 'Work photos/videos',
  confirmSummaryCommentLabel: 'Review text',
  submitLoadingLabel: 'Submitting...',
  submitDefaultLabel: 'Submit review',
  confirmSubmitLoadingLabel: 'Submitting...',
  confirmSubmitDefaultLabel: 'Yes, submit',
  successTitle: '✅ Review submitted',
  successMessage: 'Thanks. Your review request has been received. You can later make this dynamic with Blade or a backend flow.',
  integrationRequiredTitle: '⚙️ Backend integration required',
  integrationRequiredMessage: 'The review form is not connected to a server yet. Configure a Laravel route/controller action to enable submission.',
  errorTitle: '⚠️ Review was not submitted',
  submitErrorMessage: 'The review could not be submitted. Please try again.',
  incompleteTitle: '⚠️ Incomplete information',
  incompleteMessage: 'Name, work information and a review message are required.',
  invalidRatingTitle: '⚠️ Invalid rating',
  invalidRatingMessage: 'Rating must be 1, 2, 3, 4 or 5 only.',
  invalidAvatarTitle: '⚠️ Invalid profile file',
  invalidAvatarMessage: 'Please upload an image file as the profile photo.',
  avatarSizeTitle: '⚠️ Profile file too large',
  avatarSizeMessage: 'The profile photo must be within 100MB.',
  invalidMediaTypeTitle: '⚠️ Invalid media file',
  invalidMediaTypeMessage: 'Please upload image or video files only.',
  mediaImageSizeTitle: '⚠️ Image file too large',
  mediaImageSizeMessage: 'Each image file must be within 100MB.',
  mediaVideoSizeTitle: '⚠️ Video file too large',
  mediaVideoSizeMessage: 'Each video file must be within 10GB.',
  mediaLimitTitle: '⚠️ Too many files',
  mediaLimitMessage: 'You can upload up to 6 image/video files.'
};

const SAMPLES_CATALOG_UI_TEXT_EN = {
  modalIdPrefix: 'Sample ID:',
  materialRexineLong: 'Rexine',
  materialLeatherLong: 'Leather',
  modalStockAvailableLabel: '✅ Available',
  modalStockUnavailableLabel: '❌ Out of stock',
  modalOrderAvailableLabel: '✅ Order with this sample',
  modalOrderUnavailableLabel: '❌ Out of stock',
  modalPreviewAlt: 'Sample preview'
};

function resolveLanguage(language) {
  return language === 'bn' ? 'bn' : 'en';
}

function getDefaultDocumentLanguage() {
  const authoredLanguage = String(document.documentElement.lang || '').toLowerCase();
  return authoredLanguage.startsWith('bn') ? 'bn' : 'en';
}

function isClientLocalizationEnabled() {
  // Keep client-side copy mutation opt-in so Blade/server-rendered content
  // stays the primary source of truth unless a page explicitly enables it.
  return document.documentElement.dataset.clientI18n === 'true';
}

function getPreferredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? resolveLanguage(stored) : getDefaultDocumentLanguage();
  } catch {
    return getDefaultDocumentLanguage();
  }
}

function setPreferredLanguage(language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, resolveLanguage(language));
  } catch { }
}

function setDocumentLanguage(language) {
  const normalizedLanguage = resolveLanguage(language);
  const resolvedLanguage = normalizedLanguage === 'en' ? 'en' : 'bn-BD';
  document.documentElement.lang = resolvedLanguage;
  document.documentElement.dataset.language = normalizedLanguage;

  document.getElementById('localeLink')?.setAttribute('hreflang', normalizedLanguage === 'en' ? 'en' : 'bn-BD');
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', normalizedLanguage === 'en' ? 'en_US' : 'bn_BD');
}

function setText(selector, value, root = document) {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
}

function setHtml(selector, value, root = document) {
  const element = root.querySelector(selector);
  if (element) element.innerHTML = value;
}

function setAttr(selector, name, value, root = document) {
  const element = root.querySelector(selector);
  if (element) element.setAttribute(name, value);
}

function setTexts(selector, values, root = document) {
  root.querySelectorAll(selector).forEach((element, index) => {
    if (values[index] == null) return;
    element.textContent = values[index];
  });
}

function setHtmls(selector, values, root = document) {
  root.querySelectorAll(selector).forEach((element, index) => {
    if (values[index] == null) return;
    element.innerHTML = values[index];
  });
}

function setOptionTexts(selector, values, root = document) {
  const select = root.querySelector(selector);
  if (!(select instanceof HTMLSelectElement)) return;

  Array.from(select.options).forEach((option, index) => {
    if (values[index] == null) return;
    option.textContent = values[index];
  });
}

function updateUiTextRoot(rootId, translations) {
  const root = document.getElementById(rootId);
  if (!root) return;

  Object.entries(translations).forEach(([key, value]) => {
    const node = root.querySelector(`[data-key="${key}"]`);
    if (node) node.textContent = value;
  });
}

function getActiveSectionHash() {
  const activeNavLink = document.querySelector('#navLinks a[aria-current="location"][href^="#"], #navLinks a.active[href^="#"]');
  const activeNavHash = activeNavLink?.getAttribute('href');
  if (activeNavHash) return activeNavHash;

  const sections = Array.from(document.querySelectorAll('main section[id]'));
  if (!sections.length) return window.location.hash || '';

  const topbar = document.getElementById('navbar') || document.getElementById('catalogTopbar');
  const topbarHeight = topbar instanceof HTMLElement
    ? (topbar.getBoundingClientRect().height || topbar.offsetHeight || 0)
    : 0;
  const viewportAnchor = topbarHeight + Math.max(24, Math.round(window.innerHeight * 0.12));

  let currentSection = sections[0];

  sections.forEach(section => {
    if (!(section instanceof HTMLElement)) return;

    const rect = section.getBoundingClientRect();
    if (rect.top <= viewportAnchor) {
      currentSection = section;
    }

    if (rect.top <= viewportAnchor && rect.bottom >= viewportAnchor) {
      currentSection = section;
    }
  });

  return currentSection?.id ? `#${currentSection.id}` : (window.location.hash || '');
}

function preserveCurrentViewHash() {
  const currentUrl = new URL(window.location.href);
  const activeSectionHash = getActiveSectionHash();

  currentUrl.hash = activeSectionHash || '';
  history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
}

function ensureLanguageToggle(language) {
  const cta = document.querySelector('#sharedFloatingCta .floating-cta');
  if (!cta) return;
  const normalizedLanguage = resolveLanguage(language);

  let button = cta.querySelector('[data-language-toggle]');

  if (!(button instanceof HTMLButtonElement)) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'floating-cta-btn language';
    button.dataset.languageToggle = 'true';
    cta.prepend(button);
  }

  const labels = normalizedLanguage === 'en' ? LANGUAGE_LABELS.en : LANGUAGE_LABELS.bn;
  const nextLanguage = normalizedLanguage === 'en' ? 'bn' : 'en';

  button.textContent = labels.short;
  button.setAttribute('title', labels.title);
  button.setAttribute('aria-label', labels.aria);
  button.dataset.nextLanguage = nextLanguage;

  if (button.dataset.boundLanguageToggle === 'true') return;

  button.dataset.boundLanguageToggle = 'true';
  button.addEventListener('click', () => {
    preserveCurrentViewHash();
    setPreferredLanguage(button.dataset.nextLanguage);
    window.location.reload();
  });
}

function updateSharedFloatingCta() {
  setAttr('#sharedFloatingCta .floating-cta', 'aria-label', 'Quick contact actions');
  setAttr('#sharedFloatingCta .floating-cta-btn.wa', 'aria-label', 'Send a WhatsApp message');
  setAttr('#sharedFloatingCta .floating-cta-btn.call', 'aria-label', 'Call now');
}

function updateAccessibilityUi() {
  const shell = document.querySelector('.a11y-tools');
  if (!shell) return;

  shell.setAttribute('aria-label', ACCESSIBILITY_EN.shellAriaLabel);
  shell.dataset.featureStatusTemplate = ACCESSIBILITY_EN.featureStatusTemplate;
  shell.dataset.featureOnLabel = ACCESSIBILITY_EN.featureOnLabel;
  shell.dataset.featureOffLabel = ACCESSIBILITY_EN.featureOffLabel;
  shell.dataset.targetMissingMessage = ACCESSIBILITY_EN.targetMissingMessage;
  shell.dataset.targetFoundMessage = ACCESSIBILITY_EN.targetFoundMessage;
  shell.dataset.readUnsupportedMessage = ACCESSIBILITY_EN.readUnsupportedMessage;
  shell.dataset.readEmptyMessage = ACCESSIBILITY_EN.readEmptyMessage;
  shell.dataset.readStartMessage = ACCESSIBILITY_EN.readStartMessage;
  shell.dataset.readEndMessage = ACCESSIBILITY_EN.readEndMessage;
  shell.dataset.readErrorMessage = ACCESSIBILITY_EN.readErrorMessage;
  shell.dataset.stopMessage = ACCESSIBILITY_EN.stopMessage;
  shell.dataset.resetMessage = ACCESSIBILITY_EN.resetMessage;
  shell.dataset.readyMessage = ACCESSIBILITY_EN.readyMessage;

  setText('.a11y-tools-toggle-text', ACCESSIBILITY_EN.toggleText, shell);
  setText('.a11y-tools-title', ACCESSIBILITY_EN.title, shell);
  setText('.a11y-tools-copy', ACCESSIBILITY_EN.copy, shell);
  setTexts('.a11y-tools-action', [
    ACCESSIBILITY_EN.largeText,
    ACCESSIBILITY_EN.highContrast,
    ACCESSIBILITY_EN.easyRead,
    ACCESSIBILITY_EN.gotoContact,
    ACCESSIBILITY_EN.readAloud,
    ACCESSIBILITY_EN.stopRead,
    ACCESSIBILITY_EN.reset
  ], shell);
  setTexts('.a11y-tools-link', [ACCESSIBILITY_EN.call, 'WhatsApp'], shell);
}

function applySharedFooterTranslations(homeLogoAria, creditHref) {
  const footer = document.getElementById('sharedFooter');
  if (!footer) return;

  setText('#siteFooterTitle', 'Footer information and contact', footer);
  setAttr('.footer-logo-link', 'aria-label', homeLogoAria, footer);
  setText('.footer-brand p', 'We specialize in seat covers for private cars and motorcycles, using high-quality rexine and leather in custom designs.', footer);
  setTexts('.footer-col h3', ['Location', 'Services', 'Contact'], footer);
  setText('.footer-location-address', 'Ali & Nur Real Estate Ltd. (behind the glass factory), Mohammadpur, Dhaka-1207', footer);
  setAttr('#footer-location-map', 'aria-label', 'View the location on Google Maps', footer);
  setText('#footer-location-map', '📍 View location on Google Maps', footer);
  setText('.footer-location-note', 'Open Maps and start navigation to find the workshop easily.', footer);

  const serviceLinks = footer.querySelectorAll('.footer-col:nth-of-type(3) a');
  if (serviceLinks.length) {
    const values = ['New seat covers', 'Seat cover repair', 'Custom design', 'Motorbike seats', 'Home fitting'];
    serviceLinks.forEach((link, index) => {
      if (values[index] != null) link.textContent = values[index];
    });
  }

  const contactLinks = footer.querySelectorAll('.footer-col:nth-of-type(4) a');
  if (contactLinks.length) {
    const values = [
      'Place an order',
      'View rexine & leather samples',
      'View work samples',
      'Learn about the workshop & team',
      'Customer reviews'
    ];
    contactLinks.forEach((link, index) => {
      if (values[index] != null) link.textContent = values[index];
    });
  }

  setText('.footer-copyright', '© 2026 Shadhin Motor.', footer);
  const creditLink = footer.querySelector('.footer-credit a');
  if (creditLink) {
    creditLink.textContent = 'Shadhin Motor';
    if (creditHref) creditLink.setAttribute('href', creditHref);
  }
}

function applySampleTranslations(root = document) {
  root.querySelectorAll('.sample-card').forEach(card => {
    const sampleId = String(card.dataset.sampleId || '').trim();
    const translation = SAMPLE_TRANSLATIONS[sampleId];
    if (!translation) return;

    card.dataset.sampleName = translation.name;
    card.dataset.color = translation.color;
    card.dataset.note = translation.note;

    const material = String(card.dataset.material || '').trim();
    const materialText = material === 'leather' ? 'Leather' : 'Rexine';
    const nameNode = card.querySelector('.sample-card-name');
    const colorNode = card.querySelector('.sample-card-color-name');
    const noteNode = card.querySelector('.sample-card-note');
    const materialNode = card.querySelector('.sample-card-material-tag');
    const previewTrigger = card.querySelector('.sample-card-preview');
    const stockBadge = card.querySelector('.sample-card-stock-badge');
    const featuredBadge = card.querySelector('.sample-card-featured-badge');
    const orderBtn = card.querySelector('.sample-card-order-btn');
    const image = card.querySelector('.sample-card-swatch img');

    if (nameNode) nameNode.textContent = translation.name;
    if (colorNode) colorNode.textContent = translation.color;
    if (noteNode) noteNode.textContent = translation.note;
    if (materialNode) materialNode.textContent = materialText;
    if (previewTrigger) previewTrigger.setAttribute('aria-label', `${sampleId} ${translation.name}`);
    if (stockBadge) stockBadge.textContent = 'Out of stock';
    if (featuredBadge) featuredBadge.textContent = 'Popular choice';

    if (orderBtn instanceof HTMLButtonElement) {
      if (orderBtn.disabled) {
        orderBtn.textContent = 'Out of stock';
      } else if (orderBtn.dataset.orderSampleId) {
        orderBtn.textContent = 'Start order';
      } else if (orderBtn.dataset.selectSampleId) {
        orderBtn.textContent = '+ Add to order';
      }
    }

    if (image instanceof HTMLImageElement) {
      image.alt = `${translation.name} (${sampleId})`;
    }
  });
}

function applyGalleryTranslations(root = document) {
  const triggers = Array.from(root.querySelectorAll('.gallery-item-trigger, .gallery-card-trigger'));

  triggers.forEach(trigger => {
    const rawIndex = trigger.dataset.idx || trigger.dataset.galleryIndex || '';
    const index = Number.parseInt(rawIndex, 10);
    if (!Number.isInteger(index) || !GALLERY_TRANSLATIONS[index]) return;

    const translation = GALLERY_TRANSLATIONS[index];
    const card = trigger.closest('.gallery-item, .gallery-card');
    const shell = trigger.closest('.gallery-item-shell, .gallery-card-item');
    const image = trigger.querySelector('img');
    const placeholderLabel = card?.querySelector('.gallery-item-placeholder-label, .gallery-card-placeholder-label');
    const categoryNode = card?.querySelector('.gallery-overlay-cat, .gallery-card-cat');
    const titleNode = card?.querySelector('.gallery-overlay-title, .gallery-card-title');
    const descNode = card?.querySelector('.gallery-overlay-desc, .gallery-card-desc');
    const modelPills = card?.querySelectorAll('.gallery-card-model-pill') || [];
    const groupBadge = card?.querySelector('.gallery-card-group-badge');

    trigger.dataset.galleryTitle = translation.title;
    trigger.dataset.galleryDesc = translation.desc;
    trigger.setAttribute('aria-label', `${translation.category}: ${translation.title}`);

    if (image instanceof HTMLImageElement) {
      image.alt = translation.title;
    }
    if (placeholderLabel) placeholderLabel.textContent = translation.category;
    if (categoryNode) categoryNode.textContent = translation.category;
    if (titleNode) titleNode.textContent = translation.title;
    if (descNode) descNode.textContent = translation.desc;

    modelPills.forEach(pill => {
      pill.textContent = translation.model;
    });

    if (groupBadge) {
      const count = Number.parseInt(groupBadge.textContent, 10);
      if (Number.isInteger(count)) {
        groupBadge.textContent = `${count} photos`;
      }
    }

    if (shell instanceof HTMLElement && shell.classList.contains('gallery-card-item')) {
      const categoryToken = translation.category.toLowerCase();
      shell.dataset.search = `${translation.title} ${translation.desc} ${translation.model} ${categoryToken}`;
    }
  });
}

function applyAboutTeamTranslations() {
  setAttr('.about-owner-photo-btn', 'data-team-preview-name', 'Founder & Lead Craftsman');
  setAttr('.about-owner-photo-btn', 'aria-label', 'Open a larger preview of the founder and lead craftsman');
  setAttr('.about-owner-photo', 'alt', 'Photo of the Shadhin Motor owner');

  const cards = document.querySelectorAll('.about-team-card');
  cards.forEach((card, index) => {
    const translation = ABOUT_TEAM_TRANSLATIONS[index];
    if (!translation) return;

    const previewBtn = card.querySelector('.about-team-photo-btn');
    const image = card.querySelector('.about-team-photo');

    if (previewBtn) {
      previewBtn.dataset.teamPreviewName = translation.name;
      previewBtn.dataset.teamPreviewRole = translation.role;
      previewBtn.setAttribute('aria-label', `Open a larger preview of ${translation.name}`);
    }

    if (image instanceof HTMLImageElement) {
      image.alt = `Team member photo: ${translation.name}`;
    }

    setText('.about-team-name', translation.name, card);
    setText('.about-team-role', translation.role, card);
    setText('.about-team-duty', translation.duty, card);
    setText('.about-team-exp', translation.exp, card);
  });

  const previewOverlay = document.getElementById('aboutTeamPreviewOverlay');
  if (previewOverlay) {
    previewOverlay.dataset.defaultName = 'Shadhin Motor Team';
    previewOverlay.dataset.defaultRole = 'Team member';
    previewOverlay.dataset.previewAltSuffix = 'Large preview';
  }

  setAttr('#aboutTeamPreviewCloseBtn', 'aria-label', 'Close preview');
  setAttr('#aboutTeamPreviewImage', 'alt', 'Shadhin Motor Team - large preview');
  setText('#aboutTeamPreviewName', 'Shadhin Motor Team');
  setText('#aboutTeamPreviewRole', 'Team member');
}

function applyHomeMeta() {
  document.title = 'Shadhin Motor';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Shadhin Motor provides rexine and leather seat cover making, repair, custom design and home fitting for private cars and motorcycles in Dhaka and across the Dhaka Division.');
  document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'car seat cover Dhaka, motorcycle seat cover Dhaka, rexine seat cover, leather seat cover, custom seat cover, Shadhin Motor');
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Shadhin Motor | Seat Cover Service in Dhaka');
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', 'Rexine and leather seat cover making, repair, custom design and home fitting for private cars and motorcycles in Dhaka and the full Dhaka Division.');
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', 'Shadhin Motor | Seat Cover Service in Dhaka');
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', 'Seat cover service for private cars and motorcycles in Dhaka and across the Dhaka Division.');

  const structuredData = document.getElementById('pageStructuredData');
  if (!structuredData) return;

  try {
    const payload = JSON.parse(structuredData.textContent);
    const translateNode = node => {
      if (!node || typeof node !== 'object') return;

      if (Array.isArray(node)) {
        node.forEach(translateNode);
        return;
      }

      if (node.inLanguage) node.inLanguage = 'en';
      if (node.description === 'ঢাকায় প্রাইভেট কার ও মোটরসাইকেলের রেক্সিন ও চামড়ার সিট কভার তৈরি, রিপেয়ার, কাস্টম ডিজাইন ও হোম ফিটিং সার্ভিস।') {
        node.description = 'Rexine and leather seat cover making, repair, custom design and home fitting for private cars and motorcycles in Dhaka.';
      }
      if (node.description === 'Shadhin Motor ঢাকায় প্রাইভেট কার ও মোটরসাইকেলের রেক্সিন ও চামড়ার সিট কভার তৈরি, রিপেয়ার, কাস্টম ডিজাইন ও হোম ফিটিং সার্ভিস দেয়।') {
        node.description = 'Shadhin Motor provides rexine and leather seat cover making, repair, custom design and home fitting for private cars and motorcycles in Dhaka.';
      }
      if (node.streetAddress === 'আলী এন্ড নুর রিয়েল এস্টেট লিঃ (গ্লাস ফ্যাক্টরির পিছনে)') {
        node.streetAddress = 'Ali & Nur Real Estate Ltd. (behind the glass factory)';
      }
      if (node.name === 'Shadhin Motor কোন কোন এলাকায় সিট কভার সার্ভিস দেয়?') {
        node.name = 'Which areas does Shadhin Motor serve for seat covers?';
      }
      if (node.text === 'আমরা ঢাকা শহর, সাভার, গাজীপুর, নারায়ণগঞ্জসহ পুরো ঢাকা বিভাগে প্রাইভেট কার ও মোটরসাইকেলের সিট কভার সার্ভিস দিয়ে থাকি।') {
        node.text = 'We provide seat cover service for private cars and motorcycles in Dhaka city, Savar, Gazipur, Narayanganj and across the Dhaka Division.';
      }
      if (node.name === 'রেক্সিন ও চামড়ার সিট কভার দুটোই কি পাওয়া যায়?') {
        node.name = 'Do you offer both rexine and leather seat covers?';
      }
      if (node.text === 'হ্যাঁ, আমরা রেক্সিন ও চামড়া দুই ধরনের সিট কভারই তৈরি করি। আপনার বাজেট, ডিজাইন ও ব্যবহারের উপর ভিত্তি করে উপযুক্ত মেটেরিয়াল সাজেস্ট করা হয়।') {
        node.text = 'Yes. We make both rexine and leather seat covers and suggest the best material based on your budget, design and usage.';
      }
      if (node.name === 'Sample ID দিয়ে কীভাবে অর্ডার করতে হয়?') {
        node.name = 'How do I order with a Sample ID?';
      }
      if (node.text === 'ওয়েবসাইটের স্যাম্পল সেকশন থেকে পছন্দের Sample ID বেছে নিয়ে অর্ডার ফর্মে জমা দিলেই আমরা সেই অনুযায়ী মূল্য ও কাজের বিস্তারিত জানিয়ে দিই।') {
        node.text = 'Choose your preferred Sample ID from the sample section and submit it through the order form. We will then share the price and work details accordingly.';
      }
      if (node.name === 'হোম ফিটিং সার্ভিস আছে কি?') {
        node.name = 'Do you offer home fitting service?';
      }
      if (node.text === 'হ্যাঁ, কাজ শেষ হলে প্রয়োজন অনুযায়ী গাড়িতে গিয়ে সিট কভার ফিটিং সার্ভিস দেওয়া হয়।') {
        node.text = 'Yes. When needed, we go to your vehicle and complete the final seat cover fitting after the work is finished.';
      }

      Object.values(node).forEach(translateNode);
    };

    translateNode(payload);
    structuredData.textContent = JSON.stringify(payload);
  } catch { }
}

function applyHomeStaticCopy() {
  setText('.skip-link', 'Skip to main content');
  setAttr('.site-header .nav-logo', 'aria-label', 'Go to the Shadhin Motor home section');
  setTexts('#navLinks a', ['Services', 'About Us', 'Gallery', 'Samples', 'Process', 'Vehicle Types', 'Service Areas', 'Reviews', 'Order Now']);
  setAttr('#hamburger', 'aria-label', 'Open menu');
  setAttr('#hamburger', 'data-open-label', 'Open menu');
  setAttr('#hamburger', 'data-close-label', 'Close menu');
  setText('#heroStatsTitle', 'Business highlights');

  setText('.hero-badge', 'Shadhin Motor — Seat Cover Specialists');
  setHtml('#heroTitle', '<span class="hero-title-main">Refresh your car or bike with a</span><span class="accent">Custom Seat Cover</span><span class="bn">that fits like new</span>');
  setText('.hero-subtitle', 'High-quality rexine and leather seat covers for private cars and motorcycles. Custom design, new builds, repairs and home fitting across Dhaka and the entire Dhaka Division.');
  setTexts('.hero-actions a', ['🪡 Browse samples', '📞 Contact us']);
  setTexts('.stat-card .stat-num', ['1000+', '30+', '100%']);
  setTexts('.stat-card .stat-label', ['completed jobs', 'years experience', 'custom design']);

  setText('#services .section-label', 'Our Services');
  setHtml('#servicesTitle', 'What We <span>Do</span>');
  setText('#services .section-lead', 'We recommend the right seat cover solution based on your vehicle type, usage and budget. New builds, repair, custom design and home fitting are all handled in one place.');
  setHtmls('#services .service-card .service-title', [
    'New Seat Cover Build',
    'Seat Cover Repair',
    'Custom Design',
    'Motorbike Seats',
    'Home Fitting',
    'Quality Guarantee'
  ]);
  setTexts('#services .service-card .service-desc', [
    'Custom rexine or leather seat covers for private cars in your preferred color, design and material.',
    'We repair worn or torn seat covers and restore them with fast, durable finishing.',
    'Pick from samples or bring your own idea and we will build the exact design for you.',
    'Seat covers for every kind of motorbike, including new builds and repairs with quality rexine.',
    'After production, we can go to your vehicle and complete the fitting for a full at-home service experience.',
    'We use top-grade rexine and leather, with strong stitching built to last.'
  ]);
  setTexts('#services .service-card .service-tag', ['Private Car', 'Repair', 'Design', 'Motorbike', 'Fitting', 'Guarantee']);

  setText('#about .section-label', 'About Us');
  setHtml('#aboutTitle', 'Workshop, Experience & <span>Our Team</span>');
  setText('#about .section-lead', 'Shadhin Motor does more than sell seat covers. We upgrade the full comfort and look of your vehicle interior. This section brings together our workshop process, experience and skilled team.');
  setText('.about-story-card h3', 'How Shadhin Motor Works');
  setText('.about-story-card > p', 'For years we have worked as a trusted local workshop for car and motorbike seat cover making, repair and custom fitment. Every job is handled around customer preference, budget and long-term daily use.');
  setTexts('.about-story-actions a', ['📍 See the workshop location in the footer', '🗺️ Open Google Maps']);
  setAttr('.about-map-inline-link', 'aria-label', 'Open the workshop location in Google Maps');
  setHtmls('.about-highlights li', [
    '<strong>Workshop-based process:</strong> measuring, cutting, stitching and finishing in one place',
    '<strong>Material guidance:</strong> practical advice on rexine vs. leather',
    '<strong>Fitment focus:</strong> exact fitting by vehicle model to improve the cabin look',
    '<strong>After-support:</strong> post-fitting checks and minor adjustments when needed'
  ]);

  setText('.about-owner-name', 'Founder & Lead Craftsman');
  setText('.about-owner-desc', 'Every important step on the shop floor is supervised directly to maintain quality. From design selection to final fitting, hands-on experience helps us finish work quickly and accurately to match each customer need.');
  setTexts('.about-owner-meta span', ['Experience', 'Core skill', 'Coverage']);
  setTexts('.about-owner-meta strong', ['30+ years', 'Custom Fit & Stitching', 'Dhaka & Dhaka Division']);
  setText('.about-team-head h3', 'Our Team');
  setText('.about-team-head p', 'Each member handles a specific responsibility so that cutting, stitching, foam shaping and fitting remain accurate and the final output feels premium.');

  setText('#gallery .section-label', 'Our Work');
  setHtml('#galleryTitle', 'Work <span>Samples</span>');
  setText('#gallery .section-lead', 'See real work samples first so you can understand the design, fitting and finish in advance. You can quickly compare private car, motorbike and repair categories and choose what suits your vehicle best.');
  setTexts('#gallery .filter-btn', ['All', '🚗 Private Car', '🏍️ Motorbike', '🔧 Repair']);
  setAttr('#gallery .gallery-filter', 'aria-label', 'Gallery category filters');
  setHtml('.gallery-count-info', 'Total <strong id="galleryTotalCount">17</strong> designs · hover / drag to explore');
  setText('#galleryViewAllBtn', 'View all');
  setAttr('#lightboxPrevBtn', 'aria-label', 'Previous image');
  setAttr('#lightboxNextBtn', 'aria-label', 'Next image');
  setText('#lightboxTitle', 'Gallery preview');
  setAttr('#lightboxCloseBtn', 'aria-label', 'Close');

  setText('#samples .section-label', 'Choose a Material');
  setHtml('#samplesTitle', 'Rexine & Leather <span>Samples</span>');
  setHtml('.samples-section-lead', 'Choose the sample you prefer and place the order with its <strong class="text-gold">Sample ID</strong> — we will then share the correct rexine or leather price.');
  setTexts('.selected-sample-bar-actions > *', ['📋 Order with this sample', '✕ Cancel']);
  setAttr('.samples-filter-group', 'aria-label', 'Sample material filters');
  setTexts('#samples .sample-filter-btn', ['All', '🪡 Rexine', '🧥 Leather']);
  setHtml('#samplesViewAllBtn', 'View all samples <span>↗</span>');
  setText('.form-sample-heading', 'Selected sample');
  setText('#formSampleClearBtn', '✕ Change');
  setText('[data-sample-meta="material"]', 'Material');
  setText('[data-sample-meta="color"]', 'Color');
  setText('[data-sample-meta="availability"]', 'Availability');
  setAttr('#sampleModalCloseBtn', 'aria-label', 'Close');
  setText('#sampleModalName', 'Sample preview');
  setText('.sample-modal .visually-hidden', 'Preview of the selected sample');

  setText('#process .section-label', 'How It Works');
  setHtml('#processTitle', 'How To <span>Order</span>');
  setText('#process .section-lead', 'We arranged the full order journey step by step so it stays easy to follow. From selecting a Sample ID to confirmation, production and final fitting, every step is clearly explained.');
  setTexts('#process .step-title', ['Choose a sample', 'Place the order', 'In production', 'Fitting & delivery']);
  setTexts('#process .step-desc', [
    'Browse rexine and leather samples on the website. Note your preferred Sample ID so we can confirm the correct price quickly.',
    'Place the order with your vehicle model and preferred design. Work starts after the advance payment.',
    'Our skilled craftsmen cut and stitch the material according to your chosen design and build the full seat cover.',
    'When the work is ready, we fit the seat cover on your vehicle and complete the remaining payment.'
  ]);
  setAttr('#process .step-link[href="#samples"]', 'aria-label', 'Open the sample selection step and go to the material section');
  setAttr('#process .step-link[href="#contact"]', 'aria-label', 'Open the order step and go to the contact section');
  setTexts('#process .step-num', ['1', '2', '3', '4']);

  setText('#vehicles .section-label', 'What We Cover');
  setHtml('#vehiclesTitle', 'Seat Covers for <span class="text-gold-light">Any Vehicle</span>');
  setText('#vehicles .vehicles-info > p', 'From private cars to motorcycles, we specialize in seat covers for every kind of vehicle. High-quality rexine and leather are used for durable, long-lasting work.');
  setHtmls('.vehicle-list li', [
    '<span>🚗</span> Sedans — Corolla, City, Allion',
    '<span>🚙</span> SUVs — CR-V, RAV4, Tucson, Fortuner',
    '<span>🚐</span> Microbuses — Hiace, Noah',
    '<span>🏍️</span> Motorbikes — Bajaj, Yamaha, Honda'
  ]);
  setTexts('.vehicles-visual .v-card h3', ['Rexine', 'Leather', 'Custom Cutting', 'Strong Stitching']);
  setTexts('.vehicles-visual .v-card p', [
    'Durable, cost-effective and easy to clean',
    'Premium look and feel with long-lasting performance',
    'Perfect fit based on the exact vehicle measurement',
    'Strong and clean stitching by skilled craftsmen'
  ]);

  setText('#local-seo .section-label', 'Dhaka & Dhaka Division');
  setHtml('#localSeoTitle', 'Seat Cover <span>Service in Dhaka</span>');
  setText('#local-seo .section-lead', 'Shadhin Motor mainly provides rexine and leather seat cover making, repair, custom design and fitting for private cars, SUVs, microbuses and motorbikes in Dhaka and across the Dhaka Division. We keep our service, area coverage and order process clearly explained here so local customers can find us easily.');
  setText('.local-seo-copy h3', 'Where we work across Dhaka');
  setHtml('.local-seo-copy p', 'We are ready to provide seat cover service across Dhaka city, Savar, Gazipur, Narayanganj and the full Dhaka Division. If you need durable rexine or premium leather covers for a private car, SUV, microbus or motorbike, Shadhin Motor can build a custom solution for you.<br> <br>Before ordering, you can browse samples and choose a Sample ID. After that, we confirm the right price and delivery time based on your vehicle type and preferred design. Home fitting service is also available when needed.');
  setTexts('.service-area-tag', ['Dhaka City', 'Savar', 'Gazipur', 'Narayanganj', 'Dhaka Division', 'Bangladesh']);
  setTexts('.faq-question-text', [
    'What types of vehicle seat covers do you make?',
    'Which is better: rexine or leather?',
    'How do I place an order?'
  ]);
  setTexts('.faq-answer', [
    'We build and repair custom seat covers for private cars, SUVs, microbuses and motorbikes.',
    'Both can be good depending on your budget, usage and preference. Rexine is cost-effective and easy to clean, while leather gives a premium look and feel.',
    'Choose a sample from the website, note the Sample ID and submit the order form, or contact us directly by phone.'
  ]);

  setText('#reviews .section-label', 'Customer Opinions');
  setHtml('#reviewsTitle', 'Customer <span>Reviews</span>');
  setText('#reviews .section-lead', 'This section shows the real experiences, ratings and comments of customers who used our seat cover service. Each review reflects direct feedback on quality, fitting, timeline and overall service.');
  setHtml('.reviews-summary-meta', 'Verified reviews: <strong id="reviewsCount">11</strong>');
  setTexts('.reviews-summary-actions .btn-secondary, .reviews-rail-head .btn-secondary', ['Leave a review', 'Leave a review']);
  setText('.reviews-summary-actions .btn-primary', 'Place your order');
  setText('.review-submit-badge', 'Share your review of our work');
  setText('#reviewModalTitle', 'Review Shadhin Motor');
  setText('#reviewModalCopy', 'Submit your review with photos or videos. After approval from the dashboard, the selected review can be shown on the homepage.');
  setTexts('#reviewSubmitForm label', [
    'Your name',
    'Vehicle / work info',
    'Rating (1-5)',
    'Profile photo (optional)',
    'Review text',
    'Work photos/videos (optional)'
  ]);
  setAttr('#reviewUserName', 'placeholder', 'For example: Md. Rashed');
  setAttr('#reviewWorkInfo', 'placeholder', 'For example: Toyota Axio • Mirpur');
  setAttr('#reviewUserComment', 'placeholder', 'Write about the quality, fitting and service experience');
  setOptionTexts('#reviewUserRating', ['Select a rating', '5 ★', '4 ★', '3 ★', '2 ★', '1 ★']);
  setTexts('.review-file-preview-empty', ['Choose a profile photo to preview it here.', 'Choose work photos/videos to preview them here.']);
  setText('.review-submit-hint', 'You can upload 0-6 image/video files. Image max 100MB, video max 10GB.');
  setText('#reviewSubmitFileMeta', 'No file has been selected yet.');
  setTexts('.review-submit-actions button', ['Cancel', 'Submit review']);
  setAttr('#closeReviewModalBtn', 'aria-label', 'Close');
  setAttr('#reviewSubmitConfirmClose', 'aria-label', 'Close');
  setText('.review-confirm-badge', 'Review before you submit');
  setText('#reviewSubmitConfirmTitle', 'Do you want to submit this review?');
  setText('#reviewSubmitConfirmCopy', 'Please review it once. If anything is wrong, you can edit it before submitting.');
  setTexts('.review-confirm-actions button', ['Edit again', 'Yes, submit']);
  setAttr('#reviewPreviewPrev', 'aria-label', 'Previous media');
  setAttr('#reviewPreviewNext', 'aria-label', 'Next media');
  setText('#reviewPreviewTitle', 'Review media');
  setText('#reviewPreviewFullscreenBtn', 'Fullscreen');
  setAttr('#reviewPreviewClose', 'aria-label', 'Close');

  setText('#contact .section-label', 'Contact');
  setHtml('#contactTitle', 'Place an Order or <span>Talk to Us</span>');
  setText('#contact .section-lead', 'If you want to place an order or ask about material, design, pricing, fitting or the type of work, contact us directly from here. We will quickly help you choose the right seat cover for your car or motorcycle.');
  setText('.contact-info > h3', 'Contact us');
  setTexts('.contact-item-text h3', ['Address', 'Phone number', 'Opening hours', 'Advance payment']);
  setText('.contact-item[data-contact-field="address"] address', 'Ali & Nur Real Estate Ltd. (behind the glass factory), Mohammadpur, Dhaka-1207');
  setHtml('.contact-item[data-contact-field="phone"] p', '<a href="tel:+8801911387254">01911&#8209;387254</a><br><time datetime="09:00">9:00 AM</time> — <time datetime="21:00">9:00 PM</time>');
  setHtml('.contact-item[data-contact-field="hours"] p', 'Saturday — Thursday: <time datetime="09:00">9:00 AM</time> — <time datetime="21:00">9:00 PM</time><br>Friday: <time datetime="10:00">10:00 AM</time> — <time datetime="17:00">5:00 PM</time>');
  setText('.contact-item[data-contact-field="payment"] p', 'Work starts with an advance payment at the time of order. The remaining payment is completed on delivery.');

  setTexts('.order-form label', [
    'Your name *',
    'Phone number *',
    'Vehicle type *',
    'Vehicle model',
    'Service type *',
    'Preferred material',
    'Details / special request'
  ]);
  setAttr('#custName', 'placeholder', 'Write your full name');
  setAttr('#custPhone', 'placeholder', '01XXX-XXXXXX');
  setAttr('#carModel', 'placeholder', 'For example: Toyota Corolla');
  setAttr('#orderDetails', 'placeholder', 'Describe the design, color preference or any other detail...');
  setOptionTexts('#vehicleType', ['Select one', 'Private Car', 'SUV / Jeep', 'Microbus', 'Motorbike']);
  setOptionTexts('#serviceType', ['Select one', 'New seat cover build', 'Seat cover repair', 'Custom design', 'Fitting service']);
  setOptionTexts('#material', ['Select one', 'Rexine', 'Leather', 'Need advice']);
  setText('#orderFormSubmitBtn', '📋 Submit order');
  setText('.form-note', 'After you submit the form, we will contact you. If you include a Sample ID, we can confirm the price faster.');

  setAttr('#sampleConfirmCloseBtn', 'aria-label', 'Close');
}

function applyGalleryCatalogMeta() {
  document.title = 'Work Gallery';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Browse all Shadhin Motor car, motorbike and repair gallery designs in one place.');
}

function applyGalleryCatalogCopy() {
  setText('.skip-link', 'Skip to main content');
  setAttr('.topbar .nav-logo', 'aria-label', 'Go to the Shadhin Motor homepage');
  setText('.back-link', '← Back to homepage');
  setText('.hero-label', 'Full catalog');
  setHtml('#galleryCatalogHeroTitle', 'All <span>Designs</span> Together');
  setText('.hero-copy', 'Browse private car, motorbike and repair seat cover designs together by category. Match the right design, color and finish for your vehicle, then choose a design to order or contact us.');
  setText('#galleryCatalogPanelTitle', 'Design filters and list');
  setAttr('.catalog-filters', 'aria-label', 'Gallery category filters');
  setTexts('.catalog-filters .filter-btn', ['All', '🚗 Private Car', '🏍️ Motorbike', '🔧 Repair']);
  setHtml('.catalog-state', 'Current category: <strong id="catalogCurrentLabel">All</strong>');
  setHtml('.catalog-count', 'Total <output id="catalogCount" aria-live="polite">17</output> designs');
  setText('.visually-hidden[for="catalogSearchInput"], .catalog-search-wrap .visually-hidden', 'Search designs');
  setAttr('#catalogSearchInput', 'placeholder', 'Search by design, model or keyword');
  setText('.visually-hidden[for="catalogModelSelect"], .catalog-model-wrap .visually-hidden', 'Choose a vehicle model');
  setOptionTexts('#catalogModelSelect', [
    'All models',
    'Dashboard Refinish',
    'Seat Repair',
    'Home Fitting',
    'Bajaj Pulsar',
    'Honda Hornet',
    'Suzuki Gixxer',
    'Toyota Allion',
    'Toyota Aqua Hybrid',
    'Toyota Corolla',
    'Toyota Corolla Axio/Fielder',
    'Toyota Noah',
    'Toyota Premio',
    'Yamaha R15'
  ]);
  setText('.catalog-per-page-label', 'Per page');
  setOptionTexts('#catalogPerPageSelect', ['10', '25', '50', '100']);
  setText('#catalogResetBtn', 'Reset filters');
  setText('#galleryEmptyState p', 'No design matched this filter. Try another category, model or keyword.');
  setText('#catalogDisplayMeta', 'Designs are being shown');
  setAttr('#catalogPagination', 'aria-label', 'Gallery page navigation');
  setAttr('#lightboxPrevBtn', 'aria-label', 'Previous image');
  setAttr('#lightboxNextBtn', 'aria-label', 'Next image');
  setText('#lightboxTitle', 'Gallery preview');
  setAttr('#lightboxCloseBtn', 'aria-label', 'Close');
}

function applySamplesCatalogMeta() {
  document.title = 'Rexine & Leather Samples';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Browse all Shadhin Motor rexine and leather seat cover samples in one place.');
}

function applySamplesCatalogCopy() {
  setText('.skip-link', 'Skip to main content');
  setAttr('.samples-catalog-topbar .nav-logo', 'aria-label', 'Go to the Shadhin Motor homepage');
  setText('.samples-catalog-back-link', '← Back to homepage');
  setText('.samples-catalog-hero .section-label', 'Full sample catalog');
  setHtml('#samplesCatalogHeroTitle', 'All <span>Samples</span> Together');
  setText('.samples-catalog-lead', 'Browse all available rexine and leather seat cover samples together. Match the color, finish and design you want, choose a Sample ID, then return to the homepage to place the order.');
  setText('.samples-catalog-hero-note span', 'Current category');
  setText('#samplesCatalogPanelTitle', 'Sample filters and list');
  setAttr('.samples-filter-group', 'aria-label', 'Sample material filters');
  setTexts('.sample-filter-btn', ['All', '🪡 Rexine', '🧥 Leather']);
  setHtml('.samples-catalog-count-info', 'Total <output id="samplesCatalogCount" aria-live="polite">12</output> samples');
  setText('.samples-catalog-order-link', 'Go to order page');
  setText('.samples-catalog-search-wrap .visually-hidden', 'Search samples');
  setAttr('#samplesCatalogSearchInput', 'placeholder', 'Search by ID, name, color or note');
  setText('.samples-per-page-label', 'Per page');
  setOptionTexts('#samplesCatalogPerPageSelect', ['10', '25', '50', '100']);
  setText('#samplesCatalogResetBtn', 'Reset filters');
  setText('.samples-catalog-helper', 'Use search and filters here to quickly find a specific sample. Click any card to open the preview, and from there you can continue into the sample order flow.');
  setText('#samplesCatalogEmptyState p', 'No sample matched this filter. Try another category or search keyword.');
  setText('#samplesCatalogDisplayMeta', 'Samples are being shown');
  setAttr('#samplesCatalogPagination', 'aria-label', 'Sample page navigation');
  setAttr('#sampleModalCloseBtn', 'aria-label', 'Close');
  setText('.sample-modal .visually-hidden', 'Preview of the selected sample');
  setText('#sampleModalName', 'Sample preview');
  setText('[data-sample-meta="material"]', 'Material');
  setText('[data-sample-meta="color"]', 'Color');
  setText('[data-sample-meta="availability"]', 'Availability');
}

function applyHomePageEnglish() {
  applyHomeMeta();
  applyHomeStaticCopy();
  applyHomeSamplesUiText();
  applyHomeReviewsUiText();
  applyAboutTeamTranslations();
  applySampleTranslations();
  applyGalleryTranslations();
  applySharedFooterTranslations('Go to the Shadhin Motor home section', '#hero');
}

function applyGalleryCatalogEnglish() {
  applyGalleryCatalogMeta();
  applyGalleryCatalogCopy();
  applyGalleryTranslations();
  applySharedFooterTranslations('Go to the Shadhin Motor homepage', 'index.html');
}

function applySamplesCatalogEnglish() {
  applySamplesCatalogMeta();
  applySamplesCatalogCopy();
  applySamplesCatalogUiText();
  applySampleTranslations();
  applySharedFooterTranslations('Go to the Shadhin Motor homepage', 'index.html');
}

function applyHomeSamplesUiText() {
  updateUiTextRoot('homeSamplesUiText', HOME_SAMPLES_UI_TEXT_EN);
}

function applyHomeReviewsUiText() {
  updateUiTextRoot('homeReviewsUiText', HOME_REVIEWS_UI_TEXT_EN);
}

function applySamplesCatalogUiText() {
  updateUiTextRoot('samplesCatalogUiText', SAMPLES_CATALOG_UI_TEXT_EN);
}

export function initPageLocalization(pageKey) {
  if (!isClientLocalizationEnabled()) {
    return getDefaultDocumentLanguage();
  }

  const language = getPreferredLanguage();
  setDocumentLanguage(language);
  ensureLanguageToggle(language);

  if (language !== 'en') {
    return language;
  }

  updateSharedFloatingCta();
  updateAccessibilityUi();

  if (pageKey === 'home') {
    applyHomePageEnglish();
  } else if (pageKey === 'gallery-catalog') {
    applyGalleryCatalogEnglish();
  } else if (pageKey === 'samples-catalog') {
    applySamplesCatalogEnglish();
  }

  return language;
}
