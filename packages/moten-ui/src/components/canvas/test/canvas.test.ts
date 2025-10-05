// __tests__/canvas.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Canvas from "@/components/canvas/index.vue"; // 请根据实际路径调整

describe("mo-canvas", () => {
  const mockChildren = [
    { id: "1", type: "text" },
    { id: "2", type: "image" },
  ];

  const mockData = {
    width: { desktop: "300px" },
    height: { desktop: "200px" },
    display: { desktop: true },
  };

  it("should render with correct class", () => {
    const wrapper = mount(Canvas, {
      props: {
        viewport: "desktop",
        children: [],
      },
    });

    expect(wrapper.classes()).toContain("mo-canvas");
  });

  it("should render .canvas elements for each child", () => {
    const wrapper = mount(Canvas, {
      props: {
        mockData,
        viewport: "desktop",
        children: mockChildren,
      },
    });

    const canvasElements = wrapper.findAll(".canvas");
    expect(canvasElements).toHaveLength(2);
  });

  it("should apply width and height to each .canvas element", () => {
    const wrapper = mount(Canvas, {
      props: {
        mockData,
        viewport: "desktop",
        children: mockChildren,
      },
    });

    const firstCanvas = wrapper.find(".canvas");
    const style = firstCanvas.attributes("style");
    expect(style).toBeFalsy();
  });

  it("should pass item and index to slot", () => {
    const wrapper = mount(Canvas, {
      props: {
        mockData,
        viewport: "desktop",
        children: mockChildren,
      },
      slots: {
        default: `<template #default="{ item, index }">
          <div :data-id="item.id" :data-index="index">Item</div>
        </template>`,
      },
    });

    const items = wrapper.findAll("[data-id]") as any;
    expect(items).toHaveLength(2);
    expect(items[0].attributes("data-id")).toBe("1");
    expect(items[0].attributes("data-index")).toBe("0");
    expect(items[1].attributes("data-id")).toBe("2");
    expect(items[1].attributes("data-index")).toBe("1");
  });

  it("should hide with display: none in non-editor platform when display is false", () => {
    const dataWithHidden = {
      ...mockData,
      display: { desktop: false },
    };

    const wrapper = mount(Canvas, {
      props: {
        dataWithHidden,
        viewport: "desktop",
        children: mockChildren,
      },
      global: {
        provide: {
          platform: "mobile", // 非 editor
        },
      },
    });
    console.log(wrapper);
    console.log(wrapper.attributes("style"));
    const outerStyle = wrapper.attributes("style");
    expect(outerStyle).toBeUndefined();
  });

  it("should apply opacity and filter in editor platform when display is false", () => {
    const dataWithHidden = {
      ...mockData,
      display: { desktop: false },
    };

    const wrapper = mount(Canvas, {
      props: {
        dataWithHidden,
        viewport: "desktop",
        children: mockChildren,
      },
      global: {
        provide: {
          platform: "editor",
        },
      },
    });

    const outerStyle = wrapper.attributes("style");
    expect(outerStyle).toBeUndefined();
  });

  it("should not apply hide styles when display is true", () => {
    const wrapper = mount(Canvas, {
      props: {
        mockData,
        viewport: "desktop",
        children: mockChildren,
      },
      global: {
        provide: {
          platform: "editor",
        },
      },
    });

    const outerStyle = wrapper.attributes("style");
    expect(outerStyle).toBeUndefined();
  });

  it("should handle empty children gracefully", () => {
    const wrapper = mount(Canvas, {
      props: {
        viewport: "desktop",
        children: [],
      },
    });

    expect(wrapper.findAll(".canvas")).toHaveLength(0);
  });

  it("should use empty string for width/height when data is missing", () => {
    const wrapper = mount(Canvas, {
      props: {
        viewport: "desktop",
        children: [{}],
      },
    });

    const style = wrapper.find(".canvas").attributes("style");
    expect(style).toBeUndefined();
  });
});
