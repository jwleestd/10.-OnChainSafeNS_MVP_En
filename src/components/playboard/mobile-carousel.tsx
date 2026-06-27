"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Screen } from "@/playboard/types";

export function MobileCarousel({ screens }: { screens: Screen[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByFrame(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="icon" onClick={() => scrollByFrame(-1)} aria-label="Scroll left">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={() => scrollByFrame(1)} aria-label="Scroll right">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div ref={scrollerRef} className="flex snap-x gap-5 overflow-x-auto pb-4">
        {screens.map((screen) => (
          <section key={`${screen.plane}/${screen.slug}`} className="w-[330px] shrink-0 snap-start">
            <div className="h-[680px] overflow-hidden rounded-[28px] border-8 border-foreground bg-background shadow-sm">
              <iframe
                title={`${screen.title} mobile frame`}
                src={`/playboard/screens/${screen.plane}/${screen.slug}`}
                className="h-full w-full"
              />
            </div>
            <div className="mt-2 text-sm font-medium">{screen.title}</div>
            <div className="text-xs text-muted-foreground">{screen.plane}/{screen.slug}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

