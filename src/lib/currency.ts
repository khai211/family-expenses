const formatter = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
});

export function formatSGD(amount: number): string {
  return formatter.format(amount);
}
