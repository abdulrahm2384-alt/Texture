/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StructuredCategory {
  gender: string;      // "Male" | "Female" | "Unisex"
  ageGroup: string;    // "Middle Age" | "Elder" | "Adult" | "Kids"
  styleType: string;   // "Traditional" | "Corporate" | "Casual" | "Wedding"
  custom: string;      // any custom string entered by the user
}

export function parseCategory(category: string | undefined | null): StructuredCategory {
  const defaultCategory: StructuredCategory = {
    gender: "Unisex",
    ageGroup: "Adult",
    styleType: "Casual",
    custom: ""
  };

  if (!category) return defaultCategory;

  const trimmed = category.trim();

  // Check if it is a JSON string
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        gender: parsed.gender || "Unisex",
        ageGroup: parsed.ageGroup || "Adult",
        styleType: parsed.styleType || "Casual",
        custom: parsed.custom || ""
      };
    } catch (e) {
      // ignore and fallback to legacy parsing
    }
  }

  // Gracefully handle existing legacy categories or pure custom categories
  const lower = trimmed.toLowerCase();

  if (lower === "male") {
    return { gender: "Male", ageGroup: "Adult", styleType: "Casual", custom: "" };
  }
  if (lower === "female") {
    return { gender: "Female", ageGroup: "Adult", styleType: "Casual", custom: "" };
  }
  if (lower === "children" || lower === "kids") {
    return { gender: "Unisex", ageGroup: "Kids", styleType: "Casual", custom: "" };
  }
  if (lower === "traditional") {
    return { gender: "Unisex", ageGroup: "Adult", styleType: "Traditional", custom: "" };
  }
  if (lower === "corporate") {
    return { gender: "Unisex", ageGroup: "Adult", styleType: "Corporate", custom: "" };
  }
  if (lower === "casual") {
    return { gender: "Unisex", ageGroup: "Adult", styleType: "Casual", custom: "" };
  }
  if (lower === "wedding") {
    return { gender: "Unisex", ageGroup: "Adult", styleType: "Wedding", custom: "" };
  }

  // For any other value, treat it as a custom category
  return {
    gender: "Unisex",
    ageGroup: "Adult",
    styleType: "Casual",
    custom: trimmed
  };
}

export function formatCategory(structured: StructuredCategory): string {
  return JSON.stringify(structured);
}

// Display-friendly version of a structured category string
export function getCategoryDisplayLabel(categoryStr: string): string {
  const parsed = parseCategory(categoryStr);
  const parts: string[] = [];

  if (parsed.gender) parts.push(parsed.gender);
  if (parsed.ageGroup) parts.push(parsed.ageGroup);
  if (parsed.styleType) parts.push(parsed.styleType);
  if (parsed.custom) parts.push(parsed.custom);

  return parts.length > 0 ? parts.join(" • ") : "Uncategorized";
}
