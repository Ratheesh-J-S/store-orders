import CustomerDetails from "../../components/pos/CustomerDetails";
import OrderItems from "../../components/pos/OrderItems";
import PaymentSummary from "../../components/pos/PaymentSummary";
import LowStockAlert from "../../components/pos/LowStockAlert";
import QuickCheckout from "../../components/pos/QuickCheckout";
import { useStoreBilling } from "../../hooks/useStoreBilling";
import {
  ErrorNotification,
  SuccessNotification,
} from "../../components/layout/PopNotification";

export default function StoreBilling() {
  const {
    products,
    lowStock,
    rows,
    email,
    name,
    given,
    loading,
    submitting,
    error,
    success,
    inventoryError,
    order,
    calculations,
    amountResult,
    setEmail,
    setName,
    handleEmailBlur,
    setGiven,
    addRow,
    updateRow,
    removeRow,
    generateBill,
    startNewOrder,
  } = useStoreBilling();

  return (
    <>
      <section className="page-heading mb-4">
        <div>
          <div className="eyebrow">
            <i className="bi bi-grid-1x2 me-2" />
            SALES MANAGEMENT
          </div>

          <h2 className="page-title">Create New Order</h2>

          <p className="page-description mb-0">
            Manage customer details, products and payment in one place.
          </p>
        </div>

        <div className="page-badge">
          <i className="bi bi-receipt-cutoff me-2" />
          Counter POS
        </div>
      </section>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <CustomerDetails
            email={email}
            name={name}
            onEmailChange={setEmail}
            onNameChange={setName}
            onEmailBlur={handleEmailBlur}
          />
          <OrderItems
            products={products}
            rows={rows}
            calculations={calculations}
            onAddRow={addRow}
            onUpdateRow={updateRow}
            onRemoveRow={removeRow}
            loading={loading || submitting || Boolean(order)}
          />

          <PaymentSummary
            calculations={calculations}
            given={given}
            setGiven={setGiven}
            loading={loading}
            handleGenerateBill={generateBill}
            order={order}
            submitting={submitting}
            startNewOrder={startNewOrder}
            amountResult={amountResult}
          />
        </div>

        <aside className="col-12 col-xl-4">
          <LowStockAlert
            products={lowStock}
            loading={loading}
            error={inventoryError}
          />

          <QuickCheckout />
        </aside>
      </div>

      {success && <SuccessNotification message={success} />}

      {error && <ErrorNotification error={error} />}
    </>
  );
}
