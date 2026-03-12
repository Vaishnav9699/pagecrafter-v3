import {
  registerChaiSaveToLibrary,
  resetSaveToLibrary,
  useSaveToLibraryComponent,
} from "@chaibuilder/runtime/client/register-chai-save-to-library";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("save-to-library", () => {
  beforeEach(() => {
    resetSaveToLibrary();
  });

  describe("registerSaveToLibrary", () => {
    it("should register a component", () => {
      const MockComponent = vi.fn(() => null);
      registerChaiSaveToLibrary(MockComponent);
      const { result } = renderHook(() => useSaveToLibraryComponent());
      expect(result.current).toBe(MockComponent);
    });
  });

  describe("useSaveToLibraryComponent", () => {
    it("should return null when no component is registered", () => {
      const { result } = renderHook(() => useSaveToLibraryComponent());
      expect(result.current).toBeNull();
    });

    it("should return registered component", () => {
      const MockComponent = vi.fn(() => null);
      registerChaiSaveToLibrary(MockComponent);
      const { result } = renderHook(() => useSaveToLibraryComponent());
      expect(result.current).toBe(MockComponent);
    });
  });
});
