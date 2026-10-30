import type { LowStockProduct } from "../../types/pos";

interface LowStockAlertProps {
  products: LowStockProduct[];
  loading?: boolean;
  error?: string;
}

export default function LowStockAlert({
  products,
  loading,
  error,
}: LowStockAlertProps) {
  return (
    <section className="stock-card mb-4">
      <div className="stock-heading">
        <div className="stock-icon">
          <i className="bi bi-exclamation-triangle" aria-hidden="true" />
        </div>

        <div>
          <h3 className="section-title mb-1">Low Stock Alert</h3>
          <p className="section-description mb-0">Products needing attention</p>
        </div>
      </div>

      <div className="stock-divider" />

      <ul className="stock-list" aria-live="polite">
        {loading ? (
          <li>Loading inventory...</li>
        ) : error ? (
          <li className="text-danger" role="alert">
            {error}
          </li>
        ) : products.length > 0 ? (
          products.map((product) => (
            <li key={product.id}>
              <span>{product.name}</span>
              {" — "}
              <strong>
                {product.stock} {product.stock === 1 ? "unit" : "units"} left
              </strong>
            </li>
          ))
        ) : (
          <li>
            <i className="bi bi-check-circle me-2" aria-hidden="true" />
            All stocked up!
          </li>
        )}
      </ul>

      <div className="stock-note">
        <i className="bi bi-lightbulb" aria-hidden="true" />
        <span>Check available inventory before confirming an order.</span>
      </div>
    </section>
  );
}
