export default function AboutUs({ title, text }) {
  return (
    <section className="about-us-section">
      <h2 className="section-title">{title}</h2>
      <p className="about-us-text">{text}</p>
    </section>
  );
}
