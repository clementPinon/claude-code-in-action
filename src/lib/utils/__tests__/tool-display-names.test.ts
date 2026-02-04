import { describe, it, expect } from "vitest";
import { getToolDisplayName } from "../tool-display-names";

describe("getToolDisplayName", () => {
  it("should return user-friendly name for str_replace_editor", () => {
    expect(getToolDisplayName("str_replace_editor")).toBe("Editing code");
  });

  it("should return user-friendly name for file_manager", () => {
    expect(getToolDisplayName("file_manager")).toBe("Managing files");
  });

  it("should return the original tool name for unknown tools", () => {
    expect(getToolDisplayName("unknown_tool")).toBe("unknown_tool");
  });

  it("should handle empty string", () => {
    expect(getToolDisplayName("")).toBe("");
  });

  it("should be case-sensitive", () => {
    expect(getToolDisplayName("STR_REPLACE_EDITOR")).toBe("STR_REPLACE_EDITOR");
  });
});
