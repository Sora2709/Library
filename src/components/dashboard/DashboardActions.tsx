"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Download, Calendar } from "lucide-react";

export function DashboardActions() {
  const router = useRouter();
  return (
    <>
      <Button variant="outline" size="md" onClick={() => router.push("/reports")}>
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button size="md" onClick={() => router.push("/books")}>
        <Plus className="h-4 w-4" />
        Add Book
      </Button>
    </>
  );
}
