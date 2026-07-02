import Link from "next/link";

type Tool = {
  name: string;
  description: string;
  href?: string;
};

const TOOLS: Tool[] = [
  {
    name: "Release Procedure",
    description:
      "Build & store release checklists from trilingual (JA/EN/VI) templates. Auto-fills PR links from your release branches.",
    href: "/release-procedure",
  },
  {
    name: "SQL Runner",
    description: "Run SQL snippets against configured databases.",
  },
  {
    name: "Env Diff",
    description: "Compare environment variables across environments.",
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const body = (
    <div
      className={`flex h-full flex-col gap-xs rounded-lg border border-hairline bg-canvas p-lg transition-colors ${
        tool.href ? "hover:border-primary" : "opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-sm">
        <h3 className="text-heading-5 text-ink">{tool.name}</h3>
        {tool.href ? null : (
          <span className="rounded-full bg-surface px-xs py-xxs text-micro-uppercase text-stone">
            Soon
          </span>
        )}
      </div>
      <p className="text-body-sm text-steel">{tool.description}</p>
    </div>
  );

  if (!tool.href) return body;
  return (
    <Link href={tool.href} className="block">
      {body}
    </Link>
  );
}

export function ToolGrid() {
  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
      {TOOLS.map((tool) => (
        <ToolCard key={tool.name} tool={tool} />
      ))}
    </div>
  );
}
