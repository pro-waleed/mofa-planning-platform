import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = "ar-YE") {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(value);
}

export function formatNumber(value: number, locale = "ar-YE") {
  return new Intl.NumberFormat(locale).format(value);
}

export function percent(value: number, locale = "ar-YE") {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value / 100);
}

