export function formatCurrency(amount: number): string {
  return `UGX ${amount.toLocaleString("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
