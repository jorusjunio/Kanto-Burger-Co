import { NotFoundState } from "@/components/feedback/not-found-state";

export default function AdminNotFound() {
  return (
    <NotFoundState
      description="This dashboard page doesn't exist or may have moved. Head back to the overview."
      href="/admin"
      actionLabel="Back to dashboard"
    />
  );
}
