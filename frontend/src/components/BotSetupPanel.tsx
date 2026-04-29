import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      className="text-gray-500 hover:text-gray-300 transition-colors"
      title="Copy"
    >
      {copied ? (
        <CheckCircle2 size={13} className="text-green-400" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

function CodeLine({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-gray-950 rounded px-3 py-2 font-mono text-xs text-gray-300">
      <span className="truncate">{value}</span>
      <CopyButton text={value} />
    </div>
  );
}

function Step({
  number,
  title,
  children,
  defaultOpen = false,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/40 transition-colors text-left"
      >
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <span className="text-sm font-medium text-white flex-1">{title}</span>
        {open ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-gray-800 p-4 space-y-3 bg-gray-900/30">
          {children}
        </div>
      )}
    </div>
  );
}

export function BotSetupPanel() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/webhooks/status")
      .then((r) => r.json())
      .then((d: { configured: boolean }) => setConfigured(d.configured))
      .catch(() => setConfigured(false));
  }, []);

  const webhookUrl = `${window.location.origin.replace("5173", "3001")}/api/webhooks/github`;

  return (
    <div className="space-y-6">
      {/* Status card */}
      <div
        className={`rounded-xl border p-5 flex items-start gap-4 ${
          configured
            ? "bg-green-950/30 border-green-800"
            : "bg-gray-900 border-gray-800"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            configured ? "bg-green-900" : "bg-gray-800"
          }`}
        >
          <Bot
            size={20}
            className={configured ? "text-green-400" : "text-gray-400"}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">
              GitHub App Bot
            </h2>
            {configured === null ? (
              <span className="text-xs text-gray-500">Checking...</span>
            ) : configured ? (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 size={13} /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <XCircle size={13} /> Not configured
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Automatically reviews every PR opened on repos where this app is
            installed — posts results as a review comment.
          </p>
        </div>
      </div>

      {/* Setup steps */}
      <div className="space-y-2">
        <Step number={1} title="Create a GitHub App" defaultOpen={true}>
          <p className="text-sm text-gray-400">
            Go to GitHub → Settings → Developer settings → GitHub Apps → New
            GitHub App.
          </p>
          <a
            href="https://github.com/settings/apps/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
          >
            Open GitHub App creation page <ExternalLink size={13} />
          </a>
          <div className="space-y-2 mt-2">
            {[
              ["GitHub App name", "ai-code-reviewer-bot (any unique name)"],
              ["Homepage URL", "https://github.com"],
              ["Webhook URL", webhookUrl],
              ["Webhook secret", "generate-a-random-string"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <CodeLine value={value} />
              </div>
            ))}
          </div>
        </Step>

        <Step number={2} title="Set permissions & events">
          <p className="text-sm text-gray-400">
            Under <strong className="text-gray-300">Permissions</strong>, set:
          </p>
          <ul className="space-y-1">
            {[
              ["Pull requests", "Read & Write"],
              ["Contents", "Read-only"],
            ].map(([perm, level]) => (
              <li
                key={perm}
                className="flex items-center justify-between text-sm bg-gray-800 rounded px-3 py-2"
              >
                <span className="text-gray-300">{perm}</span>
                <span className="text-xs text-green-400 font-medium">
                  {level}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-400 mt-2">
            Under <strong className="text-gray-300">Subscribe to events</strong>
            , check <strong className="text-gray-300">Pull request</strong>.
          </p>
        </Step>

        <Step number={3} title="Generate & download private key">
          <p className="text-sm text-gray-400">
            After creating the app, scroll to the bottom and click{" "}
            <strong className="text-gray-300">Generate a private key</strong>.
            A <code className="text-blue-300 text-xs">.pem</code> file will
            download.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Also note your <strong className="text-gray-300">App ID</strong>{" "}
            shown at the top of the app settings page.
          </p>
        </Step>

        <Step number={4} title="Add environment variables to backend">
          <p className="text-sm text-gray-400">
            Add these to your{" "}
            <code className="text-blue-300 text-xs">backend/.env</code>:
          </p>
          <div className="space-y-2">
            {[
              "GITHUB_APP_ID=your_app_id_number",
              'GITHUB_WEBHOOK_SECRET=your_random_secret',
              "GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\\n...\\n-----END RSA PRIVATE KEY-----",
            ].map((line) => (
              <CodeLine key={line} value={line} />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            For the private key, open the .pem file, copy the contents, and
            replace real newlines with <code>\n</code>.
          </p>
        </Step>

        <Step number={5} title="Install the app on a repo">
          <p className="text-sm text-gray-400">
            Go to your GitHub App page → Install App → select a repository.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Once installed, open a new PR in that repo — the bot will
            automatically post a review within ~20 seconds.
          </p>
        </Step>
      </div>

      {/* How it works */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">How it works</h3>
        <ol className="space-y-2">
          {[
            "PR opened → GitHub sends webhook to your backend",
            "Backend verifies signature and reads PR diff",
            "Groq (Llama 3.3 70B) reviews each file",
            "Bot posts structured review as a PR comment",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-blue-500 font-medium shrink-0">
                {i + 1}.
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
