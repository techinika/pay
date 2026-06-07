import { Suspense } from "react";
import { SearchPage } from "@/app/components/search-page";
import { ErrorBoundary } from "@/app/components/error-boundary";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ErrorBoundary>
        <SearchPage />
      </ErrorBoundary>
    </Suspense>
  );
}
