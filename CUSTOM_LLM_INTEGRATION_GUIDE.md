# 🤖 Custom LLM Integration Guide

## Overview

This guide explains how to integrate custom LLMs (Large Language Models) into your AI Social Media Replier platform. The system currently supports OpenAI, Google AI, Mistral, and Anthropic, but you can easily add custom models.

## 🏗️ Current Architecture

Your AI system uses a modular approach with these key components:

1. **AI Model Configuration** (`src/utils/schema/settings.ts`)
2. **AI Instance Factory** (`src/server/utils/index.ts`)
3. **Generation Router** (`src/server/api/routers/generations.ts`)
4. **Settings Management** (`src/server/api/routers/settings.ts`)

## 🚀 Integration Steps

### Step 1: Add Custom Model to Configuration

First, add your custom model to the `AI_MODEL_LIST` in `src/utils/schema/settings.ts`:

```typescript
export const AI_MODEL_LIST = [
  // ... existing models
  {
    key: "custom-llm-1",
    name: "Custom LLM v1",
    provider: "custom",
    endpoint: "https://your-custom-llm-api.com/v1/chat/completions", // Optional
    apiKey: "your-api-key", // Optional
  },
  {
    key: "local-ollama-llama2",
    name: "Local Ollama Llama2",
    provider: "ollama",
    endpoint: "http://localhost:11434/api/generate",
  },
  {
    key: "huggingface-model",
    name: "Hugging Face Model",
    provider: "huggingface",
    endpoint: "https://api-inference.huggingface.co/models/your-model",
  },
] as const;
```

### Step 2: Create Custom AI Provider

Create a new file `src/server/utils/custom-ai-providers.ts`:

```typescript
import { createOpenAI } from '@ai-sdk/openai';

// Custom LLM Provider Interface
interface CustomAIProvider {
  generateText(prompt: string, options?: any): Promise<string>;
  generateStream(prompt: string, options?: any): AsyncIterable<string>;
}

// Ollama Provider
export class OllamaProvider implements CustomAIProvider {
  private endpoint: string;
  private model: string;

  constructor(endpoint: string, model: string) {
    this.endpoint = endpoint;
    this.model = model;
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(`${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  async *generateStream(prompt: string, options: any = {}): AsyncIterable<string> {
    const response = await fetch(`${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: true,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            yield data.response;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
  }
}

// Hugging Face Provider
export class HuggingFaceProvider implements CustomAIProvider {
  private endpoint: string;
  private apiKey: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens || 150,
          temperature: options.temperature || 0.7,
          ...options,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      return data[0].generated_text || data[0].text || '';
    }
    
    return data.generated_text || data.text || '';
  }

  async *generateStream(prompt: string, options: any = {}): AsyncIterable<string> {
    // Hugging Face doesn't support streaming by default
    // You might need to use a different approach or service
    const text = await this.generateText(prompt, options);
    yield text;
  }
}

// Generic Custom API Provider
export class CustomAPIProvider implements CustomAIProvider {
  private endpoint: string;
  private apiKey?: string;
  private headers: Record<string, string>;

  constructor(endpoint: string, apiKey?: string, customHeaders: Record<string, string> = {}) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    
    if (apiKey) {
      this.headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        prompt: prompt,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.text || data.content || '';
  }

  async *generateStream(prompt: string, options: any = {}): AsyncIterable<string> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        prompt: prompt,
        stream: true,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response || data.text || data.content) {
            yield data.response || data.text || data.content;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
  }
}
```

### Step 3: Update AI Instance Factory

Modify `src/server/utils/index.ts` to support custom providers:

```typescript
import { OllamaProvider, HuggingFaceProvider, CustomAPIProvider } from './custom-ai-providers';

export const getAIInstance = async ({
  apiKey,
  enabledModels,
}: AIInstanceConfig) => {
  const selectedModel = AI_MODEL_LIST.find((m) =>
    enabledModels.includes(m.key),
  );

  if (!selectedModel) {
    throw new Error("No AI model selected");
  }

  switch (selectedModel.provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return {
        instance: openai(selectedModel.key),
        model: selectedModel,
      };
    }
    case "mistralai": {
      const mistralai = createMistral({ apiKey });
      return {
        instance: mistralai(selectedModel.key),
        model: selectedModel,
      };
    }
    case "google": {
      const googleai = createGoogleGenerativeAI({ apiKey });
      return {
        instance: googleai(selectedModel.key),
        model: selectedModel,
      };
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return {
        instance: anthropic(selectedModel.key),
        model: selectedModel,
      };
    }
    case "ollama": {
      const ollama = new OllamaProvider(
        selectedModel.endpoint || 'http://localhost:11434/api/generate',
        selectedModel.key
      );
      return {
        instance: ollama,
        model: selectedModel,
      };
    }
    case "huggingface": {
      const hf = new HuggingFaceProvider(
        selectedModel.endpoint || '',
        selectedModel.apiKey || apiKey
      );
      return {
        instance: hf,
        model: selectedModel,
      };
    }
    case "custom": {
      const custom = new CustomAPIProvider(
        selectedModel.endpoint || '',
        selectedModel.apiKey || apiKey
      );
      return {
        instance: custom,
        model: selectedModel,
      };
    }
    default:
      const provider = (selectedModel as { provider: string }).provider;
      throw new Error(`Unknown provider: ${provider}`);
  }
};
```

### Step 4: Update Generation Router

Modify the generation functions in `src/server/api/routers/generations.ts` to handle custom providers:

```typescript
// Add this helper function to handle different AI provider types
async function generateWithCustomProvider(
  instance: any,
  prompt: string,
  options: any = {}
): Promise<string> {
  // Check if it's a custom provider
  if (typeof instance.generateText === 'function') {
    return await instance.generateText(prompt, options);
  }
  
  // Fallback to standard AI SDK
  const result = await instance.generateText(prompt, options);
  return result.text;
}

// Update the generateContextualResponse function
async function generateContextualResponse({
  instance,
  input,
  contextAnalysis,
  customPrompt,
}: {
  instance: any;
  input: any;
  contextAnalysis: any;
  customPrompt: string;
}) {
  const prompt = buildEnhancedPrompt(input, contextAnalysis, customPrompt);
  
  try {
    const response = await generateWithCustomProvider(instance, prompt, {
      temperature: 0.7,
      maxTokens: 150,
    });
    
    return {
      text: response,
      confidence: 0.8,
    };
  } catch (error) {
    console.error('Custom provider error:', error);
    throw new Error('Failed to generate response with custom provider');
  }
}
```

### Step 5: Add Environment Variables

Add your custom LLM configuration to your environment variables:

```bash
# .env.local
# Custom LLM Configuration
CUSTOM_LLM_API_KEY=your-api-key
CUSTOM_LLM_ENDPOINT=https://your-custom-llm-api.com/v1/chat/completions
OLLAMA_ENDPOINT=http://localhost:11434
HUGGINGFACE_API_KEY=your-hf-api-key
```

### Step 6: Update Settings Schema

Extend the settings schema to support custom models:

```typescript
// In src/utils/schema/settings.ts
export const customAISettingsSchema = z.object({
  customModels: z.array(z.object({
    key: z.string(),
    name: z.string(),
    provider: z.enum(['custom', 'ollama', 'huggingface']),
    endpoint: z.string().optional(),
    apiKey: z.string().optional(),
    enabled: z.boolean().default(false),
  })).default([]),
});

export const aiSettingsSchema = z.object({
  // ... existing fields
  customModels: customAISettingsSchema.shape.customModels,
});
```

## 🛠️ Popular Custom LLM Options

### 1. **Ollama (Local)**
- **Best for**: Privacy, cost control, offline use
- **Setup**: `ollama run llama2`
- **Pros**: Free, private, customizable
- **Cons**: Requires local hardware, limited models

### 2. **Hugging Face Inference API**
- **Best for**: Open source models, research
- **Setup**: Get API key from Hugging Face
- **Pros**: Many models, good for experimentation
- **Cons**: Rate limits, variable performance

### 3. **Replicate**
- **Best for**: Easy deployment of open source models
- **Setup**: Create account, get API key
- **Pros**: Easy to use, many models
- **Cons**: Pay-per-use, can be expensive

### 4. **Together AI**
- **Best for**: High-performance open source models
- **Setup**: Get API key from Together AI
- **Pros**: Fast, many models, good pricing
- **Cons**: Newer service, limited support

### 5. **Groq**
- **Best for**: Ultra-fast inference
- **Setup**: Get API key from Groq
- **Pros**: Very fast, good for real-time apps
- **Cons**: Limited model selection

## 🔧 Testing Your Custom LLM

Create a test script `scripts/test-custom-llm.ts`:

```typescript
import { getAIInstance } from '../src/server/utils/index';

async function testCustomLLM() {
  try {
    const { instance, model } = await getAIInstance({
      apiKey: process.env.CUSTOM_LLM_API_KEY || '',
      enabledModels: ['your-custom-model-key'],
    });

    const testPrompt = "Generate a social media post about AI technology";
    const response = await instance.generateText(testPrompt);
    
    console.log('Model:', model.name);
    console.log('Response:', response);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCustomLLM();
```

## 📊 Monitoring & Analytics

Add monitoring for custom LLMs:

```typescript
// Add to your generation router
const customLLMMetrics = {
  responseTime: Date.now() - startTime,
  model: selectedModel.key,
  provider: selectedModel.provider,
  success: true,
  error: null,
};

// Log metrics
console.log('Custom LLM Metrics:', customLLMMetrics);
```

## 🚀 Deployment Considerations

### Environment Setup
1. **Local Development**: Use Ollama for testing
2. **Staging**: Use Hugging Face or Replicate
3. **Production**: Use reliable providers like Together AI or custom infrastructure

### Scaling
- Implement connection pooling for custom APIs
- Add retry logic with exponential backoff
- Cache responses when appropriate
- Monitor API rate limits

### Security
- Store API keys securely
- Implement request validation
- Add rate limiting
- Log all API calls for auditing

## 🎯 Next Steps

1. **Choose your custom LLM provider** based on your needs
2. **Implement the integration** following the steps above
3. **Test thoroughly** with different content types
4. **Monitor performance** and adjust as needed
5. **Add to your TODO.md** for tracking progress

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference)
- [Together AI Documentation](https://docs.together.ai/)
- [Replicate Documentation](https://replicate.com/docs)

---

*This guide provides a foundation for integrating custom LLMs. Adapt the code based on your specific requirements and chosen providers.*
