export const formatPrice = (price: number) => `${price.toFixed(2)} €`;

export const formatBags = (count: number) =>
  `${count} ${count === 1 ? "bolsa" : "bolsas"}`;
