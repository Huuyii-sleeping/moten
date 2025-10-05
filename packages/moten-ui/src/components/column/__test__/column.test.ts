import { mount } from "@vue/test-utils";
import Component from "..";
import currentComponent from "../index.vue";
import { describe, expect, test } from "vitest";
import { createApp } from "vue";
import { COMPONENT_PREFIX } from "@/config";

const componentCode = 'image'
const componentClasses = `.${COMPONENT_PREFIX}-${componentCode}`

describe(`${componentClasses} base test`, () => {
    test('test component name', () => {
        const app = createApp({}).use(Component as any)
        expect(app.component(Component.name || '')).toBeTruthy()
    })

    test('test classes', () => {
        const wrapper = mount(currentComponent)
        expect(wrapper.find(componentClasses).classes()).toBeTruthy()
        wrapper.unmount()
    })
})
