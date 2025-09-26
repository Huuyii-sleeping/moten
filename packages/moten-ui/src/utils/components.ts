import Type, { type TSchema } from "typebox";
import type { App, Component, Plugin } from "vue";

export const schemaAllViewport = <T extends TSchema>(params: T) => {
  return Type.Object({
    desktop: params,
    mobile: params,
  });
};

export const withInstall = (component: Component) => {
  (component as Component & Plugin).install = function (app: App) {
    const { name } = component;
    if (name) app.component(name, component);
  };
  return component;
};
