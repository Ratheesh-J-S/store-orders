export default function QuickCheckout() {
  const note = [
    "Enter customer details",
    "Add products and quantities",
    "Enter payment and generate the bill",
  ];
  return (
    <>
      <section className="guide-card">
        <div className="guide-decoration">
          <i className="bi bi-lightning-charge" />
        </div>
        <h3 className="guide-title">Quick Checkout</h3>
        <p className="guide-description">
          Follow these steps to complete your billing process.
        </p>
        {note.map((step, index) => (
          <div className="guide-step" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
        <div className="guide-email-note">
          <i className="bi bi-envelope-check" />
          <span>
            A confirmation email can be queued after successful billing.
          </span>
        </div>
      </section>
    </>
  );
}
