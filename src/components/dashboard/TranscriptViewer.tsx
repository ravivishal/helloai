"use client";

import { cn } from "@/lib/utils";
import type { TranscriptMessage } from "@/types/index";

interface TranscriptViewerProps {
  messages: TranscriptMessage[];
}

export function TranscriptViewer({ messages }: TranscriptViewerProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isAssistant = message.role === "assistant" || message.role === "system";

        return (
          <div
            key={index}
            className={cn(
              "flex",
              isAssistant ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-3 max-w-[80%]",
                isAssistant
                  ? "bg-blue-50 text-blue-900"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              <p className="text-xs font-semibold mb-1 uppercase text-gray-500">
                {isAssistant ? "Assistant" : "Caller"}
              </p>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
