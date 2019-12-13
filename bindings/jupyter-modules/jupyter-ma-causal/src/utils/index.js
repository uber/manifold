export const clamp = (d, domain = [0, 1]) =>
  Math.min(Math.max(d, domain[0]), domain[1]);
