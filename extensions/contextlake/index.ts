import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import {
  createLasSubmitTool,
  createLasPollTool,
  createLasGenericRequestTool,
} from "./src/las-tools.js";
import {
  createTosListObjectsTool,
  createTosPutObjectTool,
  createTosGetObjectTool,
  createTosPresignedUrlTool,
} from "./src/tos-tools.js";

export default definePluginEntry({
  id: "contextlake",
  name: "ContextLake Toolkit Plugin",
  description: "Bundled ContextLake (Volcengine LAS + TOS) toolkit plugin",
  register(api) {
    // LAS Tools
    api.registerTool(createLasSubmitTool(api) as any);
    api.registerTool(createLasPollTool(api) as any);
    api.registerTool(createLasGenericRequestTool(api) as any);

    // TOS Tools
    api.registerTool(createTosListObjectsTool(api) as any);
    api.registerTool(createTosPutObjectTool(api) as any);
    api.registerTool(createTosGetObjectTool(api) as any);
    api.registerTool(createTosPresignedUrlTool(api) as any);
  },
});
