import { useState } from "react";

/**
 * Returns the latest non-null value, so a dialog keeps showing its content while
 * its exit animation plays after the value has been cleared.
 */
export function useRetained<T>(value: T | null): T | null {
  const [kept, setKept] = useState<T | null>(value);
  if (value !== null && value !== kept) setKept(value);
  return value ?? kept;
}
