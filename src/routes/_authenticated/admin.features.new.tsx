import { createFileRoute } from "@tanstack/react-router";
import { FeatureEditor } from "@/components/feature-editor";

export const Route = createFileRoute("/_authenticated/admin/features/new")({
  component: () => <FeatureEditor />,
});
