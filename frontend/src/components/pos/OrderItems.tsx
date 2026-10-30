import { money } from "../../utils/currency";
import type { Product, OrderRow } from "../../types/pos";

interface OrderItemCalculation {
  rowId: string;
  product?: Product;
  quantity: number;
  linePaise: number;
}

interface OrderItemsProps {
  products: Product[];
  rows: OrderRow[];
  calculations: {
    items: OrderItemCalculation[];
  };
  onAddRow: () => void;
  onUpdateRow: (
    rowId: string,
    field: "productId" | "quantity",
    value: string | number,
  ) => void;
  onRemoveRow: (rowId: string) => void;
  loading?: boolean;
}

export default function OrderItems({
  products,
  rows,
  calculations,
  onAddRow,
  onUpdateRow,
  onRemoveRow,
  loading = false,
}: OrderItemsProps) {
  return (
    <section className="pos-card mb-4">
      <div className="card-heading">
        <div className="section-icon product-icon">
          <i className="bi bi-bag-check" aria-hidden="true" />
        </div>

        <div>
          <h3 className="section-title">Order Items</h3>
          <p className="section-description mb-0">
            Select products and update quantities.
          </p>
        </div>

        <span className="step-number ms-auto">02</span>
      </div>

      <div className="table-responsive mt-4">
        <table className="table pos-table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">PRODUCT</th>
              <th scope="col" style={{ minWidth: 100 }}>
                QTY
              </th>
              <th scope="col" className="text-end">
                PRICE
              </th>
              <th scope="col" className="text-end">
                TOTAL
              </th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const item = calculations.items.find(
                (entry) => entry.rowId === row.id,
              );

              const product = item?.product;
              const quantity = Number(row.quantity);
              const validQuantity =
                Number.isInteger(quantity) &&
                quantity >= 1 &&
                Boolean(product) &&
                quantity <= (product?.stock ?? 0);

              return (
                <tr key={row.id}>
                  <td>
                    <select
                      className="form-select"
                      aria-label="Select product"
                      value={row.productId}
                      disabled={loading}
                      onChange={(event) =>
                        onUpdateRow(row.id, "productId", event.target.value)
                      }
                    >
                      <option value="">Select product...</option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={String(product.id)}
                          disabled={product.stock < 1}
                        >
                          {product.name} ({product.stock} in stock)
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      max={product?.stock ?? undefined}
                      step="1"
                      inputMode="numeric"
                      aria-label="Quantity"
                      value={row.quantity}
                      disabled={loading || !product}
                      aria-invalid={
                        product && !validQuantity ? true : undefined
                      }
                      onChange={(event) =>
                        onUpdateRow(
                          row.id,
                          "quantity",
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                        )
                      }
                    />

                    {product && !validQuantity && (
                      <small className="text-danger">
                        Enter a whole quantity between 1 and {product.stock}.
                      </small>
                    )}
                  </td>

                  <td className="text-end num">
                    {product ? money(Number(product.price)) : "—"}
                  </td>

                  <td className="text-end num">
                    {product && validQuantity
                      ? money(item!.linePaise / 100)
                      : "—"}
                  </td>

                  <td className="text-center">
                    <button
                      type="button"
                      className="x"
                      title="Remove product"
                      aria-label="Remove product"
                      disabled={loading}
                      onClick={() => onRemoveRow(row.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="product-footer mt-3">
        <span className="field-hint">
          <i className="bi bi-info-circle me-1" aria-hidden="true" />
          Add products to calculate the order total.
        </span>

        <button
          type="button"
          className="btn btn-add-product"
          disabled={loading}
          onClick={onAddRow}
        >
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />
          Add Product
        </button>
      </div>
    </section>
  );
}
