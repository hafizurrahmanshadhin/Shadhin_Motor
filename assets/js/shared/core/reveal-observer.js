export function createRevealObserver({ threshold = 0.08 } = {}) {
  if (typeof IntersectionObserver !== 'function') {
    return {
      observeRevealElements(root = document) {
        root.querySelectorAll('.reveal').forEach(element => {
          element.classList.add('visible');
        });
      }
    };
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold });

  return {
    observeRevealElements(root = document) {
      root.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    }
  };
}
