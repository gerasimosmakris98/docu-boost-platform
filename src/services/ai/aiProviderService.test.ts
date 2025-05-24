// src/services/ai/aiProviderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiProviderService } from './aiProviderService';
import { supabase } from '@/integrations/supabase/client';
import { getSystemPrompt } from '@/services/utils/conversationUtils';
import { ConversationType } from './types'; // Import ConversationType

// Mocking Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    // Mock other Supabase client functionalities if needed by other parts of the service
  },
}));

// Mocking conversationUtils
vi.mock('@/services/utils/conversationUtils', () => ({
  getSystemPrompt: vi.fn(),
}));

// Mock sonner's toast if it becomes an issue, for now, assuming it's not directly called.
// vi.mock('sonner', () => ({
//   toast: {
//     success: vi.fn(),
//     error: vi.fn(),
//     info: vi.fn(),
//     warning: vi.fn(),
//   }
// }));


describe('aiProviderService', () => {
  const mockSupabaseInvoke = supabase.functions.invoke as vi.Mock;
  const mockGetSystemPrompt = getSystemPrompt as vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
  });

  describe('generateResponse', () => {
    const testPrompt = 'User says hi';
    const testConversationType: ConversationType = 'general';

    it('should parse valid JSON response and use dynamic system prompt', async () => {
      mockGetSystemPrompt.mockReturnValue('Test System Prompt.');
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: '{"generatedText": "Hello AI", "sourceUrls": ["link1.com"]}' },
        error: null,
      });

      const result = await aiProviderService.generateResponse(testPrompt, testConversationType);

      expect(mockGetSystemPrompt).toHaveBeenCalledWith(testConversationType);
      expect(mockSupabaseInvoke).toHaveBeenCalledWith(
        'perplexity-ai-response',
        expect.objectContaining({
          body: expect.objectContaining({
            prompt: expect.stringContaining('Test System Prompt.'),
            prompt: expect.stringContaining(testPrompt), // Ensure user prompt is also there
            type: testConversationType,
            maxTokens: 200,
            brief: true,
          }),
        })
      );
      expect(result).toEqual({ generatedText: "Hello AI", sourceUrls: ["link1.com"] });
    });

    it('should handle invalid JSON response (not JSON string)', async () => {
      mockGetSystemPrompt.mockReturnValue('Test System Prompt.');
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: 'This is not JSON.' },
        error: null,
      });

      const result = await aiProviderService.generateResponse(testPrompt, testConversationType);
      expect(result).toEqual({ generatedText: "This is not JSON.", sourceUrls: [] });
    });
    
    it('should handle malformed JSON response (incorrect structure)', async () => {
      mockGetSystemPrompt.mockReturnValue('Test System Prompt.');
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: '{"text": "Malformed JSON", "urls": []}' }, // incorrect keys
        error: null,
      });

      const result = await aiProviderService.generateResponse(testPrompt, testConversationType);
      expect(result).toEqual({ generatedText: "Error: AI response format unexpected.", sourceUrls: [] });
    });

    it('should handle Supabase function call error (error object returned)', async () => {
      mockGetSystemPrompt.mockReturnValue('Test System Prompt.');
      const errorMessage = 'Function invocation failed';
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: errorMessage },
      });

      const result = await aiProviderService.generateResponse(testPrompt, testConversationType);
      // The error message in the implementation is `Failed to generate AI response: ${error.message}`
      // And the actual error thrown by the service is wrapped, so we check the generatedText of the returned object
      expect(result.generatedText).toContain(`Failed to generate AI response: ${errorMessage}`);
      expect(result.sourceUrls).toEqual([]);
    });
    
    it('should handle Supabase function call error (thrown error)', async () => {
      mockGetSystemPrompt.mockReturnValue('Test System Prompt.');
      const errorMessage = 'Network error';
      mockSupabaseInvoke.mockRejectedValueOnce(new Error(errorMessage));

      const result = await aiProviderService.generateResponse(testPrompt, testConversationType);
      expect(result.generatedText).toBe(`I'm having trouble responding right now. Let me know if you'd like some quick tips while I recover.`);
      expect(result.sourceUrls).toEqual([]);
    });

    it('should handle missing generatedText from Supabase function', async () => {
      mockGetSystemPrompt.mockReturnValue('Test System Prompt.');
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: null }, // or undefined
        error: null,
      });

      const result = await aiProviderService.generateResponse(testPrompt, testConversationType);
      // Based on current implementation, this will throw "No response received from AI service"
      // which is caught and returns the generic fallback.
      expect(result.generatedText).toBe(`I'm having trouble responding right now. Let me know if you'd like some quick tips while I recover.`);
      expect(result.sourceUrls).toEqual([]);
    });

     it('should handle AI service error (data.error is present)', async () => {
      mockGetSystemPrompt.mockReturnValue('Test System Prompt.');
      const aiErrorMessage = 'AI service capacity issue';
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { error: true, message: aiErrorMessage, generatedText: null },
        error: null,
      });

      const result = await aiProviderService.generateResponse(testPrompt, testConversationType);
      expect(result.generatedText).toContain(`Failed to generate AI response: ${aiErrorMessage}`);
      expect(result.sourceUrls).toEqual([]);
    });
  });

  describe('analyzeFile', () => {
    const testFileUrl = 'http://example.com/resume.pdf';
    const testFileName = 'resume.pdf';
    const testFileType = 'PDF';

    it('should parse valid JSON response for file analysis', async () => {
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: '{"generatedText": "File analysis complete.", "sourceUrls": ["source1.doc"]}' },
        error: null,
      });

      const result = await aiProviderService.analyzeFile(testFileUrl, testFileName, testFileType);
      
      expect(mockSupabaseInvoke).toHaveBeenCalledWith(
        'perplexity-ai-response',
        expect.objectContaining({
          body: expect.objectContaining({
            prompt: expect.stringContaining(`Analyze this ${testFileType} file: ${testFileName}`),
            type: 'file_analysis',
          }),
        })
      );
      expect(result).toEqual({ generatedText: "File analysis complete.", sourceUrls: ["source1.doc"] });
    });

    it('should handle Supabase function call error for file analysis', async () => {
      const errorMessage = 'File analysis function failed';
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: errorMessage },
      });

      const result = await aiProviderService.analyzeFile(testFileUrl, testFileName, testFileType);
      expect(result.generatedText).toContain(`Failed to analyze file: ${errorMessage}`);
      expect(result.sourceUrls).toEqual([]);
    });
  });

  describe('analyzeUrl', () => {
    const testUrl = 'http://example.com/article.html';
    const testUrlType = 'article';

    it('should parse valid JSON response for URL analysis', async () => {
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: '{"generatedText": "URL analysis successful.", "sourceUrls": []}' },
        error: null,
      });

      const result = await aiProviderService.analyzeUrl(testUrl, testUrlType);

      expect(mockSupabaseInvoke).toHaveBeenCalledWith(
        'perplexity-ai-response',
        expect.objectContaining({
          body: expect.objectContaining({
            prompt: expect.stringContaining(`Analyze this ${testUrlType} URL: ${testUrl}`),
            type: 'url_analysis',
          }),
        })
      );
      expect(result).toEqual({ generatedText: "URL analysis successful.", sourceUrls: [] });
    });

    it('should handle Supabase function call error for URL analysis', async () => {
      const errorMessage = 'URL analysis function failed';
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: errorMessage },
      });

      const result = await aiProviderService.analyzeUrl(testUrl, testUrlType);
      expect(result.generatedText).toContain(`Failed to analyze URL: ${errorMessage}`);
      expect(result.sourceUrls).toEqual([]);
    });

    it('should handle specific URL analysis failure pattern (e.g., "i cannot access this url")', async () => {
      const aiFailureResponse = "I am sorry, but I cannot access this URL.";
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: aiFailureResponse }, // This is a string, not JSON, as per current implementation before parsing
        error: null,
      });

      const result = await aiProviderService.analyzeUrl(testUrl, testUrlType);
      
      const genericErrorMessage = "I tried to analyze the URL, but I couldn't get specific information from it. This can happen if the website blocks automated access, requires a login, or if the content isn't in a format I can easily read. You could try summarizing the key points from the URL yourself and asking me about those.";
      expect(result.generatedText).toBe(genericErrorMessage);
      expect(result.sourceUrls).toEqual([]);
    });

    it('should handle specific URL analysis failure pattern within a JSON response', async () => {
      const aiFailureResponse = '{"generatedText": "I am sorry, but I cannot access this URL.", "sourceUrls": []}';
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: aiFailureResponse },
        error: null,
      });
    
      const result = await aiProviderService.analyzeUrl(testUrl, testUrlType);
      
      const genericErrorMessage = "I tried to analyze the URL, but I couldn't get specific information from it. This can happen if the website blocks automated access, requires a login, or if the content isn't in a format I can easily read. You could try summarizing the key points from the URL yourself and asking me about those.";
      expect(result.generatedText).toBe(genericErrorMessage);
      expect(result.sourceUrls).toEqual([]); // Source URLs should be from the parsed object if available
    });


    it('should handle very short and unhelpful URL analysis response within a JSON response', async () => {
      const shortUnhelpfulResponse = '{"generatedText": "I cannot help with that.", "sourceUrls": ["short.url"]}';
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: { generatedText: shortUnhelpfulResponse },
        error: null,
      });

      const result = await aiProviderService.analyzeUrl(testUrl, testUrlType);
      const genericErrorMessage = "I tried to analyze the URL, but I couldn't get specific information from it. This can happen if the website blocks automated access, requires a login, or if the content isn't in a format I can easily read. You could try summarizing the key points from the URL yourself and asking me about those.";
      expect(result.generatedText).toBe(genericErrorMessage);
      expect(result.sourceUrls).toEqual(["short.url"]); // Preserve sourceUrls if provided
    });


  });
});
