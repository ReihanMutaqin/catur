import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type ChatRow = {
  id: number;
  userId: number | null;
  name: string | null;
  body: string;
  system: boolean;
  createdAt: Date;
};

const QUICK_CHATS = [
  "Semoga beruntung! 🍀",
  "Langkah bagus! 👍",
  "Ups… 😅",
  "Permainan yang seru!",
  "Terima kasih sudah bermain 🤝",
];

export default function ChatPanel({
  messages,
  myUserId,
  disabled,
  onSend,
}: {
  messages: ChatRow[];
  myUserId: number;
  disabled: boolean;
  onSend: (body: string) => void;
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submit(body: string) {
    const clean = body.trim();
    if (!clean || disabled) return;
    onSend(clean);
    setText("");
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 pr-3 py-1">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Belum ada pesan. Sapa lawanmu! 👋
            </p>
          )}
          {messages.map((m) =>
            m.system ? (
              <div
                key={m.id}
                className="text-xs text-center text-amber-300/80 italic py-1"
              >
                {m.body}
              </div>
            ) : (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.userId === myUserId ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-1.5 text-sm break-words",
                    m.userId === myUserId
                      ? "bg-amber-500/20 text-amber-50"
                      : "bg-secondary",
                  )}
                >
                  {m.userId !== myUserId && (
                    <div className="text-[10px] text-muted-foreground font-semibold mb-0.5">
                      {m.name}
                    </div>
                  )}
                  {m.body}
                </div>
              </div>
            ),
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Chat cepat */}
      <div className="flex gap-1.5 overflow-x-auto py-2 no-scrollbar">
        {QUICK_CHATS.map((q) => (
          <button
            key={q}
            disabled={disabled}
            onClick={() => submit(q)}
            className="shrink-0 text-xs px-2.5 py-1 rounded-full border border-border hover:bg-accent disabled:opacity-40 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? "Chat nonaktif" : "Ketik pesan…"}
          disabled={disabled}
          maxLength={280}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={disabled || !text.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
