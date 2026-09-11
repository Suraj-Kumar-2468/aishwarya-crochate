import { useEffect, useState } from "react";
import useParallax from "../hooks/useParallax.js";

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel({ slides, tagline, subtitle, buttonText }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const blobRef = useParallax(0.06, 30);
  const frameRef = useParallax(-0.1, 26);

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
    <section id="top" className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">{tagline}</p>
          <h1 className="hero-title">
            <span className="hero-title-main">{slide.caption}</span>
          </h1>
          <p className="hero-sub">{subtitle}</p>
          <a href="#shop" className="btn btn-primary">{buttonText}</a>
        </div>

        <div
          className="hero-visual"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <p className="hero-quote" aria-hidden="true">
            Every stitch,<br />made with love
          </p>
          <div className="hero-image-box">
            <div className="hero-blob" ref={blobRef} aria-hidden="true" />
            <div className="hero-frame" ref={frameRef}>
              {slides.map((s, i) => (
                <picture key={i} className={"hero-frame-slide" + (i === index ? " active" : "")}>
                  {s.mobileImage && <source media="(max-width: 700px)" srcSet={s.mobileImage} />}
                  <img src={s.desktopImage} alt="" className="hero-frame-img" />
                </picture>
              ))}

              {slides.length > 1 && (
                <>
                  <button type="button" className="image-nav image-nav-prev" onClick={prev} aria-label="Previous slide">&#8249;</button>
                  <button type="button" className="image-nav image-nav-next" onClick={next} aria-label="Next slide">&#8250;</button>
                  <div className="image-nav-dots hero-frame-dots">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
