import { notFound } from "next/navigation";

import { PlayBoardNav } from "@/components/playboard/playboard-nav";
import { isPlayBoardEnabled } from "@/playboard/exposure";

export const dynamic = "force-dynamic";

export default function PlayBoardLayout({ children }: { children: React.ReactNode }) {
  if (!isPlayBoardEnabled()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PlayBoardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}

