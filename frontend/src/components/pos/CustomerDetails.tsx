interface CustomerDetailsProps {
  email: string;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onEmailBlur: () => void;
}

export default function CustomerDetails({
  email,
  name,
  onEmailChange,
  onNameChange,
  onEmailBlur,
}: CustomerDetailsProps) {
  return (
    <section className="pos-card mb-4">
      <div className="card-heading">
        <div className="section-icon customer-icon">
          <i className="bi bi-person-vcard" />
        </div>

        <div>
          <h3 className="section-title">Customer Details</h3>
          <p className="section-description mb-0">
            Enter the customer information.
          </p>
        </div>

        <span className="step-number ms-auto">01</span>
      </div>

      <div className="row g-3 mt-2">
        <div className="col-12 col-md-6">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>

          <div className="input-icon-wrap">
            <i className="bi bi-envelope" />

            <input
              id="email"
              type="email"
              className="form-control custom-input"
              placeholder="customer@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              onBlur={onEmailBlur}
              required
            />
          </div>

          <small className="field-hint">
            Existing customer details can be auto-filled.
          </small>
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="name" className="form-label">
            Customer Name
          </label>

          <div className="input-icon-wrap">
            <i className="bi bi-person" />

            <input
              id="name"
              type="text"
              className="form-control custom-input"
              placeholder="Enter customer name"
              autoComplete="name"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              maxLength={150}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
