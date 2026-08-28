export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="category-filters">
      {categories.map((cat) => (
        <button
          key={cat}
          className={"filter-btn" + (cat === active ? " active" : "")}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
