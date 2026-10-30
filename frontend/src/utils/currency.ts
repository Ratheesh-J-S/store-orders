const DENOMS = [500, 200, 100, 50, 20, 10, 5, 2, 1] as const;

export function money(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export function breakdown(amountInPaise: number): string {
  if (amountInPaise < 0) return "—";

  let remaining = amountInPaise;
  const parts: string[] = [];

  for (const denomination of DENOMS) {
    const denominationPaise = denomination * 100;
    const count = Math.floor(remaining / denominationPaise);

    if (count > 0) {
      parts.push(`${count}×${denomination}`);
      remaining -= count * denominationPaise;
    }
  }

  if (remaining > 0) {
    parts.push(`${remaining} paise`);
  }

  return parts.join(" + ") || "—";
}
