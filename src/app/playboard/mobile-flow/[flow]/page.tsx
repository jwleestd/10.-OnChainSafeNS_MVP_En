import { notFound } from "next/navigation";

import { MobileCarousel } from "@/components/playboard/mobile-carousel";
import { getFlow, getRelatedScreens } from "@/playboard/derive";

export default function PlayBoardMobileFlowPage({ params }: { params: { flow: string } }) {
  const flow = getFlow(params.flow);

  if (!flow) {
    notFound();
  }

  const screens = getRelatedScreens(flow.screens);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Mobile Flow</p>
        <h1 className="mt-1 text-2xl font-semibold">{flow.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{flow.summary}</p>
      </div>

      <MobileCarousel screens={screens} />
    </div>
  );
}

