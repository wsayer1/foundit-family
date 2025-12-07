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

async function getLanguageModel(): Promise<LanguageModelAPI | null> {
  if (typeof window === 'undefined') return null;

  if (window.LanguageModel) {
    return window.LanguageModel;
  }

  if (window.ai?.languageModel) {
    return window.ai.languageModel;
  }

  return null;
}

export async function checkChromeAIAvailability(): Promise<boolean> {
  try {
    const api = await getLanguageModel();
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

export async function describeImageWithChromeAI(imageData: string): Promise<string> {
  const api = await getLanguageModel();

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

export async function describeImageWithFallback(
  imageData: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string> {
  const chromeAIAvailable = await checkChromeAIAvailability();
  console.log('[AI Description] Chrome AI available:', chromeAIAvailable);

  if (chromeAIAvailable) {
    try {
      console.log('[AI Description] Attempting Chrome AI...');
      const description = await describeImageWithChromeAI(imageData);
      if (description && description.length > 0) {
        console.log('[AI Description] Chrome AI success:', description);
        return description;
      }
    } catch (error) {
      console.log('[AI Description] Chrome AI failed, falling back to server:', error);
    }
  }

  console.log('[AI Description] Using server fallback...');
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/describe-image`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('[AI Description] Server response:', data);
      if (data.debug) {
        console.warn('[AI Description] Server debug info:', data.debug, data.message || data.error);
      }
      return data.description || 'Curbside find';
    } else {
      console.error('[AI Description] Server error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('[AI Description] Server fallback failed:', error);
  }

  return 'Curbside find';
}
