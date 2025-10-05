// __tests__/Blank.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Blank from "../index.vue"; // 路径按你项目调整

describe("mo-blank", () => {
  it("should render with correct class", () => {
    const wrapper = mount(Blank, {
      props: {
        data: {},
        viewport: "desktop",
      },
    });

    expect(wrapper.classes()).toContain("mo-blank");
  });

  it("should apply width, height and backgroundColor from data", () => {
    const data = {
      width: { desktop: "200px", mobile: "200px" },
      height: { desktop: "100px", mobile: "100px" },
      color: { desktop: "#ff0000", mobile: "#ff0000" },
    } as any;

    const wrapper = mount(Blank, {
      props: {
        data,
        viewport: "desktop",
      },
    });

    const style = wrapper.attributes("style");
    expect(style).toContain("width: 200px");
    expect(style).toContain("height: 100px");
    expect(style).toContain(" rgb(255, 0, 0)");
  });

  it("should hide element with display: none in non-editor platform when display is false", () => {
    const data = {
      display: { desktop: false, mobile: false },
    };

    const wrapper = mount(Blank, {
      props: {
        data,
        viewport: "desktop",
      } as any,
      global: {
        provide: {
          platform: "mobile", // 非 editor
        },
      },
    });

    const style = wrapper.attributes("style");
    expect(style).toContain("display: none");
  });

  it("should apply opacity and filter in editor platform when display is false", () => {
    const data = {
      display: { desktop: false },
    };

    const wrapper = mount(Blank, {
      props: {
        data,
        viewport: "desktop",
      } as any,
      global: {
        provide: {
          platform: "editor",
        },
      },
    });

    const style = wrapper.attributes("style");
    expect(style).toContain("opacity: 0.4");
    expect(style).toContain("filter: brightness(0.7)");
  });

  it("should not apply hide styles when display is true", () => {
    const data = {
      display: { desktop: true },
      width: { desktop: "100px" },
    };

    const wrapper = mount(Blank, {
      props: {
        data,
        viewport: "desktop",
      } as any,
      global: {
        provide: {
          platform: "editor",
        },
      },
    });

    const style = wrapper.attributes("style");
    expect(style).not.toContain("opacity");
    expect(style).not.toContain("display: none");
    expect(style).toContain("width: 100px");
  });

  it("should render slot content", () => {
    const wrapper = mount(Blank, {
      props: {
        data: {},
        viewport: "desktop",
      },
      slots: {
        default: '<div class="test-slot">Hello</div>',
      },
    });

    expect(wrapper.find(".test-slot").exists()).toBe(true);
    expect(wrapper.text()).toContain("Hello");
  });

  it("should use default values when data is missing", () => {
    const wrapper = mount(Blank, {
      props: {
        data: {}, // empty
        viewport: "desktop",
      },
    });

    const style = wrapper.attributes("style");
    // width/height/color should be empty string → no style applied
    expect(style).not.toBeTruthy();
    // expect(style).not.toContain("height");
    // expect(style).not.toContain("background-color");
  });
});
