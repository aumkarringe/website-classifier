import { Category } from "@/lib/types";
import { describe, it, expect } from "@jest/globals";

describe("Category type", () => {
  const validCategories: Category[] = [
    "Ecommerce",
    "Social / UGC",
    "News / Media",
    "Other",
  ];

  it("has exactly 4 categories", () => {
    expect(validCategories.length).toBe(4);
  });

  it("includes all required categories", () => {
    expect(validCategories).toContain("Ecommerce");
    expect(validCategories).toContain("Social / UGC");
    expect(validCategories).toContain("News / Media");
    expect(validCategories).toContain("Other");
  });
});
