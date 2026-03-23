import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import {
  createTosListObjectsTool,
  createTosPutObjectTool,
  createTosGetObjectTool,
  createTosPresignedUrlTool,
} from "./src/tos-tools.js";

export default definePluginEntry({
  id: "tos-tools",
  name: "TOS Tools Plugin",
  description: "Bundled Volcengine TOS toolkit plugin",
  register(api) {
    api.registerTool(createTosListObjectsTool(api) as any);
    api.registerTool(createTosPutObjectTool(api) as any);
    api.registerTool(createTosGetObjectTool(api) as any);
    api.registerTool(createTosPresignedUrlTool(api) as any);
  },
});
