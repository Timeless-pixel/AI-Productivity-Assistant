import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, AlertTriangle, Lock, UserCheck, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — WorkWise AI" },
      { name: "description", content: "How WorkWise AI encourages safe, ethical and effective AI use at work." },
    ],
  }),
  component: ResponsibleAI,
});

const practices = [
  { icon: UserCheck, title: "Verify important information", body: "AI can make mistakes. Always check facts, figures, dates and quotes before relying on them." },
  { icon: Lock, title: "Protect confidential data", body: "Never submit private, sensitive or company-confidential information into AI systems." },
  { icon: Scale, title: "Use AI as an assistant", body: "AI supports — but does not replace — human judgment, accountability and expertise." },
  { icon: AlertTriangle, title: "Be aware of bias", body: "AI reflects the data it was trained on. Watch for skew, stereotypes and outdated framing." },
];

function ResponsibleAI() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Trust & Safety"
        title="Responsible AI"
        description="WorkWise AI is designed to help you work smarter — safely. Use these principles to get the most out of Nova while protecting yourself and your organisation."
      />
      <Card className="border-l-4 border-l-primary p-6">
        <div className="flex gap-4">
          <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Important disclaimer</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              AI-generated content may contain inaccuracies or outdated information. Always
              review important emails, research, workplace decisions, and planning before
              relying on them professionally. Never submit confidential, sensitive, or private
              company information into AI systems.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {practices.map((p) => (
          <Card key={p.title} className="p-5">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}