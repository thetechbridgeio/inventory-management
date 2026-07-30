export type ParsedProductRow = {
  rowNumber: number;
  name: string;
  description?: string;
  category: string;
  unit: string;
  minOrderQty: number;
  maxOrderQty: number;
  reorderQty: number;
  openingStock: number;
  location?: string;
};
