import { mount } from "@vue/test-utils";
import Component from "..";
import currentComponent from "../index.vue";
import { describe, expect, test } from "vitest";
import { createApp } from "vue";
import { COMPONENT_PREFIX } from "@/config";

const componentCode = "textarea";
const componentClasses = `.${COMPONENT_PREFIX}-${componentCode}`;

const mockPlatform = (platform: string) => {
    return {
        global: {
            provide: {
                platform
            }
        }
    }
}

describe('test textarea style', () => {
    test('editor', () => {
        const wrapper = mount(currentComponent, {
            ...mockPlatform('editor')
        })
        const rootStyle = wrapper.find(componentClasses + ' .textarea').attributes()
        expect(rootStyle).toBeTruthy()
    })
})

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
    const wrapper = mount(currentComponent, {
      props: {
        data: {
          content: {
            desktop: "textarea",
            mobile: "textarea",
          },
        },
      },
    });
    expect(
      wrapper.find(componentClasses + " .textarea").attributes("modelvalue")
    ).toContain("textarea");
  });
});
