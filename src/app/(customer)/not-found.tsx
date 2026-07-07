import { NotFoundState } from "@/components/feedback/not-found-state";

export default function CustomerNotFound() {
  return (
    <NotFoundState
      description="This page or item is off the menu. Browse our burgers instead — something delicious is waiting."
      href="/menu"
      actionLabel="View the menu"
    />
  );
}
