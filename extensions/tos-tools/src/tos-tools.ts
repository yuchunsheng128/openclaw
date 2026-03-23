import * as fs from "fs";
import * as path from "path";
import { Type } from "@sinclair/typebox";
import { TosClient } from "@volcengine/tos-sdk";
import { jsonResult, readStringParam, readNumberParam } from "openclaw/plugin-sdk/agent-runtime";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";

function getTosClient(api: OpenClawPluginApi) {
  const tosConfig = (api.config as any).tos || {};
  const endpoint = (tosConfig.endpoint as string | undefined) || process.env.TOS_ENDPOINT;
  const region = (tosConfig.region as string | undefined) || process.env.TOS_REGION || "cn-beijing";
  const accessKeyId =
    (tosConfig.accessKeyId as string | undefined) ||
    process.env.VOLCENGINE_ACCESS_KEY_ID ||
    process.env.TOS_ACCESS_KEY;
  const secretAccessKey =
    (tosConfig.secretAccessKey as string | undefined) ||
    process.env.VOLCENGINE_SECRET_ACCESS_KEY ||
    process.env.TOS_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing TOS credentials or endpoint in config/environment");
  }

  // tos-sdk might require endpoint without https:// if using region, or full endpoint.
  return new TosClient({
    accessKeyId,
    accessKeySecret: secretAccessKey, // NOTE: tos-sdk uses accessKeySecret
    region,
    endpoint,
  });
}

const TosListObjectsSchema = Type.Object(
  {
    bucket: Type.String({ description: "Bucket name" }),
    prefix: Type.Optional(Type.String({ description: "Prefix to filter objects" })),
    max_keys: Type.Optional(Type.Number({ description: "Maximum number of keys to return" })),
  },
  { additionalProperties: false },
);

export function createTosListObjectsTool(api: OpenClawPluginApi) {
  return {
    name: "tos_list_objects",
    label: "TOS List Objects",
    description: "List objects in a Volcengine TOS bucket",
    parameters: TosListObjectsSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const client = getTosClient(api);
        const bucket = readStringParam(rawParams, "bucket", { required: true });
        const prefix = readStringParam(rawParams, "prefix");
        const maxKeys = readNumberParam(rawParams, "max_keys");

        const response = await client.listObjects({
          bucket,
          prefix,
          maxKeys: maxKeys || 100,
        });

        const items =
          response.data.Contents?.map((item) => ({
            key: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
          })) || [];

        return jsonResult({
          items,
          isTruncated: response.data.IsTruncated,
          nextContinuationToken: response.data.NextContinuationToken,
        });
      } catch (error: any) {
        return jsonResult({ error: `Failed to list TOS objects: ${error.message}` });
      }
    },
  };
}

const TosPutObjectSchema = Type.Object(
  {
    bucket: Type.String({ description: "Bucket name" }),
    key: Type.String({ description: "Object key" }),
    file_path: Type.String({ description: "Local file path to upload" }),
    content_type: Type.Optional(Type.String({ description: "Content type of the object" })),
  },
  { additionalProperties: false },
);

export function createTosPutObjectTool(api: OpenClawPluginApi) {
  return {
    name: "tos_put_object",
    label: "TOS Put Object",
    description: "Upload a local file to a Volcengine TOS bucket",
    parameters: TosPutObjectSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const client = getTosClient(api);
        const bucket = readStringParam(rawParams, "bucket", { required: true });
        const key = readStringParam(rawParams, "key", { required: true });
        const filePath = readStringParam(rawParams, "file_path", { required: true });
        // const contentType = readStringParam(rawParams, "content_type");

        if (!fs.existsSync(filePath)) {
          return jsonResult({ error: `File not found: ${filePath}` });
        }

        await client.putObjectFromFile({
          bucket,
          key,
          filePath,
        });

        return jsonResult({ success: true, key, bucket });
      } catch (error: any) {
        return jsonResult({ error: `Failed to put TOS object: ${error.message}` });
      }
    },
  };
}

const TosGetObjectSchema = Type.Object(
  {
    bucket: Type.String({ description: "Bucket name" }),
    key: Type.String({ description: "Object key" }),
    download_path: Type.String({ description: "Local path to save the downloaded file" }),
  },
  { additionalProperties: false },
);

export function createTosGetObjectTool(api: OpenClawPluginApi) {
  return {
    name: "tos_get_object",
    label: "TOS Get Object",
    description: "Download an object from a Volcengine TOS bucket to a local file",
    parameters: TosGetObjectSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const client = getTosClient(api);
        const bucket = readStringParam(rawParams, "bucket", { required: true });
        const key = readStringParam(rawParams, "key", { required: true });
        const downloadPath = readStringParam(rawParams, "download_path", { required: true });

        const dir = path.dirname(downloadPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await client.getObjectToFile({
          bucket,
          key,
          filePath: downloadPath,
        });

        return jsonResult({ success: true, downloadPath });
      } catch (error: any) {
        return jsonResult({ error: `Failed to get TOS object: ${error.message}` });
      }
    },
  };
}

const TosPresignedUrlSchema = Type.Object(
  {
    bucket: Type.String({ description: "Bucket name" }),
    key: Type.String({ description: "Object key" }),
    expires_in: Type.Optional(
      Type.Number({ description: "Expiration time in seconds (default 3600)" }),
    ),
  },
  { additionalProperties: false },
);

export function createTosPresignedUrlTool(api: OpenClawPluginApi) {
  return {
    name: "tos_presigned_url",
    label: "TOS Presigned URL",
    description: "Generate a presigned GET URL for a Volcengine TOS object",
    parameters: TosPresignedUrlSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const client = getTosClient(api);
        const bucket = readStringParam(rawParams, "bucket", { required: true });
        const key = readStringParam(rawParams, "key", { required: true });
        const expiresIn = readNumberParam(rawParams, "expires_in") || 3600;

        const url = client.getPreSignedUrl({
          bucket,
          key,
          expires: expiresIn,
        });

        return jsonResult({ url });
      } catch (error: any) {
        return jsonResult({ error: `Failed to generate presigned URL: ${error.message}` });
      }
    },
  };
}
