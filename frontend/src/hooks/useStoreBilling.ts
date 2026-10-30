import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  Product,
  OrderRow,
  LowStockProduct,
  CreatedOrder,
} from "../types/pos";

import { api } from "../services/posApi";

import {
  validateEmail,
  validateCustomerName,
  validateAmountReceived,
} from "../utils/posValidation";

function newRow(): OrderRow {
  return {
    id: crypto.randomUUID(),
    productId: "",
    quantity: 1,
  };
}

function getErrorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : "Unable to load POS data.";
}

export function useStoreBilling() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [rows, setRows] = useState<OrderRow[]>([newRow()]);

  const [email, setEmailState] = useState("");
  const [name, setNameState] = useState("");
  const [given, setGivenState] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inventoryError, setInventoryError] = useState("");

  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const amountResult = useMemo(() => validateAmountReceived(given), [given]);

  const clearMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const setEmail = useCallback(
    (value: string) => {
      setEmailState(value);
      clearMessages();
    },
    [clearMessages],
  );

  const setName = useCallback(
    (value: string) => {
      setNameState(value);
      clearMessages();
    },
    [clearMessages],
  );

  const setGiven = useCallback(
    (value: string) => {
      setGivenState(value);
      clearMessages();
    },
    [clearMessages],
  );

  const loadProducts = useCallback(async () => {
    const response = await api<Product[]>("/products");

    if (!response.ok) {
      throw new Error(response.body.message || "Unable to load products.");
    }

    setProducts(response.body.data ?? []);
  }, []);

  const loadLowStock = useCallback(async () => {
    const response = await api<LowStockProduct[]>("/products/low-stock");

    if (!response.ok) {
      throw new Error(
        response.body.message || "Unable to load low-stock products.",
      );
    }

    setLowStock(response.body.data ?? []);
  }, []);

  const refreshInventory = useCallback(async (): Promise<boolean> => {
    const results = await Promise.allSettled([loadProducts(), loadLowStock()]);

    const failed = results.some((result) => result.status === "rejected");

    setInventoryError(
      failed
        ? "Inventory could not be fully refreshed. Please reload the inventory."
        : "",
    );

    return !failed;
  }, [loadProducts, loadLowStock]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const results = await Promise.allSettled([
        loadProducts(),
        loadLowStock(),
      ]);

      if (!active) return;

      const failed = results.find((result) => result.status === "rejected");

      if (failed?.status === "rejected") {
        setInventoryError(getErrorMessage(failed.reason));
      }

      setLoading(false);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [loadProducts, loadLowStock]);

  const calculations = useMemo(() => {
    const items = rows.map((row) => {
      const product = products.find(
        (item) => String(item.id) === row.productId,
      );

      const rawQuantity = Number(row.quantity);

      const quantity = Number.isFinite(rawQuantity)
        ? Math.max(0, Math.floor(rawQuantity))
        : 0;

      if (!product || quantity < 1) {
        return {
          rowId: row.id,
          product,
          quantity,
          linePaise: 0,
          subtotalPaise: 0,
          taxPaise: 0,
        };
      }

      const unitPaise = Math.round(Number(product.price) * 100);
      const lineSubtotal = unitPaise * quantity;

      const lineTax = Math.round(
        (lineSubtotal * Number(product.tax_percent)) / 100,
      );

      return {
        rowId: row.id,
        product,
        quantity,
        linePaise: lineSubtotal + lineTax,
        subtotalPaise: lineSubtotal,
        taxPaise: lineTax,
      };
    });

    const totals = items.reduce(
      (acc, item) => ({
        subtotalPaise: acc.subtotalPaise + item.subtotalPaise,
        taxPaise: acc.taxPaise + item.taxPaise,
      }),
      {
        subtotalPaise: 0,
        taxPaise: 0,
      },
    );

    const { subtotalPaise, taxPaise } = totals;
    const grandPaise = subtotalPaise + taxPaise;

    const amountText = given.trim();

    const parsedAmount = amountText === "" ? null : Number(amountText);

    const roundedPaise =
      parsedAmount !== null && Number.isFinite(parsedAmount)
        ? Math.round(parsedAmount * 100)
        : null;

    const givenPaise =
      amountResult.valid &&
      roundedPaise !== null &&
      Number.isSafeInteger(roundedPaise) &&
      parsedAmount !== null &&
      parsedAmount >= 0
        ? roundedPaise
        : null;

    const changePaise = givenPaise === null ? null : givenPaise - grandPaise;

    return {
      items,
      subtotalPaise,
      taxPaise,
      grandPaise,
      givenPaise,
      changePaise,
    };
  }, [rows, products, given, amountResult.valid]);

  const handleEmailBlur = useCallback(async () => {
    const customerEmail = email.trim();

    if (!validateEmail(customerEmail).valid) {
      return;
    }

    try {
      const response = await api<{ name: string | null }>(
        `/customers/${encodeURIComponent(customerEmail)}`,
      );

      if (!response.ok || !response.body.data) {
        return;
      }

      const customerName = response.body.data.name?.trim();

      if (!customerName) return;

      setNameState((currentName) =>
        currentName.trim() ? currentName : customerName,
      );
    } catch {}
  }, [email]);

  const addRow = useCallback(() => {
    if (submitting || order) return;

    setRows((current) => [...current, newRow()]);
    clearMessages();
  }, [submitting, order, clearMessages]);

  const updateRow = useCallback(
    (
      rowId: string,
      field: "productId" | "quantity",
      value: string | number,
    ) => {
      if (submitting || order) return;

      setRows((current) =>
        current.map((row) => {
          if (row.id !== rowId) return row;

          return field === "productId"
            ? { ...row, productId: String(value) }
            : {
                ...row,
                quantity: value === "" ? 0 : Number(value),
              };
        }),
      );

      clearMessages();
    },
    [submitting, order, clearMessages],
  );

  const removeRow = useCallback(
    (rowId: string) => {
      if (submitting || order) return;

      setRows((current) => {
        const remaining = current.filter((row) => row.id !== rowId);

        return remaining.length > 0 ? remaining : [newRow()];
      });

      clearMessages();
    },
    [submitting, order, clearMessages],
  );

  const generateBill = useCallback(async () => {
    if (submitting || order || loading) return;

    setError("");
    setSuccess("");

    const emailResult = validateEmail(email);

    if (!emailResult.valid) {
      setError(emailResult.message);
      return;
    }

    const nameResult = validateCustomerName(name);

    if (!nameResult.valid) {
      setError(nameResult.message);
      return;
    }

    if (!amountResult.valid) {
      setError(amountResult.message);
      return;
    }

    const invalidQuantity = calculations.items.some((item) => {
      if (!item.product) return false;

      const row = rows.find((candidate) => candidate.id === item.rowId);

      const quantity = Number(row?.quantity);

      return (
        !Number.isFinite(quantity) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > item.product.stock
      );
    });

    if (invalidQuantity) {
      setError(
        "Each product quantity must be a whole number within available stock.",
      );
      return;
    }

    const validItems = calculations.items.filter(
      (item) => item.product && item.quantity > 0,
    );

    if (validItems.length === 0) {
      setError("Please add at least one valid product.");
      return;
    }

    const productIds = validItems.map((item) => String(item.product!.id));

    if (new Set(productIds).size !== productIds.length) {
      setError(
        "A product appears more than once. Combine its quantities into one row.",
      );
      return;
    }

    const amountText = given.trim();

    const amountPaise =
      amountText === "" ? null : Math.round(Number(amountText) * 100);

    if (amountPaise !== null && amountPaise < calculations.grandPaise) {
      setError("Amount received is less than the order total.");
      return;
    }

    setSubmitting(true);

    let orderCreated = false;

    try {
      const response = await api<CreatedOrder>("/orders", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          items: validItems.map((item) => ({
            product_id: item.product!.id,
            quantity: item.quantity,
          })),
          amount_given: amountText === "" ? null : amountText,
        }),
      });

      if (!response.ok || !response.body.data) {
        const body = response.body;

        if (body.shortages?.length) {
          setError(
            body.shortages
              .map(
                (item) =>
                  `${item.name}: requested ${item.requested}, ` +
                  `only ${item.available} available`,
              )
              .join("\n"),
          );
        } else if (body.errors) {
          const messages = Object.values(body.errors)
            .flat()
            .filter(
              (message): message is string =>
                typeof message === "string" && message.trim().length > 0,
            );

          setError(
            messages[0] || body.message || "Unable to create the order.",
          );
        } else {
          setError(body.message || "Unable to create the order.");
        }

        await refreshInventory();
        return;
      }

      orderCreated = true;

      setOrder(response.body.data);
      setSuccess("Order created successfully. The bill is ready.");
      setError("");

      setRows([newRow()]);
      setGiven("");

      await refreshInventory();
    } catch {
      if (!orderCreated) {
        setError(
          "Unable to confirm the order. Check your orders before retrying.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    order,
    loading,
    email,
    name,
    given,
    amountResult,
    rows,
    calculations,
    refreshInventory,
    setGiven,
  ]);

  const startNewOrder = useCallback(() => {
    if (submitting) return;

    setOrder(null);
    setError("");
    setSuccess("");
    setInventoryError("");

    setEmailState("");
    setNameState("");
    setGivenState("");

    setRows([newRow()]);
  }, [submitting]);

  return {
    products,
    lowStock,
    rows,
    email,
    name,
    given,
    loading,
    submitting,
    error,
    success,
    inventoryError,
    order,
    calculations,
    setEmail,
    setName,
    setGiven,
    setError,
    setOrder,
    addRow,
    updateRow,
    removeRow,
    handleEmailBlur,
    generateBill,
    startNewOrder,
    amountResult,
  };
}
