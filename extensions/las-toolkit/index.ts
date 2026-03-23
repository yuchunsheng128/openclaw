import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { createLasSubmitTool, createLasPollTool, createLasGenericRequestTool } from "./src/las-tools.js";

export default definePluginEntry({
  id: "las-toolkit",
  name: "LAS Toolkit Plugin",
  description: "Bundled LAS toolkit plugin",
  register(api) {
    api.registerTool(createLasSubmitTool(api) as any);
    api.registerTool(createLasPollTool(api) as any);
    api.registerTool(createLasGenericRequestTool(api) as any);
  },
});
