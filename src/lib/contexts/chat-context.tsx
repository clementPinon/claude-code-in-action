"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useChat as useAIChat } from "@ai-sdk/react";
import { Message } from "ai";
import { useFileSystem } from "./file-system-context";
import { setHasAnonWork } from "@/lib/anon-work-tracker";

interface ChatContextProps {
  projectId?: string;
  initialMessages?: Message[];
}

interface ChatContextType {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  projectId,
  initialMessages = [],
}: ChatContextProps & { children: ReactNode }) {
  const { fileSystem, handleToolCall, triggerRefresh, refreshTrigger } =
    useFileSystem();

  const {
    messages,
    input,
    handleInputChange,
    setInput,
    append,
    status,
  } = useAIChat({
    api: "/api/chat",
    initialMessages,
    onToolCall: ({ toolCall }) => {
      handleToolCall(toolCall);
    },
    onFinish: () => {
      // Force refresh after AI response completes to ensure preview updates
      triggerRefresh();
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;

      // Serialize current file system state
      const serializedFiles = fileSystem.serialize();

      // Debug logging (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log("[ChatContext] Sending to AI:", {
          fileCount: Object.keys(serializedFiles).length,
          filePaths: Object.keys(serializedFiles),
          projectId,
        });
      }

      // Send message with current file system state
      append(
        {
          role: "user",
          content: input,
        },
        {
          body: {
            files: serializedFiles,
            projectId,
          },
        }
      );

      setInput("");
    },
    [input, fileSystem, projectId, append, setInput]
  );

  // Track anonymous work
  useEffect(() => {
    if (!projectId && messages.length > 0) {
      setHasAnonWork(messages, fileSystem.serialize());
    }
  }, [messages, fileSystem, projectId, refreshTrigger]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        input: input ?? "",
        handleInputChange,
        handleSubmit,
        status,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}