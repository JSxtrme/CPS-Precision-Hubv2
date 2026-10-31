// Premium scroll system for CPS Precision Hub — presentation only, no test logic.
// - Reading-progress hairline at the top of the page.
// - Blur-rise reveal for <section> elements as they scroll into view.
// - Respects prefers-reduced-motion (does nothing in that case) and is
//   switched off on the hidden legacy view via CSS (html.legacy-old).
// Sections are only hidden after this script is ready, and a 2s fallback
// reveals everything, so a failed observer can never leave content invisible.
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    const progress = document.createElement("div");
    progress.id = "premium-progress";
    document.body.appendChild(progress);
    let ticking = false;
    const updateProgress = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("premium-inview");
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    const observeSections = () => {
      document.querySelectorAll("section:not([data-premium-observed])").forEach((el) => {
        (el as HTMLElement).dataset.premiumObserved = "1";
        io.observe(el);
      });
    };
    // React renders after this module loads, so watch for sections as they appear.
    const mo = new MutationObserver(observeSections);
    mo.observe(document.body, { childList: true, subtree: true });
    document.body.classList.add("premium-js");
    observeSections();
    window.setTimeout(() => {
      document.querySelectorAll("section").forEach((el) => el.classList.add("premium-inview"));
    }, 2000);
  }
}
