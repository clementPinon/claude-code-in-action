import { getToolDisplayName } from "./tool-display-names";

export function extractFileName(path: string): string {
  if (!path || path.trim() === "") {
    return "";
  }

  const normalized = path.trim();

  if (normalized === "/") {
    return "root";
  }

  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export function truncateFilename(filename: string, maxLength = 30): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return filename.slice(0, maxLength - 3) + "...";
  }

  const extension = filename.slice(lastDotIndex);
  const nameWithoutExt = filename.slice(0, lastDotIndex);
  const availableLength = maxLength - extension.length - 3;

  if (availableLength <= 0) {
    return filename.slice(0, maxLength - 3) + "...";
  }

  return nameWithoutExt.slice(0, availableLength) + "..." + extension;
}

export function safeGetPath(
  args: Record<string, unknown>,
  key: string
): string | null {
  const value = args[key];
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  return null;
}

export function formatToolDisplay(
  toolName: string,
  args: Record<string, unknown>
): string {
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = safeGetPath(args, "path");

    if (!path) {
      return getToolDisplayName(toolName);
    }

    const filename = truncateFilename(extractFileName(path));

    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return `Editing ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      default:
        return getToolDisplayName(toolName);
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const path = safeGetPath(args, "path");
    const newPath = safeGetPath(args, "new_path");

    if (!path) {
      return getToolDisplayName(toolName);
    }

    const filename = truncateFilename(extractFileName(path));

    switch (command) {
      case "rename":
        if (newPath) {
          const newFilename = truncateFilename(extractFileName(newPath));
          return `Renaming ${filename} to ${newFilename}`;
        }
        return `Renaming ${filename}`;
      case "delete":
        return `Deleting ${filename}`;
      default:
        return getToolDisplayName(toolName);
    }
  }

  return getToolDisplayName(toolName);
}
