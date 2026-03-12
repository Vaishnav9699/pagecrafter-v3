import { transformNode, type HimalayaNode } from "@chaibuilder/hooks/use-blocks-html-for-ai";

describe("transformNode", () => {
  const mockBlocks: any[] = [];

  describe("Core Blocks", () => {
    test("should remove data-block-type attribute from core block", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [
          { key: "data-block-type", value: "Box" },
          { key: "class", value: "container" },
        ],
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.attributes?.find((attr) => attr.key === "data-block-type")).toBeUndefined();
      expect(result.attributes?.find((attr) => attr.key === "class")).toBeDefined();
      expect(result.tagName).toBe("div");
    });

    test("should remove data-block-id attribute from core block", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "button",
        attributes: [
          { key: "data-block-type", value: "Button" },
          { key: "data-block-id", value: "btn123" },
          { key: "class", value: "btn" },
        ],
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.attributes?.find((attr) => attr.key === "data-block-id")).toBeUndefined();
      expect(result.attributes?.find((attr) => attr.key === "class")).toBeDefined();
    });

    test("should recursively transform children of core blocks", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [{ key: "data-block-type", value: "Box" }],
        children: [
          {
            type: "element",
            tagName: "h1",
            attributes: [{ key: "data-block-type", value: "Heading" }],
            children: [],
          },
        ],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.children?.[0].attributes?.find((attr) => attr.key === "data-block-type")).toBeUndefined();
    });
  });

  describe("Custom Blocks", () => {
    test("should convert custom block to web component tag", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [
          { key: "data-block-type", value: "CustomWidget" },
          { key: "data-block-id", value: "widget123" },
        ],
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.tagName).toBe("chai-custom-widget");
    });

    test("should convert camelCase block type to kebab-case tag name", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [{ key: "data-block-type", value: "MyCustomComponent" }],
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.tagName).toBe("chai-my-custom-component");
    });

    test("should keep only id and chai-type attributes for custom blocks", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [
          { key: "data-block-type", value: "CustomBlock" },
          { key: "data-block-id", value: "custom123" },
          { key: "class", value: "some-class" },
          { key: "style", value: "color: red" },
        ],
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.attributes).toHaveLength(2);
      expect(result.attributes).toContainEqual({ key: "chai-type", value: "CustomBlock" });
      expect(result.attributes).toContainEqual({ key: "bid", value: "custom123" });
    });

    test("should have only chai-type attribute if no data-block-id", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [
          { key: "data-block-type", value: "CustomBlock" },
          { key: "class", value: "some-class" },
        ],
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.attributes).toHaveLength(1);
      expect(result.attributes?.[0]).toEqual({ key: "chai-type", value: "CustomBlock" });
    });

    test("should remove all children from custom blocks", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [{ key: "data-block-type", value: "CustomBlock" }],
        children: [
          {
            type: "element",
            tagName: "p",
            attributes: [],
            children: [{ type: "text", content: "Child content" }],
          },
        ],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.children).toHaveLength(0);
    });
  });

  describe("Non-block Elements", () => {
    test("should recursively transform children of non-block elements", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [{ key: "class", value: "wrapper" }],
        children: [
          {
            type: "element",
            tagName: "div",
            attributes: [{ key: "data-block-type", value: "Box" }],
            children: [],
          },
        ],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.tagName).toBe("div");
      expect(result.attributes?.[0]).toEqual({ key: "class", value: "wrapper" });
      expect(result.children?.[0].attributes?.find((attr) => attr.key === "data-block-type")).toBeUndefined();
    });

    test("should keep text nodes unchanged", () => {
      const node: HimalayaNode = {
        type: "text",
        content: "Hello World",
      };

      const result = transformNode(node, mockBlocks);

      expect(result).toEqual(node);
    });

    test("should handle nodes without attributes", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result).toEqual(node);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty children array", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [{ key: "data-block-type", value: "Box" }],
        children: [],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.children).toHaveLength(0);
    });

    test("should handle nested core blocks", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [{ key: "data-block-type", value: "Box" }],
        children: [
          {
            type: "element",
            tagName: "div",
            attributes: [{ key: "data-block-type", value: "Box" }],
            children: [
              {
                type: "element",
                tagName: "p",
                attributes: [{ key: "data-block-type", value: "Paragraph" }],
                children: [],
              },
            ],
          },
        ],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.attributes?.find((attr) => attr.key === "data-block-type")).toBeUndefined();
      expect(result.children?.[0].attributes?.find((attr) => attr.key === "data-block-type")).toBeUndefined();
      expect(
        result.children?.[0].children?.[0].attributes?.find((attr) => attr.key === "data-block-type"),
      ).toBeUndefined();
    });

    test("should handle custom block inside core block", () => {
      const node: HimalayaNode = {
        type: "element",
        tagName: "div",
        attributes: [{ key: "data-block-type", value: "Box" }],
        children: [
          {
            type: "element",
            tagName: "div",
            attributes: [
              { key: "data-block-type", value: "CustomWidget" },
              { key: "data-block-id", value: "widget1" },
            ],
            children: [
              {
                type: "element",
                tagName: "p",
                attributes: [],
                children: [],
              },
            ],
          },
        ],
      };

      const result = transformNode(node, mockBlocks);

      expect(result.tagName).toBe("div");
      expect(result.children?.[0].tagName).toBe("chai-custom-widget");
      expect(result.children?.[0].children).toHaveLength(0);
    });
  });
});
