import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function haptic(duration: number = 8) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}
