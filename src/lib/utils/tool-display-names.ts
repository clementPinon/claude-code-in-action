export function getToolDisplayName(toolName: string): string {
  const toolNameMap: Record<string, string> = {
    str_replace_editor: "Editing code",
    file_manager: "Managing files",
  };
  return toolNameMap[toolName] || toolName;
}
