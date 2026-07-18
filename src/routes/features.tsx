import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — DieselGrit" },
      {
        name: "description",
        content: "Every custom diesel truck feature published in DieselGrit.",
      },
      { property: "og:title", content: "Features — DieselGrit" },
      {
        property: "og:description",
        content: "The full archive of DieselGrit editorial diesel truck features.",
      },
    ],
  }),
  component: () => <Outlet />,
});
