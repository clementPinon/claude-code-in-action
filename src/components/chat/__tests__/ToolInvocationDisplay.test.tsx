import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationDisplay } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

describe("ToolInvocationDisplay", () => {
  describe("str_replace_editor tool", () => {
    it("renders creating file message", () => {
      render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "create", path: "/src/Card.jsx" }}
          state="partial"
        />
      );
      expect(screen.getByText("Creating Card.jsx")).toBeDefined();
    });

    it("renders editing file message for str_replace", () => {
      render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "/Button.tsx" }}
          state="result"
        />
      );
      expect(screen.getByText("Editing Button.tsx")).toBeDefined();
    });

    it("renders editing file message for insert", () => {
      render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "insert", path: "/App.jsx" }}
          state="result"
        />
      );
      expect(screen.getByText("Editing App.jsx")).toBeDefined();
    });

    it("renders viewing file message", () => {
      render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "view", path: "/utils.ts" }}
          state="result"
        />
      );
      expect(screen.getByText("Viewing utils.ts")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    it("renders renaming file message", () => {
      render(
        <ToolInvocationDisplay
          toolName="file_manager"
          args={{
            command: "rename",
            path: "/Button.jsx",
            new_path: "/PrimaryButton.jsx",
          }}
          state="result"
        />
      );
      expect(
        screen.getByText("Renaming Button.jsx to PrimaryButton.jsx")
      ).toBeDefined();
    });

    it("renders deleting file message", () => {
      render(
        <ToolInvocationDisplay
          toolName="file_manager"
          args={{ command: "delete", path: "/old-file.ts" }}
          state="result"
        />
      );
      expect(screen.getByText("Deleting old-file.ts")).toBeDefined();
    });
  });

  describe("loading states", () => {
    it("shows loading state with spinner", () => {
      const { container } = render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
          state="partial"
        />
      );

      expect(screen.getByText("Creating App.jsx")).toBeDefined();
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeDefined();
      expect(spinner).not.toBeNull();
    });

    it("shows completed state with green dot", () => {
      const { container } = render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "create", path: "/Card.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating Card.jsx")).toBeDefined();
      const greenDot = container.querySelector(".bg-emerald-500");
      expect(greenDot).toBeDefined();
      expect(greenDot).not.toBeNull();
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("handles missing path gracefully", () => {
      render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "create" }}
          state="result"
        />
      );
      expect(screen.getByText("Editing code")).toBeDefined();
    });

    it("handles long filenames", () => {
      render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{
            command: "create",
            path: "/src/VeryLongComponentNameThatExceedsMaxLength.jsx",
          }}
          state="result"
        />
      );

      const text = screen.getByText(/Creating/);
      expect(text.textContent).toContain("...");
      expect(text.textContent).toContain(".jsx");
    });

    it("handles empty args", () => {
      render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{}}
          state="result"
        />
      );
      expect(screen.getByText("Editing code")).toBeDefined();
    });

    it("handles unknown tool name", () => {
      render(
        <ToolInvocationDisplay
          toolName="unknown_tool"
          args={{ path: "/file.js" }}
          state="result"
        />
      );
      expect(screen.getByText("unknown_tool")).toBeDefined();
    });
  });

  describe("styling", () => {
    it("applies correct container classes", () => {
      const { container } = render(
        <ToolInvocationDisplay
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
          state="result"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("inline-flex");
      expect(wrapper.className).toContain("items-center");
      expect(wrapper.className).toContain("gap-2");
      expect(wrapper.className).toContain("bg-neutral-50");
      expect(wrapper.className).toContain("rounded-lg");
      expect(wrapper.className).toContain("text-xs");
      expect(wrapper.className).toContain("border");
    });
  });
});
