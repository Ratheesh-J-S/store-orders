export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  tax_percent: number;
}

export interface OrderRow {
  id: string;
  productId: string;
  quantity: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  shortages?: Array<{
    name: string;
    requested: number;
    available: number;
  }>;
}

export interface CreatedOrder {
  number: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    product: string;
    quantity: number;
    unit_price: number | string;
    line_total: number | string;
  }>;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  amount_given: number | null;
  change_returned: number | null;
}
