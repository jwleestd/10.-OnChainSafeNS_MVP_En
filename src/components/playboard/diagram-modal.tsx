"use client";

import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DiagramModal({ title, description, diagram }: { title: string; description: string; diagram: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Maximize2 className="h-4 w-4" />
          Diagram
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-xs leading-5">
          <code>{diagram}</code>
        </pre>
      </DialogContent>
    </Dialog>
  );
}

