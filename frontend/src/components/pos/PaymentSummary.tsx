import { breakdown, money } from "../../utils/currency";
import type { CreatedOrder } from "../../types/pos";
import {
  type ValidationResult,
} from "../../utils/posValidation";
import { useState } from "react";

interface PaymentCalculations {
  subtotalPaise: number;
  taxPaise: number;
  grandPaise: number;
  givenPaise: number | null;
  changePaise: number | null;
}

interface PaymentSummaryProps {
  calculations: PaymentCalculations;
  given: string;
  setGiven: (value: string) => void;
  loading: boolean;
  handleGenerateBill: () => void | Promise<void>;
  order: CreatedOrder | null;
  submitting?: boolean;
  startNewOrder: () => void;
  amountResult: ValidationResult;
}

export default function PaymentSummary({
  calculations,
  given,
  setGiven,
  loading,
  handleGenerateBill,
  order,
  submitting = false,
  startNewOrder,
  amountResult,
}: PaymentSummaryProps) {
  const [touched, setTouched] = useState(false);
  const amountError = amountResult.valid ? "" : amountResult.message;

  const disabled = loading || submitting || Boolean(order);

  const change = calculations.changePaise;
  return (
    <section className="pos-card">
      <div className="card-heading">
        <div className="section-icon payment-icon">
          <i className="bi bi-wallet2" aria-hidden="true" />
        </div>

        <div>
          <h3 className="section-title">Payment Summary</h3>
          <p className="section-description mb-0">
            Review totals and enter the received amount.
          </p>
        </div>

        <span className="step-number ms-auto">03</span>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-12 col-md-6">
          <div className="payment-breakdown">
            <div className="sum">
              <span>Subtotal</span>
              <b>{money(calculations.subtotalPaise / 100)}</b>
            </div>

            <div className="sum">
              <span>Tax</span>
              <b>{money(calculations.taxPaise / 100)}</b>
            </div>

            <div className="sum total">
              <span>Grand Total</span>
              <b>{money(calculations.grandPaise / 100)}</b>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="given" className="form-label">
            Amount Received (₹)
          </label>

          <div className="input-icon-wrap">
            <i className="bi bi-cash-stack" aria-hidden="true" />

            <input
              id="given"
              name="amount_given"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className={`form-control custom-input amount-input ${
                touched && amountError ? "is-invalid" : ""
              }`}
              placeholder="0.00"
              value={given}
              disabled={disabled}
              aria-invalid={touched && Boolean(amountError)}
              aria-describedby="amount-hint amount-error"
              onChange={(event) => {
                setGiven(event.target.value);
                setTouched(true);
              }}
              onBlur={() => setTouched(true)}
            />
          </div>

          <small id="amount-hint" className="field-hint">
            Leave blank if payment has not been received.
          </small>

          {touched && amountError && (
            <div
              id="amount-error"
              className="text-danger small mt-1"
              role="alert"
            >
              {amountError}
            </div>
          )}

          <div className="change-panel mt-3" aria-live="polite">
            <div>
              <span className="change-label">Balance to Return</span>
              <small className="d-block field-hint">Customer change</small>
            </div>

            <strong>
              {change === null
                ? "—"
                : change < 0
                  ? `Short by ${money(-change / 100)}`
                  : `${money(change / 100)} → ${breakdown(change)}`}
            </strong>
          </div>
        </div>
      </div>

      {!order && (
        <div className="payment-footer mt-4">
          <div className="secure-note">
            <i className="bi bi-shield-check" aria-hidden="true" />
            <span>Review your order before generating the bill.</span>
          </div>

          <button
            type="button"
            className="btn btn-generate"
            disabled={
              loading ||
              submitting ||
              (given.trim() !== "" && !amountResult.valid)
            }
            onClick={() => {
              if (given.trim() !== "" && !amountResult.valid) {
                return;
              }

              void handleGenerateBill();
            }}
          >
            <i className="bi bi-receipt me-2" aria-hidden="true" />
            {submitting ? "Generating..." : "Generate Bill"}
            <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
          </button>
        </div>
      )}

      {order && (
        <div className="mt-4" aria-live="polite">
          <h3 className="section-title">Bill {order.number}</h3>

          <div className="bill p-3 border rounded">
            <p>
              {order.customer.name || "Customer"} &lt;
              {order.customer.email}&gt;
            </p>

            <hr />

            {order.items.map((item, index) => (
              <div
                key={`${item.product}-${index}`}
                className="d-flex justify-content-between gap-3 mb-2"
              >
                <span>
                  {item.product} × {item.quantity}
                </span>
                <span>{money(Number(item.line_total))}</span>
              </div>
            ))}

            <hr />

            <div className="sum">
              <span>Subtotal</span>
              <b>{money(Number(order.subtotal))}</b>
            </div>

            <div className="sum">
              <span>Tax</span>
              <b>{money(Number(order.tax_total))}</b>
            </div>

            <div className="sum total">
              <span>Grand Total</span>
              <b>{money(Number(order.grand_total))}</b>
            </div>

            {order.change_returned != null && (
              <>
                <div className="sum mt-2">
                  <span>Given</span>
                  <b>{money(Number(order.amount_given))}</b>
                </div>

                <div className="sum">
                  <span>Change</span>
                  <b>{money(Number(order.change_returned))}</b>
                </div>
              </>
            )}
          </div>

          <p className="muted mt-2">
            <i className="bi bi-envelope-check me-1" aria-hidden="true" />
            Confirmation email queued by the server.
          </p>

          <button
            type="button"
            className="btn btn-add-product"
            onClick={startNewOrder}
          >
            Create Another Order
          </button>
        </div>
      )}
    </section>
  );
}
