import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Haptic feedback — use ios-haptics package directly everywhere.
// Import: import { haptic } from "ios-haptics";
// haptic()           → light tap
// haptic.confirm()   → double tap (success)
// haptic.error()     → triple tap (error)
