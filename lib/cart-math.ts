// Shared pricing math. No "use client" / "use server" directive on purpose:
// this module is imported by both the client cart store and server actions.

export const FREE_SHIPPING_AT = 5000; // cents (€50)
export const SHIPPING_FLAT = 399; // cents (€3.99)

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_AT || subtotal === 0 ? 0 : SHIPPING_FLAT;
}
