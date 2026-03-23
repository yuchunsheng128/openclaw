---
name: las-apis
description: |
  Documentation on how to call Volcengine Lake AI Service (LAS) operators. This skill outlines all available `las_submit` data structures and parameters.
---

# LAS Toolkit Operator API Reference

This skill details how to call various operators using the `las_submit` tool. All calls should use the tool `las_submit` and optionally poll for results using `las_poll` if the response indicates it's an async task.

## Common Parameters for `las_submit`

- **operator_id**: The ID of the operator.
- **operator_version**: The version of the operator.
- **data**: A JSON object containing the input data and configuration for the specific operator.

## Important Note on Input URLs

All input URLs across all operators support both public `http(s)://` endpoints and `tos://` protocol scheme URLs for internal Volcano Engine TOS access. Always prefer TOS URLs when interacting directly with TOS buckets to bypass public internet constraints.

## Available Operators

### 1. Audio / Speech Recognition (ASR)

- **operator_id**: `las_asr`, `las_asr_bp`, `las_asr_pro`, `las_asr_pro_bp`
- **operator_version**: `v2` (for `las_asr`, `las_asr_bp`), `v1` (for `las_asr_pro`, `las_asr_pro_bp`)
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "audio": {
    "url": "tos://<bucket>/path/to/audio.wav", // or https://...
    "format": "wav" // or mp3, raw, ogg
  },
  "request": {
    "model_name": "bigmodel"
  },
  "resource": "bigasr" // optional for some variants
}
```

### 2. Audio Convert

- **operator_id**: `las_audio_convert`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "audio_url": "tos://.../audio.wav",
  "format": "mp3",
  "output_tos_path": "tos://<bucket>/output/path.mp3"
}
```

### 3. Audio Extract and Split

- **operator_id**: `las_audio_extract_and_split`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "video_url": "tos://.../video.mp4",
  "output_tos_dir": "tos://<bucket>/output_dir/"
}
```

### 4. Bare Image Text Embedding

- **Execution Mode**: **Sync**
- **Generic Request Tool (`las_generic_request`)** is required since this uses a specific embedding endpoint: `/api/v1/embeddings/multimodal`
- **Body Structure**:

```json
{
  "model": "doubao-embedding-vision-250615",
  "encoding_format": "float",
  "input": [
    {
      "type": "image_url",
      "image_url": {
        "url": "tos://.../image.jpeg"
      }
    },
    {
      "type": "text",
      "text": "What's in the image?"
    }
  ]
}
```

### 5. Image Resample

- **operator_id**: `las_image_resample`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "image_url": "tos://.../image.jpg",
  "output_tos_path": "tos://<bucket>/output/path.jpg",
  "width": 1024,
  "height": 1024
}
```

### 6. Long Video Understand

- **operator_id**: `las_long_video_understand`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "video_url": "tos://.../video.mp4",
  "prompt": "Analyze this video and provide a summary.",
  "model": "doubao-video-understanding"
}
```

### 7. PDF Parse (Doubao)

- **operator_id**: `las_pdf_parse_doubao`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "pdf_url": "tos://.../document.pdf",
  "output_tos_path": "tos://<bucket>/output/document.json"
}
```

### 8. Seed (Video Generation Models)

Includes `las_seed_1_8`, `las_seed_2_0`, `las_seedance`, `las_seedream`

- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure (example for text2video)**:

```json
{
  "prompt": "A beautiful sunset over the mountains",
  "output_tos_path": "tos://<bucket>/output/video.mp4",
  "width": 1280,
  "height": 720
}
```

### 9. Video Edit

- **operator_id**: `las_video_edit`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "video_url": "tos://.../video.mp4",
  "task_description": "Extract clips with the boy wearing a hat",
  "output_tos_path": "tos://<bucket>/output/edited_video.mp4",
  "mode": "detail"
}
```

### 10. Video Inpaint (Watermark Removal)

- **operator_id**: `las_video_inpaint`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "video_url": "tos://.../video.mp4",
  "output_tos_path": "tos://<bucket>/output/inpaint_video.mp4",
  "targets": ["watermark", "subtitle"]
}
```

### 11. Video Resize

- **operator_id**: `las_video_resize`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "video_path": "tos://.../input_video.mp4",
  "output_tos_dir": "tos://<bucket>/output_dir/",
  "output_file_name": "demo1.mp4",
  "min_width": "890",
  "max_width": "890",
  "min_height": "890",
  "max_height": "890"
}
```

### 12. VLM Video

- **operator_id**: `las_vlm_video`
- **operator_version**: `v1`
- **Execution Mode**: **Async** (Use `las_submit`, wait for `task_id`, then loop `las_poll`)
- **data Structure**:

```json
{
  "model_name": "doubao-seed-1.6",
  "messages": [
    {
      "content": [
        {
          "video_url": {
            "url": "tos://.../eating_56.mp4"
          },
          "type": "video_url"
        },
        {
          "text": "Analyze the video content",
          "type": "text"
        }
      ]
    }
  ]
}
```

## Workflows

**Synchronous Endpoints:**
Some endpoints return the data immediately (like generic embeddings request). Check the API response for `data` directly.

**Asynchronous Endpoints (Submit/Poll Mechanism):**
Most generation, conversion, and complex extraction operators return a Task ID.

1. Submit task using `las_submit`
2. Extract `"task_id"` from `"metadata"` object in response
   ```json
   {
     "metadata": {
       "task_id": "xxxxx123ef24ea40546c-las-...",
       "task_status": "ACCEPTED", // or PENDING
       ...
     }
   }
   ```
3. Use `las_poll` with the same `operator_id`, `operator_version`, and the `task_id` returned above.
4. Continue polling (with a reasonable interval, e.g., 5-10 seconds) until `task_status` is `"COMPLETED"`, `"FAILED"`, or `"CANCELLED"`.
5. Retrieve the `data` containing output TOS URLs or direct JSON text from the completed polling response.

_Note: For all TOS outputs, make sure you configure your LAS service to have write permissions to your target bucket/directory in TOS._
