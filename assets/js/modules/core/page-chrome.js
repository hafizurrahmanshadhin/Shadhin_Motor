const LOGO_MARKUP = `
  <div class="nav-logo-icon">
    <svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" width="46" height="46" aria-hidden="true" focusable="false">
      <rect x="9" y="2" width="28" height="28" rx="5" fill="rgba(200,134,10,0.1)" stroke="#e8a832" stroke-width="1.6" />
      <polygon points="18,8 21.5,11.5 18,15 14.5,11.5" fill="none" stroke="#e8a832" stroke-width="1" opacity="0.7" />
      <polygon points="28,8 31.5,11.5 28,15 24.5,11.5" fill="none" stroke="#e8a832" stroke-width="1" opacity="0.7" />
      <polygon points="18,16 21.5,19.5 18,23 14.5,19.5" fill="none" stroke="#e8a832" stroke-width="1" opacity="0.7" />
      <polygon points="28,16 31.5,19.5 28,23 24.5,19.5" fill="none" stroke="#e8a832" stroke-width="1" opacity="0.7" />
      <circle cx="23" cy="11.5" r="1" fill="#e8a832" opacity="0.5" />
      <circle cx="23" cy="19.5" r="1" fill="#e8a832" opacity="0.5" />
      <rect x="5" y="8" width="4" height="14" rx="2" fill="none" stroke="#c8860a" stroke-width="1.4" />
      <rect x="37" y="8" width="4" height="14" rx="2" fill="none" stroke="#c8860a" stroke-width="1.4" />
      <rect x="5" y="32" width="36" height="11" rx="4" fill="rgba(200,134,10,0.1)" stroke="#e8a832" stroke-width="1.6" />
      <line x1="9" y1="37.5" x2="37" y2="37.5" stroke="#e8a832" stroke-width="0.9" stroke-dasharray="3,2.5" opacity="0.6" />
      <line x1="9" y1="30" x2="5" y2="32" stroke="#c8860a" stroke-width="1.4" />
      <line x1="37" y1="30" x2="41" y2="32" stroke="#c8860a" stroke-width="1.4" />
      <rect x="13" y="2" width="20" height="2" rx="1" fill="#e8a832" opacity="0.6" />
    </svg>
  </div>
  <div class="nav-logo-text">
    <span class="nav-logo-main">Shadhin <em>Motor</em></span>
    <span class="nav-logo-sub">Seat Cover Specialist</span>
  </div>
`;

function buildSectionHref(sectionBase, sectionId) {
  return sectionBase.endsWith('#') ? `${sectionBase}${sectionId}` : `${sectionBase}#${sectionId}`;
}

function buildFooterMarkup({ homeHref, homeAriaLabel, sectionBase, creditHref }) {
  const sectionHref = sectionId => buildSectionHref(sectionBase, sectionId);

  return `
    <div class="footer-top">
      <div class="footer-brand">
        <a href="${homeHref}" class="nav-logo footer-logo-link" aria-label="${homeAriaLabel}">
          ${LOGO_MARKUP}
        </a>
        <p>প্রাইভেট কার ও মোটরসাইকেলের সিট কভারে আমরা বিশেষজ্ঞ। উচ্চমানের রেক্সিন ও চামড়া ব্যবহার করে কাস্টম ডিজাইনে তৈরি করা হয়।</p>
      </div>

      <div class="footer-col footer-location" id="footer-location">
        <h4>লোকেশন</h4>
        <div class="footer-location-card">
          <address class="footer-location-address">
            আলী এন্ড নুর রিয়েল এস্টেট লিঃ (গ্লাস ফ্যাক্টরির পিছনে), মোহাম্মদপুর, ঢাকা-১২০৭
          </address>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Ali+and+Nur+Real+Estate+Ltd+Mohammadpur+Dhaka"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-map-link"
            id="footer-location-map"
            aria-label="Google Map এ লোকেশন দেখুন">
            📍 Google Map এ লোকেশন দেখুন
          </a>
          <p class="footer-location-note">রাস্তা খুঁজে পেতে Map খুলে Navigation চালু করুন।</p>
        </div>
      </div>

      <div class="footer-col">
        <h4>সার্ভিস</h4>
        <ul>
          <li><a href="${sectionHref('services')}">নতুন সিট কভার</a></li>
          <li><a href="${sectionHref('services')}">সিট কভার রিপেয়ার</a></li>
          <li><a href="${sectionHref('services')}">কাস্টম ডিজাইন</a></li>
          <li><a href="${sectionHref('services')}">মোটরসাইকেল সিট</a></li>
          <li><a href="${sectionHref('services')}">হোম সার্ভিস</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>যোগাযোগ</h4>
        <ul>
          <li><a href="${sectionHref('contact')}">অর্ডার দিন</a></li>
          <li><a href="${sectionHref('samples')}">রেক্সিন ও লেদার স্যাম্পল দেখুন</a></li>
          <li><a href="${sectionHref('gallery')}">কাজের স্যাম্পল দেখুন</a></li>
          <li><a href="${sectionHref('about')}">দোকান ও টিম সম্পর্কে জানুন</a></li>
          <li><a href="${sectionHref('reviews')}">গ্রাহকের রিভিউ</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span class="footer-copyright">© ২০২৬ স্বাধীন মটর।</span>

      <nav class="footer-social-links" aria-label="Social links">
        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" class="footer-social-link social-facebook" aria-label="Facebook">
          <span class="footer-social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
              <path d="M13.5 8.5V7.2c0-.6.5-1.1 1.1-1.1H16V3h-2.2A3.8 3.8 0 0 0 10 6.8v1.7H8v3h2V21h3.5v-9.5H16l.4-3h-2.9Z"/>
            </svg>
          </span>
          <span class="footer-social-text">Facebook</span>
        </a>

        <a href="https://wa.me/8801911387254" target="_blank" rel="noopener noreferrer" class="footer-social-link social-whatsapp" aria-label="WhatsApp">
          <span class="footer-social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
              <path d="M20.4 3.6A10 10 0 0 0 4.2 16.1L3 21l5-1.3a10 10 0 1 0 12.4-16.1Zm-8.4 16a8 8 0 0 1-4-.9l-.3-.2-2.9.8.8-2.8-.2-.3a8 8 0 1 1 6.6 3.4Zm4.4-5.7c-.2-.1-1.5-.7-1.7-.8-.2-.1-.3-.1-.4.1l-.5.8c-.1.1-.2.2-.4.1-.2-.1-.8-.3-1.5-.9a5.7 5.7 0 0 1-1-1.3c-.1-.2 0-.3.1-.4l.4-.5.2-.3c.1-.1 0-.2 0-.3l-.8-1.8c-.1-.2-.2-.2-.4-.2h-.3c-.1 0-.3 0-.5.2-.2.2-.7.7-.7 1.8 0 1 .8 2.1.9 2.2.1.2 1.5 2.4 3.8 3.3.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z"/>
            </svg>
          </span>
          <span class="footer-social-text">WhatsApp</span>
        </a>

        <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" class="footer-social-link social-youtube" aria-label="YouTube">
          <span class="footer-social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
              <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2c-1.8-.5-7.6-.5-7.6-.5s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.4V8.6l6 3.4-6 3.4Z"/>
            </svg>
          </span>
          <span class="footer-social-text">YouTube</span>
        </a>

        <a href="tel:01911387254" class="footer-social-link social-phone" aria-label="Phone">
          <span class="footer-social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
              <path d="M6.6 10.8a15.7 15.7 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.7 3.8.7.5 0 .8.4.8.9V20c0 .5-.4.9-.8.9C10.2 20.9 3 13.8 3 4.8c0-.5.4-.8.9-.8H7c.5 0 .9.3.9.8 0 1.3.2 2.6.7 3.8.1.4 0 .8-.3 1.1l-1.7 1.9Z"/>
            </svg>
          </span>
          <span class="footer-social-text">01911387254</span>
        </a>
      </nav>

      <span class="footer-credit">Designed for <a href="${creditHref}">স্বাধীন মটর</a></span>
    </div>
  `;
}

export function renderSharedFooter({
  targetId = 'sharedFooter',
  homeHref = 'index.html',
  homeAriaLabel = 'Shadhin Motor হোমপেজে যান',
  sectionBase = 'index.html#',
  creditHref = homeHref
} = {}) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = buildFooterMarkup({ homeHref, homeAriaLabel, sectionBase, creditHref });
}

export function renderFloatingCta(targetId = 'sharedFloatingCta') {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = `
    <nav class="floating-cta" aria-label="Quick contact actions">
      <a class="floating-cta-btn wa" href="https://wa.me/8801911387254?text=Assalamu%20Alaikum%20Shadhin%20Motor%2C%20ami%20seat%20cover%20service%20niye%20kotha%20bolte%20chai."
        target="_blank" rel="noopener noreferrer" aria-label="WhatsApp এ মেসেজ করুন" title="WhatsApp">
        💬
      </a>
      <a class="floating-cta-btn call" href="tel:+8801911387254" aria-label="ফোন কল করুন" title="Call">
        📞
      </a>
    </nav>
  `;
}

export function renderCatalogTopbar({
  targetId = 'catalogTopbar',
  variant = 'gallery',
  logoHref = 'index.html',
  logoAriaLabel = 'Shadhin Motor হোমপেজে যান',
  backHref = 'index.html',
  backLabel = '← হোমপেজে ফিরুন'
} = {}) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const backClass = variant === 'samples' ? 'samples-catalog-back-link' : 'back-link';
  target.className = variant === 'samples' ? 'samples-catalog-topbar' : 'topbar';
  target.innerHTML = `
    <a href="${logoHref}" class="nav-logo" aria-label="${logoAriaLabel}">
      ${LOGO_MARKUP}
    </a>
    <a href="${backHref}" class="${backClass}">${backLabel}</a>
  `;
}
