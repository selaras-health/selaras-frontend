import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Fungsi untuk mengubah 'very_high' menjadi 'Very High'
export const formatGroupLabel = (label: string) => {
    return label
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// Fungsi untuk mengubah 'indonesia' menjadi 'Indonesia'
export const formatCountryName = (countryName: string) => {
    return countryName
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
