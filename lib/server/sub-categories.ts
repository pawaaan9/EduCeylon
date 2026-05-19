import "server-only";
import { SUB_CATEGORY_SUGGESTIONS } from "./data/sub-category-suggestions";

export { SUB_CATEGORY_SUGGESTIONS };

export function getSubCategorySuggestions(): string[] {
  return [...SUB_CATEGORY_SUGGESTIONS];
}
