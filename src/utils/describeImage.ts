interface LanguageModelAvailability {
  available: 'readily' | 'after-download' | 'no';
}

interface LanguageModelSession {
  prompt(input: LanguageModelPromptInput[]): Promise<string>;
  destroy(): void;
}

interface LanguageModelPromptInput {
  role: 'user' | 'assistant' | 'system';
  content: LanguageModelContent[];
}

interface LanguageModelContent {
  type: 'text' | 'image';
  value: string | Blob | File;
}

interface LanguageModelCreateOptions {
  expectedInputs?: Array<{ type: string }>;
  systemPrompt?: string;
}

interface LanguageModelAPI {
  availability(options?: LanguageModelCreateOptions): Promise<LanguageModelAvailability>;
  create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
}

declare global {
  interface Window {
    LanguageModel?: LanguageModelAPI;
    ai?: {
      languageModel?: LanguageModelAPI;
    };
  }
}

const IMAGE_DESCRIPTION_PROMPT = `You are helping describe items found on the street that people are giving away for free. Look at this image and write a brief, helpful description (2-3 sentences max) of what the item is. Focus on: what it is, its apparent condition, and any notable features. Be factual and concise. If there are multiple items of furniture, mention each one. Don't mention that it's on a curb or street.`;

function getLanguageModel(): LanguageModelAPI | null {
  if (typeof window === 'undefined') return null;
  return window.LanguageModel ?? window.ai?.languageModel ?? null;
}

async function checkChromeAIAvailability(): Promise<boolean> {
  try {
    const api = getLanguageModel();
    if (!api) return false;

    const availability = await api.availability({
      expectedInputs: [{ type: 'image' }]
    });

    return availability.available === 'readily' || availability.available === 'after-download';
  } catch {
    return false;
  }
}

async function dataURLToBlob(dataURL: string): Promise<Blob> {
  const response = await fetch(dataURL);
  return response.blob();
}

async function describeImageWithChromeAI(imageData: string): Promise<string> {
  const api = getLanguageModel();

  if (!api) {
    throw new Error('Chrome AI not available');
  }

  const availability = await api.availability({
    expectedInputs: [{ type: 'image' }]
  });

  if (availability.available === 'no') {
    throw new Error('Chrome AI image support not available');
  }

  const session = await api.create({
    expectedInputs: [{ type: 'image' }],
    systemPrompt: IMAGE_DESCRIPTION_PROMPT
  });

  try {
    const imageBlob = await dataURLToBlob(imageData);

    const result = await session.prompt([
      {
        role: 'user',
        content: [
          {
            type: 'text',
            value: 'Describe the furniture or items in this image.'
          },
          {
            type: 'image',
            value: imageBlob
          }
        ]
      }
    ]);

    return result.trim();
  } finally {
    session.destroy();
  }
}

export interface AIDescriptionResult {
  tag: string;
  description: string;
}

async function callServer(imageData: string): Promise<AIDescriptionResult | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/describe-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageData }),
  });

  const data = await response.json();

  if (data.success === false) {
    console.warn('[AI Description] Server classification failed:', data.reason);
    return null;
  }

  if (data.tag && data.description && data.tag !== 'item' && data.description !== 'Curbside find') {
    return { tag: data.tag, description: data.description };
  }

  if (data.description && data.description !== 'Curbside find') {
    return { tag: data.tag || 'item', description: data.description };
  }

  return null;
}

export async function describeImage(imageData: string): Promise<AIDescriptionResult> {
  try {
    const result = await callServer(imageData);
    if (result) return result;
  } catch (error) {
    console.error('[AI Description] Server call failed:', error);
  }

  if (await checkChromeAIAvailability()) {
    try {
      const description = await describeImageWithChromeAI(imageData);
      if (description && description.length > 10) {
        return { tag: 'item', description };
      }
    } catch (error) {
      console.warn('[AI Description] Chrome AI failed:', error);
    }
  }

  return { tag: 'item', description: '' };
}
