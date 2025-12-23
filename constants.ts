import { ReferenceDoc, DocCategory } from './types';

/**
 * THE REFERENCE DATABASE
 * This constant serves as the quantization source and the configuration for the app.
 * It contains verified patterns for the @google/genai SDK.
 */
export const KNOWLEDGE_BASE: ReferenceDoc[] = [
  {
    id: 'client-initialization',
    category: DocCategory.SETUP,
    title: 'Client Initialization',
    description: 'Instantiate the GoogleGenAI client.',
    modelTarget: 'N/A',
    explanation: 'The GoogleGenAI client must be initialized with a single configuration object containing the API key. The key must be retrieved strictly from the environment variable process.env.API_KEY. Do not pass the key as a plain string argument.',
    codeSnippet: `import { GoogleGenAI } from "@google/genai";\n\nconst ai = new GoogleGenAI({ apiKey: process.env.API_KEY });`,
    launch: {
      entry_point: 'new GoogleGenAI',
      required_params: ['apiKey'],
      optional_params: [],
      execution_pattern: 'SETUP',
      output_type: 'GoogleGenAI'
    }
  },
  {
    id: 'system-instruction',
    category: DocCategory.SETUP,
    title: 'System Instructions',
    description: 'Define model persona and behavior.',
    modelTarget: 'ALL',
    explanation: 'System instructions should be passed within the request config object under the key `systemInstruction`. This sets the global context, tone, and constraints for the model generation.',
    codeSnippet: `const response = await ai.models.generateContent({\n  model: 'gemini-3-flash-preview',\n  contents: 'Explain quantum mechanics.',\n  config: {\n    systemInstruction: 'You are a theoretical physicist explaining to a layman.',\n  }\n});`,
    launch: {
      entry_point: 'config.systemInstruction',
      required_params: ['systemInstruction'],
      optional_params: [],
      execution_pattern: 'SETUP',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'text-generation',
    category: DocCategory.CORE,
    title: 'Text Generation',
    description: 'Generate text from a text prompt.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'Use `ai.models.generateContent` for text-only tasks. The response object directly exposes the generated text via the `.text` getter property. Do not use deprecated `response.text()` methods.',
    codeSnippet: `const response = await ai.models.generateContent({\n  model: 'gemini-3-flash-preview',\n  contents: 'Write a haiku about code.',\n});\n\nconsole.log(response.text);`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['model', 'contents'],
      optional_params: ['config'],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'chat-session',
    category: DocCategory.CORE,
    title: 'Chat Session',
    description: 'Stateful multi-turn conversation.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'Initialize a chat session using `ai.chats.create`. Use `chat.sendMessage` for subsequent interactions. The session object maintains the conversation history automatically. Do not manually append history to `contents`.',
    codeSnippet: `const chat = ai.chats.create({\n  model: 'gemini-3-flash-preview',\n  config: { systemInstruction: 'You are a helpful assistant.' }\n});\n\n// Turn 1\nconst res1 = await chat.sendMessage({ message: 'Hello!' });\nconsole.log(res1.text);\n\n// Turn 2\nconst res2 = await chat.sendMessage({ message: 'What did I just say?' });\nconsole.log(res2.text);`,
    launch: {
      entry_point: 'ai.chats.create',
      required_params: ['model'],
      optional_params: ['config', 'history'],
      execution_pattern: 'SYNC',
      output_type: 'Chat'
    }
  },
  {
    id: 'streaming-content',
    category: DocCategory.CORE,
    title: 'Streaming Responses',
    description: 'Stream response chunks in real-time.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'Use `ai.models.generateContentStream` to receive an asynchronous iterable. Iterate over the stream using `for await...of`. Access the `.text` property on each chunk immediately.',
    codeSnippet: `const stream = await ai.models.generateContentStream({\n  model: 'gemini-3-flash-preview',\n  contents: 'Tell me a long story.',\n});\n\nfor await (const chunk of stream) {\n  process.stdout.write(chunk.text);\n}`,
    launch: {
      entry_point: 'ai.models.generateContentStream',
      required_params: ['model', 'contents'],
      optional_params: ['config'],
      execution_pattern: 'STREAM',
      output_type: 'AsyncIterable<GenerateContentResponse>'
    }
  },
  {
    id: 'multimodal-input',
    category: DocCategory.MULTIMODAL,
    title: 'Multimodal Input (Vision)',
    description: 'Generate text from image and text inputs.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'Pass image data as an `inlineData` object within the `parts` array. The `mimeType` must be a valid IANA image type (e.g., image/png). The `data` field must be a base64-encoded string.',
    codeSnippet: `const response = await ai.models.generateContent({\n  model: 'gemini-3-flash-preview',\n  contents: {\n    parts: [\n      {\n        inlineData: {\n          mimeType: 'image/jpeg',\n          data: base64ImageString\n        }\n      },\n      { text: 'Describe the contents of this image.' }\n    ]\n  }\n});\nconsole.log(response.text);`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['model', 'contents.parts'],
      optional_params: ['config'],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'image-generation',
    category: DocCategory.MULTIMODAL,
    title: 'Image Generation',
    description: 'Generate images from text descriptions.',
    modelTarget: 'gemini-2.5-flash-image',
    explanation: 'Use the `gemini-2.5-flash-image` model for image generation. The generated image bytes are returned in the `inlineData` of the response parts. Configuration options include `aspectRatio` (e.g., "16:9").',
    codeSnippet: `const response = await ai.models.generateContent({\n  model: 'gemini-2.5-flash-image',\n  contents: {\n    parts: [{ text: 'A cyberpunk city with neon lights.' }],\n  },\n  config: {\n    imageConfig: { aspectRatio: '16:9' }\n  }\n});\n\nfor (const part of response.candidates[0].content.parts) {\n  if (part.inlineData) {\n    const uri = \`data:image/png;base64,\${part.inlineData.data}\`;\n    console.log(uri);\n  }\n}`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['model', 'contents'],
      optional_params: ['config.imageConfig'],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'audio-input',
    category: DocCategory.MULTIMODAL,
    title: 'Audio Analysis',
    description: 'Analyze audio files with text prompts.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'Pass audio data as `inlineData` with a supported MIME type (e.g., audio/mp3). The model can transcribe, summarize, or answer questions based on the audio content.',
    codeSnippet: `const response = await ai.models.generateContent({\n  model: 'gemini-3-flash-preview',\n  contents: {\n    parts: [\n      {\n        inlineData: {\n          mimeType: 'audio/mp3',\n          data: base64AudioString\n        }\n      },\n      { text: 'Transcribe this audio clip.' }\n    ]\n  }\n});\nconsole.log(response.text);`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['model', 'contents.parts'],
      optional_params: ['config'],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'text-to-speech',
    category: DocCategory.MULTIMODAL,
    title: 'Text-to-Speech',
    description: 'Generate audio speech from text.',
    modelTarget: 'gemini-2.5-flash-preview-tts',
    explanation: 'Configure `responseModalities` to `[Modality.AUDIO]`. Use `speechConfig` to select a prebuilt voice (e.g., Kore, Puck, Charon). The output is raw PCM audio data in `inlineData`.',
    codeSnippet: `import { Modality } from "@google/genai";\n\nconst response = await ai.models.generateContent({\n  model: 'gemini-2.5-flash-preview-tts',\n  contents: 'Hello, world!',\n  config: {\n    responseModalities: [Modality.AUDIO],\n    speechConfig: {\n      voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }\n    }\n  }\n});`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['model', 'contents', 'config.responseModalities'],
      optional_params: ['config.speechConfig'],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'video-generation',
    category: DocCategory.MULTIMODAL,
    title: 'Video Generation (Veo)',
    description: 'Generate video content from prompts.',
    modelTarget: 'veo-3.1-fast-generate-preview',
    explanation: 'Video generation is a long-running operation. Use `ai.models.generateVideos` to initiate, and poll `ai.operations.getVideosOperation` until `done` is true. The result contains a download URI.',
    codeSnippet: `let operation = await ai.models.generateVideos({\n  model: 'veo-3.1-fast-generate-preview',\n  prompt: 'A drone shot of a mountain range.',\n  config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }\n});\n\nwhile (!operation.done) {\n  await new Promise(r => setTimeout(r, 5000));\n  operation = await ai.operations.getVideosOperation({ operation });\n}\n\nconst videoUri = operation.response.generatedVideos[0].video.uri;`,
    launch: {
      entry_point: 'ai.models.generateVideos',
      required_params: ['model', 'prompt'],
      optional_params: ['config.resolution', 'config.aspectRatio'],
      execution_pattern: 'LONG_POLLING',
      output_type: 'string'
    }
  },
  {
    id: 'json-schema',
    category: DocCategory.SCHEMAS,
    title: 'JSON Structured Output (Array)',
    description: 'Enforce specific JSON list schemas.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'Set `responseMimeType` to "application/json" and define a `responseSchema` using the `Type` enum. The model output will strictly validate against this schema.',
    codeSnippet: `import { Type } from "@google/genai";\n\nconst response = await ai.models.generateContent({\n  model: 'gemini-3-flash-preview',\n  contents: 'List 5 programming languages.',\n  config: {\n    responseMimeType: 'application/json',\n    responseSchema: {\n      type: Type.ARRAY,\n      items: { type: Type.STRING }\n    }\n  }\n});`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['config.responseMimeType', 'config.responseSchema'],
      optional_params: [],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'json-object-schema',
    category: DocCategory.SCHEMAS,
    title: 'JSON Structured Output (Object)',
    description: 'Enforce complex JSON object schemas.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'For structured object outputs, define a schema with `Type.OBJECT` and a `properties` map. You can nest arrays and other objects within this structure to model complex data types like recipes or profiles.',
    codeSnippet: `import { Type } from "@google/genai";\n\nconst response = await ai.models.generateContent({\n  model: 'gemini-3-flash-preview',\n  contents: 'List a cookie recipe.',\n  config: {\n    responseMimeType: 'application/json',\n    responseSchema: {\n      type: Type.OBJECT,\n      properties: {\n        recipeName: { type: Type.STRING },\n        ingredients: {\n          type: Type.ARRAY,\n          items: { type: Type.STRING }\n        }\n      },\n      required: ['recipeName', 'ingredients']\n    }\n  }\n});`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['config.responseMimeType', 'config.responseSchema'],
      optional_params: [],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'function-calling',
    category: DocCategory.ADVANCED,
    title: 'Function Calling',
    description: 'Model-driven tool execution.',
    modelTarget: 'gemini-3-flash-preview',
    explanation: 'Define `functionDeclarations` in the `tools` config. The model returns `functionCalls` when it intends to invoke a tool. You must execute the logic and return the result using `sendToolResponse` (in Live API) or a new content part.',
    codeSnippet: `import { Type } from "@google/genai";\n\nconst tools = [{ functionDeclarations: [{\n  name: 'get_weather',\n  parameters: {\n    type: Type.OBJECT,\n    properties: { city: { type: Type.STRING } }\n  }\n}]}];\n\nconst response = await ai.models.generateContent({\n  model: 'gemini-3-flash-preview',\n  contents: 'Weather in Paris?',\n  config: { tools }\n});\n\nif (response.functionCalls) {\n  console.log(response.functionCalls[0]);\n}`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['config.tools'],
      optional_params: ['config.toolConfig'],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'search-grounding',
    category: DocCategory.ADVANCED,
    title: 'Google Search Grounding',
    description: 'Ground responses with real-time web data.',
    modelTarget: 'gemini-3-pro-preview',
    explanation: 'Enable the `googleSearch` tool. This allows the model to access the internet. Source URLs and citations are provided in the `groundingMetadata` of the response candidate.',
    codeSnippet: `const response = await ai.models.generateContent({\n  model: 'gemini-3-pro-preview',\n  contents: 'Who won the last World Cup?',\n  config: {\n    tools: [{ googleSearch: {} }]\n  }\n});\n\nconsole.log(response.candidates[0].groundingMetadata.groundingChunks);`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['config.tools.googleSearch'],
      optional_params: [],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  },
  {
    id: 'thinking-budget',
    category: DocCategory.ADVANCED,
    title: 'Thinking Budget',
    description: 'Enable hidden reasoning for complex logic.',
    modelTarget: 'gemini-3-pro-preview',
    explanation: 'Set `thinkingConfig.thinkingBudget` (e.g., 2048) to allow the model to generate internal reasoning tokens before producing the final answer. This significantly improves math and logic performance.',
    codeSnippet: `const response = await ai.models.generateContent({\n  model: 'gemini-3-pro-preview',\n  contents: 'Solve this riddle...',\n  config: {\n    thinkingConfig: { thinkingBudget: 2048 }\n  }\n});`,
    launch: {
      entry_point: 'ai.models.generateContent',
      required_params: ['config.thinkingConfig.thinkingBudget'],
      optional_params: [],
      execution_pattern: 'ASYNC',
      output_type: 'GenerateContentResponse'
    }
  }
];

export const INITIAL_LOG: string = "Knowledge Base loaded. System ready.";