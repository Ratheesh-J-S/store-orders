import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, Check, X } from "lucide-react";

interface NotificationBaseProps {
  duration?: number;
}

interface ErrorProps extends NotificationBaseProps {
  error?: string | null;
}

interface SuccessProps extends NotificationBaseProps {
  message?: ReactNode;
}

function useNotificationVisibility(
  active: boolean,
  duration: number,
  resetKey: unknown,
) {
  const [dismissedKey, setDismissedKey] = useState<unknown>(null);

  const visible = active && !Object.is(dismissedKey, resetKey);

  useEffect(() => {
    if (!visible || duration <= 0) return;

    const timer = window.setTimeout(() => {
      setDismissedKey(resetKey);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [visible, duration, resetKey]);

  return {
    visible,
    dismiss: () => setDismissedKey(resetKey),
  };
}

export function ErrorNotification({ error, duration = 5000 }: ErrorProps) {
  const { visible, dismiss } = useNotificationVisibility(
    Boolean(error),
    duration,
    error,
  );

  if (!error || !visible) return null;

  return (
    <div
      className="premium-toast premium-toast-error"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-status-icon" aria-hidden="true">
        <AlertCircle size={20} strokeWidth={2.3} />
      </div>

      <div className="toast-content">
        <strong className="toast-title">Something went wrong</strong>
        <p>{error}</p>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={dismiss}
        aria-label="Dismiss error notification"
      >
        <X size={17} />
      </button>

      {duration > 0 && (
        <div
          key={String(error)}
          className="toast-progress"
          aria-hidden="true"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}

export function SuccessNotification({
  message,
  duration = 5000,
}: SuccessProps) {
  const { visible, dismiss } = useNotificationVisibility(
    Boolean(message),
    duration,
    message,
  );

  if (!message || !visible) return null;

  return (
    <div
      className="premium-toast premium-toast-success"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="toast-status-icon" aria-hidden="true">
        <Check size={20} strokeWidth={2.6} />
      </div>

      <div className="toast-content">
        <strong className="toast-title">Success</strong>
        <p>{message}</p>
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={dismiss}
        aria-label="Dismiss success notification"
      >
        <X size={17} />
      </button>

      {duration > 0 && (
        <div
          key={String(message)}
          className="toast-progress"
          aria-hidden="true"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
}
