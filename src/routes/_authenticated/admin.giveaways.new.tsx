import { createFileRoute } from "@tanstack/react-router";
import { GiveawayEditor } from "@/components/giveaway-editor";

export const Route = createFileRoute("/_authenticated/admin/giveaways/new")({
  component: () => <GiveawayEditor />,
});