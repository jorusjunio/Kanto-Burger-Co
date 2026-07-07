import { NotFoundState } from "@/components/feedback/not-found-state";

/**
 * Top-level 404 for routes that fall outside the (customer)/admin groups.
 * Renders within the root layout shell.
 */
export default function RootNotFound() {
  return <NotFoundState />;
}
