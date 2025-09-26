import Type, { type TSchema } from "typebox";
import type { App, Component, Plugin } from "vue";

/**
 * schema 加上视口操作
 * @param params
 * @returns
 */
export const schemaAllViewport = <T extends TSchema>(params: T) => {
  return Type.Object({
    desktop: params,
    mobile: params,
  });
};

/**
 * 组件安装 组件加上install方法
 * @param component
 * @returns
 */
export const withInstall = (component: Component) => {
  (component as Component & Plugin).install = function (app: App) {
    const { name } = component;
    if (name) app.component(name, component);
  };
  return component;
};

/**
 * 返回componentname classess 创建命名名称和公共的classes 创建命名空间
 * @param prefix
 * @returns
 */
export const createNameSpaceFn = (prefix: string) => {
  return (name: string) => {
    const componentName = `${prefix}-${name}`;
    const createBEM = (suffix?: string) => {
      if (!suffix) return componentName;
      return suffix.startsWith("--")
        ? `${componentName}${suffix}`
        : `${componentName}__${suffix}`;
    };
    return {
      name: componentName,
      n: createBEM,
    };
  };
};

export const createNameSpace = createNameSpaceFn("mo");
