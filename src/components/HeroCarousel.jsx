import { useEffect, useState } from "react";

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel({ slides, tagline, subtitle, buttonText, revealRef, revealVisible }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  const slide = slides[index];

  return (
    <section
      id="top"
      ref={revealRef}
      className={"hero hero-carousel reveal" + (revealVisible ? " visible" : "")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-carousel-slides">
        {slides.map((s, i) => (
          <picture key={i} className={"hero-carousel-slide" + (i === index ? " active" : "")}>
            {s.mobileImage && <source media="(max-width: 700px)" srcSet={s.mobileImage} />}
            <img src={s.desktopImage} alt="" className="hero-carousel-img" />
          </picture>
        ))}
        <div className="hero-carousel-overlay" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">{tagline}</p>
        <h1 className="hero-title">
          <span className="hero-title-main">{slide.caption}</span>
        </h1>
        <p className="hero-sub">{subtitle}</p>
        <a href="#shop" className="btn btn-primary">{buttonText}</a>
      </div>

      {slides.length > 1 && (
        <>
          <button type="button" className="image-nav image-nav-prev" onClick={prev} aria-label="Previous slide">&#8249;</button>
          <button type="button" className="image-nav image-nav-next" onClick={next} aria-label="Next slide">&#8250;</button>
          <div className="image-nav-dots hero-carousel-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={"image-nav-dot" + (i === index ? " active" : "")}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
