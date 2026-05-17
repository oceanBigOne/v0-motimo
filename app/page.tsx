import { Game } from "@/components/Game";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-2xl">Chargement...</div>}>
      <Game />
    </Suspense>
  );
}
