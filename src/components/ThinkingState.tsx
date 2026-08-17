import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function ThinkingState({ steps }: { steps: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1 < steps.length ? i + 1 : i));
    }, 2600);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="surface-panel flex flex-col gap-3 p-6" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="size-4 animate-spin text-accent" />
        {steps[index]}
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-muted"
            style={{ width: `${100 - i * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}
