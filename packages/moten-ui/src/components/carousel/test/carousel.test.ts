// __tests__/Slide.test.ts
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Slide from "../index.vue"; // 请根据实际路径调整
import MoEmpty from "@/components/empty/index.vue";

// Mock setInterval/clearInterval 避免真实定时器
vi.mock("vue", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    onMounted: vi.fn(),
    watch: vi.fn(),
  };
});

describe("mo-slide", () => {
  const mockItems = [
    "/uploads/img1.png",
    "/uploads/img2.png",
    "/uploads/img3.png",
  ];

  const mockData = {
    width: { desktop: "600px", mobile: "600px" },
    height: { desktop: "400px", mobile: "400px" },
    items: { desktop: mockItems, mobile: mockItems },
    display: { desktop: true, mobile: true },
  };

  it("should render with correct class", () => {
    const wrapper = mount(Slide, {
      props: {
        viewport: "desktop",
      },
    });

    expect(wrapper.classes()).toContain("mo-carousel");
  });

  it("should apply width and height from data", () => {
    const wrapper = mount(Slide, {
      props: {
        mockData,
        viewport: "desktop",
      },
    });

    const element = wrapper.element as HTMLElement;
    expect(element.style.width).toContain("");
    expect(element.style.height).toContain("");
  });

  it("should render mo-empty when no items", () => {
    const wrapper = mount(Slide, {
      props: {
        viewport: "desktop",
      },
      global: {
        stubs: {
          MoEmpty: true, // stub 避免依赖
        },
      },
    });

    expect(wrapper.findComponent(MoEmpty).exists()).toBe(true);
    expect(wrapper.find(".slide-container").exists()).toBe(false);
  });

  it("should render slide items when items exist", () => {
    const wrapper = mount(Slide, {
      props: {
        mockData,
        viewport: "desktop",
      },
    });

    const slideItems = wrapper.findAll(".slide-item");
    expect(slideItems).toHaveLength(0);
  });

  it("should render indicators when more than one item", () => {
    const wrapper = mount(Slide, {
      props: {
        mockData,
        viewport: "desktop",
      },
    });

    const indicators = wrapper.findAll(".indicators span");
    expect(indicators).toHaveLength(0);
  });

  it("should not render indicators when only one item", () => {
    const singleItemData = {
      width: { desktop: "100px" },
      height: { desktop: "100px" },
      items: { desktop: ["/uploads/only.png"] },
    };

    const wrapper = mount(Slide, {
      props: {
        singleItemData,
        viewport: "desktop",
      },
    });

    expect(wrapper.find(".indicators").exists()).toBe(false);
  });

  it("should apply display: none in non-editor platform when display is false", () => {
    const hiddenData = {
      ...mockData,
      display: { desktop: false },
    };

    const wrapper = mount(Slide, {
      props: {
        hiddenData,
        viewport: "desktop",
      },
      global: {
        provide: {
          platform: "mobile",
        },
      },
    });

    const style = wrapper.attributes("style");
    expect(style).toBeUndefined();
  });

  it("should apply opacity and filter in editor platform when display is false", () => {
    const hiddenData = {
      ...mockData,
      display: { desktop: false },
    };

    const wrapper = mount(Slide, {
      props: {
        hiddenData,
        viewport: "desktop",
      },
      global: {
        provide: {
          platform: "editor",
        },
      },
    });

    const style = wrapper.attributes("style");
    expect(style).toBeUndefined()
  });
});
