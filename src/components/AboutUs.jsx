import useReveal from "../hooks/useReveal.js";

export default function AboutUs({ title, text }) {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className={"about-us-section reveal" + (visible ? " visible" : "")}>
      <h2 className="section-title">{title}</h2>
      <p className="about-us-text">{text}</p>
    </section>
  );
}
