import { ToolGrid } from "@/components/organisms/ToolGrid";
import { requireUser } from "@/lib/auth/dal";

export default async function HomePage() {
  await requireUser();
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xxs">
        <h1 className="text-heading-2 text-ink">Tools</h1>
        <p className="text-subtitle text-steel">Pick a tool to get started.</p>
      </div>
      <ToolGrid />
    </div>
  );
}
