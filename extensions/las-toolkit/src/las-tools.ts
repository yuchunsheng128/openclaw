import { Type } from "@sinclair/typebox";
import { jsonResult, readStringParam } from "openclaw/plugin-sdk/agent-runtime";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";

const LasSubmitSchema = Type.Object(
  {
    operator_id: Type.String({ description: "The operator ID, e.g. las_asr" }),
    operator_version: Type.String({ description: "The operator version, e.g. v2" }),
    data: Type.Any({ description: "The request payload data specific to the operator" }),
  },
  { additionalProperties: false },
);

export function createLasSubmitTool(api: OpenClawPluginApi) {
  return {
    name: "las_submit",
    label: "LAS Submit Task",
    description: "Submit a task to Volcengine Lake AI Service (LAS)",
    parameters: LasSubmitSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const lasConfig = (api.config as any).las || {};
      const endpoint = lasConfig.endpoint as string | undefined;
      let apiKey = lasConfig.apiKey as string | undefined;

      if (!endpoint || !apiKey) {
        apiKey = process.env.LAS_API_KEY || apiKey;
        if (!endpoint || !apiKey) {
          return jsonResult({
            error: "Missing LAS endpoint or apiKey in config or LAS_API_KEY environment variable.",
          });
        }
      }

      const operatorId = readStringParam(rawParams, "operator_id", { required: true });
      const operatorVersion = readStringParam(rawParams, "operator_version", { required: true });
      const data = rawParams.data;

      const url = `${endpoint.replace(/\/$/, "")}/api/v1/submit`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          body: JSON.stringify({
            operator_id: operatorId,
            operator_version: operatorVersion,
            data,
          }),
        });

        const json = await response.json();
        return jsonResult(json);
      } catch (error: any) {
        return jsonResult({ error: `Failed to submit LAS task: ${error.message}` });
      }
    },
  };
}

const LasPollSchema = Type.Object(
  {
    operator_id: Type.String({ description: "The operator ID, e.g. las_asr" }),
    operator_version: Type.String({ description: "The operator version, e.g. v2" }),
    task_id: Type.String({ description: "The task ID to poll" }),
  },
  { additionalProperties: false },
);

export function createLasPollTool(api: OpenClawPluginApi) {
  return {
    name: "las_poll",
    label: "LAS Poll Task",
    description: "Poll the status and result of a task in Volcengine Lake AI Service (LAS)",
    parameters: LasPollSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const lasConfig = (api.config as any).las || {};
      const endpoint = lasConfig.endpoint as string | undefined;
      let apiKey = lasConfig.apiKey as string | undefined;

      if (!endpoint || !apiKey) {
        apiKey = process.env.LAS_API_KEY || apiKey;
        if (!endpoint || !apiKey) {
          return jsonResult({
            error: "Missing LAS endpoint or apiKey in config or LAS_API_KEY environment variable.",
          });
        }
      }

      const operatorId = readStringParam(rawParams, "operator_id", { required: true });
      const operatorVersion = readStringParam(rawParams, "operator_version", { required: true });
      const taskId = readStringParam(rawParams, "task_id", { required: true });

      const url = `${endpoint.replace(/\/$/, "")}/api/v1/poll`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: apiKey,
          },
          body: JSON.stringify({
            operator_id: operatorId,
            operator_version: operatorVersion,
            task_id: taskId,
          }),
        });

        const json = await response.json();
        return jsonResult(json);
      } catch (error: any) {
        return jsonResult({ error: `Failed to poll LAS task: ${error.message}` });
      }
    },
  };
}

const LasGenericRequestSchema = Type.Object(
  {
    path: Type.String({ description: "The API path, e.g. /api/v1/embeddings/multimodal" }),
    body: Type.Any({ description: "The JSON body for the request" }),
    use_bearer: Type.Optional(
      Type.Boolean({ description: "Whether to prefix Authorization with 'Bearer '" }),
    ),
  },
  { additionalProperties: false },
);

export function createLasGenericRequestTool(api: OpenClawPluginApi) {
  return {
    name: "las_generic_request",
    label: "LAS Generic Request",
    description: "Make a generic POST request to Volcengine Lake AI Service (LAS) API",
    parameters: LasGenericRequestSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const lasConfig = (api.config as any).las || {};
      const endpoint = lasConfig.endpoint as string | undefined;
      let apiKey = lasConfig.apiKey as string | undefined;

      if (!endpoint || !apiKey) {
        apiKey = process.env.LAS_API_KEY || apiKey;
        if (!endpoint || !apiKey) {
          return jsonResult({
            error: "Missing LAS endpoint or apiKey in config or LAS_API_KEY environment variable.",
          });
        }
      }

      const path = readStringParam(rawParams, "path", { required: true });
      const body = rawParams.body;
      const useBearer = rawParams.use_bearer === true;

      const url = `${endpoint.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
      const authHeader = useBearer ? `Bearer ${apiKey}` : apiKey;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(body),
        });

        const json = await response.json();
        return jsonResult(json);
      } catch (error: any) {
        return jsonResult({ error: `Failed to make LAS request: ${error.message}` });
      }
    },
  };
}
