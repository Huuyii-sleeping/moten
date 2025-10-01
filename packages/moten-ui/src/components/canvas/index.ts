import { type Component } from "vue";
import component from "./index.vue";
import { withInstall } from "@/utils/components";
export default withInstall(component as Component);
