import type { Vendor } from "../audit/types";
import { pricingByTool } from "./schema";

export function plansForTool(tool: Vendor): string[] {
  return pricingByTool[tool].map((item) => item.plan);
}
