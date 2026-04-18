export function initHomeLocalSeo() {
  const section = document.getElementById('local-seo');
  if (!section) return;

  const faqItems = Array.from(section.querySelectorAll('.faq-item'));

  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      faqItems.forEach(other => {
        if (other !== item) {
          other.open = false;
        }
      });
    });
  });
}
