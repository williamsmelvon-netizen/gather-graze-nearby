export const RADII = [2, 5, 10, 20];

/** The next wider search radius, or null when already at the widest. */
export const nextRadius = (current: number): number | null =>
  RADII.find((r) => r > current) ?? null;
