"use client";

import { useState, useCallback } from "react";

export interface UseClipboardOptions {
  timeout?: number;
}

export interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
}

/**
 * useClipboard — Hook trừu tượng hóa thao tác sao chép văn bản vào clipboard
 * Tuân thủ nguyên lý Dependency Inversion Principle (DIP)
 * Hỗ trợ fallback an toàn cho môi trường không có navigator.clipboard
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (typeof window !== "undefined" && navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else if (typeof document !== "undefined") {
          // Fallback an toàn cho trình duyệt cũ hoặc ngữ cảnh non-HTTPS
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "-9999px";
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        } else {
          return false;
        }

        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copy, copied };
}
