export const STOCK_MOVEMENTS = {
  ON_DEMAND: "On Demand",
  FAST_MOVING: "Fast Moving",
  DEAD_STOCK: "Dead Stock",
} as const;

export type StockMovement =
  (typeof STOCK_MOVEMENTS)[keyof typeof STOCK_MOVEMENTS];

export const STOCK_MOVEMENT_OPTIONS: StockMovement[] = [
  STOCK_MOVEMENTS.ON_DEMAND,
  STOCK_MOVEMENTS.FAST_MOVING,
  STOCK_MOVEMENTS.DEAD_STOCK,
];
