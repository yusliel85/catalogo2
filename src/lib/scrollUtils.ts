export function scrollToAdminSection(element: HTMLElement | null, delay = 40): void {
  if (!element || typeof window === 'undefined') return;

  const performScroll = () => {
    if (!element) return;
    const headerEl = document.querySelector('header.sticky');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 60;
    const offset = headerHeight + 12;
    element.style.scrollMarginTop = `${offset}px`;

    const rect = element.getBoundingClientRect();
    const currentScrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const targetY = Math.max(0, currentScrollY + rect.top - offset);

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  };

  requestAnimationFrame(() => {
    setTimeout(performScroll, delay);
    setTimeout(performScroll, delay + 110);
  });
}
