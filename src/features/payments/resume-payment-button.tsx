"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";

import { goToGateway } from "./gateway-redirect";
import { resumePayment } from "./resume-actions";

type ResumePaymentButtonProps = {
  orderNumber: string;
  trackingToken: string;
};

export function ResumePaymentButton({
  orderNumber,
  trackingToken,
}: ResumePaymentButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await resumePayment(orderNumber, trackingToken);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      goToGateway(router, result.redirectUrl);
    });
  }

  return (
    <Button
      size="sm"
      className="h-9 shrink-0 bg-gradient-to-r from-sky-500 to-blue-600 font-black text-white hover:from-sky-600 hover:to-blue-700"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <Smartphone aria-hidden="true" />
      )}
      Pay via GCash
    </Button>
  );
}
