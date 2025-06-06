import PaymentCard from "@/components/shared/payment-card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_admin/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PaymentCard open={true} setOpen={() => {}} amount="100" />
    </div>
  );
}
