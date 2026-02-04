import { describe, it, expect } from "vitest";
import {
  extractFileName,
  truncateFilename,
  safeGetPath,
  formatToolDisplay,
} from "../tool-display";

describe("extractFileName", () => {
  it("extracts filename from absolute path", () => {
    expect(extractFileName("/src/components/Card.jsx")).toBe("Card.jsx");
  });

  it("extracts filename from root file", () => {
    expect(extractFileName("/App.jsx")).toBe("App.jsx");
  });

  it("handles @/ alias paths", () => {
    expect(extractFileName("@/components/Button.tsx")).toBe("Button.tsx");
  });

  it("handles paths without leading slash", () => {
    expect(extractFileName("src/utils/helpers.ts")).toBe("helpers.ts");
  });

  it("handles root path", () => {
    expect(extractFileName("/")).toBe("root");
  });

  it("handles empty path", () => {
    expect(extractFileName("")).toBe("");
  });

  it("handles whitespace-only path", () => {
    expect(extractFileName("   ")).toBe("");
  });

  it("handles special characters in filename", () => {
    expect(extractFileName("/src/My Component (v2).jsx")).toBe(
      "My Component (v2).jsx"
    );
  });

  it("handles path with trailing slash", () => {
    expect(extractFileName("/src/components/")).toBe("components");
  });
});

describe("truncateFilename", () => {
  it("leaves short filenames unchanged", () => {
    expect(truncateFilename("Card.jsx")).toBe("Card.jsx");
    expect(truncateFilename("App.tsx")).toBe("App.tsx");
  });

  it("truncates long filenames", () => {
    const longName = "VeryLongComponentNameThatExceedsMaxLength.jsx";
    const result = truncateFilename(longName, 30);
    expect(result.length).toBe(30);
    expect(result).toContain("...");
    expect(result.endsWith(".jsx")).toBe(true);
  });

  it("preserves file extension when truncating", () => {
    const longName = "SuperDuperExtraLongComponentName.tsx";
    const result = truncateFilename(longName, 25);
    expect(result).toMatch(/^.+\.\.\..tsx$/);
  });

  it("handles files without extension", () => {
    const longName = "VeryLongFileNameWithoutExtension";
    const result = truncateFilename(longName, 20);
    expect(result.length).toBe(20);
    expect(result.endsWith("...")).toBe(true);
  });

  it("handles custom max length", () => {
    const result = truncateFilename("MediumLengthFile.js", 10);
    expect(result.length).toBe(10);
  });

  it("handles very short max length", () => {
    const result = truncateFilename("file.jsx", 5);
    expect(result.length).toBeLessThanOrEqual(5);
  });
});

describe("safeGetPath", () => {
  it("extracts valid string path", () => {
    expect(safeGetPath({ path: "/src/App.jsx" }, "path")).toBe("/src/App.jsx");
  });

  it("trims whitespace from path", () => {
    expect(safeGetPath({ path: "  /src/App.jsx  " }, "path")).toBe(
      "/src/App.jsx"
    );
  });

  it("returns null for missing key", () => {
    expect(safeGetPath({ other: "value" }, "path")).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(safeGetPath({ path: "" }, "path")).toBe(null);
  });

  it("returns null for whitespace-only string", () => {
    expect(safeGetPath({ path: "   " }, "path")).toBe(null);
  });

  it("returns null for non-string value", () => {
    expect(safeGetPath({ path: 123 }, "path")).toBe(null);
    expect(safeGetPath({ path: null }, "path")).toBe(null);
    expect(safeGetPath({ path: undefined }, "path")).toBe(null);
    expect(safeGetPath({ path: {} }, "path")).toBe(null);
  });
});

describe("formatToolDisplay", () => {
  describe("str_replace_editor tool", () => {
    it("formats create command", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "create",
        path: "/src/Card.jsx",
      });
      expect(result).toBe("Creating Card.jsx");
    });

    it("formats str_replace command", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "str_replace",
        path: "/src/Button.tsx",
      });
      expect(result).toBe("Editing Button.tsx");
    });

    it("formats insert command", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "insert",
        path: "/App.jsx",
      });
      expect(result).toBe("Editing App.jsx");
    });

    it("formats view command", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "view",
        path: "/src/utils.ts",
      });
      expect(result).toBe("Viewing utils.ts");
    });

    it("truncates long filenames", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "create",
        path: "/src/VeryLongComponentNameThatExceedsMaxLength.jsx",
      });
      expect(result.length).toBeLessThanOrEqual(50);
      expect(result).toContain("Creating");
      expect(result).toContain("...");
    });

    it("falls back for unknown command", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "unknown",
        path: "/App.jsx",
      });
      expect(result).toBe("Editing code");
    });

    it("falls back when path is missing", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "create",
      });
      expect(result).toBe("Editing code");
    });

    it("falls back when path is empty", () => {
      const result = formatToolDisplay("str_replace_editor", {
        command: "create",
        path: "",
      });
      expect(result).toBe("Editing code");
    });
  });

  describe("file_manager tool", () => {
    it("formats rename command", () => {
      const result = formatToolDisplay("file_manager", {
        command: "rename",
        path: "/Button.jsx",
        new_path: "/PrimaryButton.jsx",
      });
      expect(result).toBe("Renaming Button.jsx to PrimaryButton.jsx");
    });

    it("formats rename without new_path", () => {
      const result = formatToolDisplay("file_manager", {
        command: "rename",
        path: "/Button.jsx",
      });
      expect(result).toBe("Renaming Button.jsx");
    });

    it("formats delete command", () => {
      const result = formatToolDisplay("file_manager", {
        command: "delete",
        path: "/old-file.ts",
      });
      expect(result).toBe("Deleting old-file.ts");
    });

    it("falls back for unknown command", () => {
      const result = formatToolDisplay("file_manager", {
        command: "unknown",
        path: "/file.ts",
      });
      expect(result).toBe("Managing files");
    });

    it("falls back when path is missing", () => {
      const result = formatToolDisplay("file_manager", {
        command: "delete",
      });
      expect(result).toBe("Managing files");
    });
  });

  describe("unknown tool", () => {
    it("falls back for unknown tool name", () => {
      const result = formatToolDisplay("unknown_tool", {
        path: "/file.js",
      });
      expect(result).toBe("unknown_tool");
    });
  });
});
