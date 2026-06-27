import Link from "next/link";
import { notFound } from "next/navigation";

import { ScreenCard } from "@/components/playboard/screen-card";
import { getFlow, getRelatedScreens } from "@/playboard/derive";

export default function PlayBoardUxFlowPage({ params }: { params: { flow: string } }) {
  const flow = getFlow(params.flow);

  if (!flow) {
    notFound();
  }

  const screens = getRelatedScreens(flow.screens);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Desktop Flow</p>
        <h1 className="mt-1 text-2xl font-semibold">{flow.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{flow.summary}</p>
      </div>

      <div className="flex gap-3 overflow-x-auto rounded-lg border bg-muted/20 p-3">
        {screens.map((screen, index) => (
          <Link
            key={`${screen.plane}/${screen.slug}`}
            href={`/playboard/screens/${screen.plane}/${screen.slug}`}
            className="w-[220px] shrink-0 rounded-md border bg-background p-3 hover:bg-accent"
          >
            <div className="text-xs text-muted-foreground">Step {index + 1}</div>
            <div className="mt-1 text-sm font-semibold">{screen.title}</div>
            <div className="mt-2 h-20 rounded-md border bg-muted/40" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {screens.map((screen) => (
          <ScreenCard key={`${screen.plane}/${screen.slug}`} screen={screen} />
        ))}
      </div>
    </div>
  );
}

