import { mount } from "@vue/test-utils";
import Component from "..";
import currentComponent from "../index.vue";
import { describe, expect, test } from "vitest";
import { createApp } from "vue";
import { COMPONENT_PREFIX } from "@/config";

const componentCode = "video";
const componentClasses = `.${COMPONENT_PREFIX}-${componentCode}`;

describe(`${componentClasses} base test`, () => {
  test("test component name", () => {
    const app = createApp({}).use(Component as any);
    expect(app.component(Component.name || "")).toBeTruthy();
  });

  test("test classes", () => {
    const wrapper = mount(currentComponent);
    expect(wrapper.find(componentClasses).classes()).toBeTruthy();
    wrapper.unmount();
  });
});

describe(`${componentCode} test props`, () => {
  test("test src", () => {
    const src =
      "https://static.videezy.com/system/resources/previews/000/035/849/original/WL057.mp4";
    const wrapper = mount(currentComponent, {
      props: {
        data: {
          videoUrl: {
            desktop: src,
            mobile: src,
          },
        },
      },
    });
    console.log(wrapper.find(componentClasses + " .video"));
    expect(
      wrapper.find(componentClasses + " .video").attributes("src")
    ).toContain(src);
  });
});
