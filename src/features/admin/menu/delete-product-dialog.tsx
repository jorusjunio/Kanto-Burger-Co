"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteProduct } from "@/features/admin/menu/actions";

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      <Trash2 aria-hidden="true" />
      {pending ? "Deleting…" : "Delete product"}
    </Button>
  );
}

/**
 * Confirmation gate for product deletion. The actual work runs in the
 * `deleteProduct` server action (which soft-deletes products tied to orders);
 * this component only prevents accidental one-click removal.
 */
export function DeleteProductDialog({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="transition-all duration-300 hover:-translate-y-0.5"
        >
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “{productName}”?</DialogTitle>
          <DialogDescription>
            This removes the product from your menu and the storefront. Any past
            orders that include it stay intact — it&apos;s hidden, not erased
            from order history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form action={deleteProduct} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="productId" value={productId} />
            <ConfirmButton />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
