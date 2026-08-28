import ProductCard from "./ProductCard.jsx";

export default function CollectionRow({ title, items }) {
  if (!items.length) return null;

  return (
    <section className="collection-row">
      <h2 className="section-title">{title}</h2>
      <div className="catalog">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
