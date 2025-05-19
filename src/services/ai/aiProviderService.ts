
import { AIProvider, FileAnalysisOptions, AIModelOptions } from './types';
import { providers, providerOrder, unavailableProviders } from './providerConfigs';
import { supabase } from '@/integrations/supabase/client';
import { ConversationType } from '../types/conversationTypes';
import { toast } from 'sonner';

// Fallback response when all providers fail
const getFallbackResponse = (type: ConversationType = 'general'): string => {
  switch (type) {
    case 'resume':
      return "I apologize, but I'm currently experiencing some limitations in my resume analysis capabilities. Here are some general tips for an effective resume:\n\n1. Keep it concise (1-2 pages)\n2. Use action verbs and quantify accomplishments\n3. Tailor your resume to the specific job\n4. Ensure perfect formatting and proofreading\n\nWould you like me to focus on a specific part of your resume?";
    case 'interview_prep':
      return "I apologize, but I'm currently experiencing some limitations in my interview preparation capabilities. Here are some general interview tips:\n\n1. Research the company thoroughly\n2. Prepare stories that demonstrate your skills\n3. Practice answering common questions\n4. Prepare thoughtful questions to ask\n\nWould you like to focus on a specific interview question or scenario?";
    case 'cover_letter':
      return "I apologize, but I'm currently experiencing some limitations in my cover letter assistant capabilities. Here are some general cover letter tips:\n\n1. Address a specific person when possible\n2. Open with a compelling introduction\n3. Connect your experience to the job requirements\n4. Close with a clear call to action\n\nWhich part of your cover letter would you like help with?";
    case 'job_search':
      return "I apologize, but I'm currently experiencing some limitations in my job search guidance capabilities. Here are some general job search tips:\n\n1. Clarify your career goals and desired roles\n2. Update your resume and LinkedIn profile\n3. Leverage both job boards and networking\n4. Follow up on applications\n\nWhat specific aspect of your job search would you like to focus on?";
    case 'linkedin':
      return "I apologize, but I'm currently experiencing some limitations in my LinkedIn optimization capabilities. Here are some general LinkedIn tips:\n\n1. Use a professional profile photo\n2. Write a compelling headline and summary\n3. Detail your experience with achievements\n4. Engage regularly with industry content\n\nWhich part of your LinkedIn profile would you like to improve?";
    case 'assessment':
      return "I apologize, but I'm currently experiencing some limitations in my assessment preparation capabilities. Here are some general assessment tips:\n\n1. Understand the format and content of the assessment\n2. Practice with similar questions if possible\n3. Manage your time effectively during the test\n4. Read instructions carefully\n\nWhat type of assessment are you preparing for?";
    default:
      return "I apologize, but I'm currently experiencing some technical limitations. Here are some general career tips:\n\n1. Regularly update your skills and knowledge\n2. Build and maintain your professional network\n3. Set clear, achievable career goals\n4. Seek feedback and be adaptable\n\nIs there a specific career topic you'd like to focus on?";
  }
};

// Check if a provider is available
async function checkProviderAvailability(provider: AIProvider): Promise<boolean> {
  const providerConfig = providers[provider as Exclude<AIProvider, 'fallback'>];
  
  if (!providerConfig) {
    console.warn(`Provider ${provider} not configured`);
    return false;
  }
  
  // If we've already marked it as unavailable, don't try again
  if (unavailableProviders.has(provider)) {
    console.log(`Provider ${provider} previously marked as unavailable`);
    return false;
  }
  
  try {
    // Try to invoke a simple function to check if the provider is available
    const { data, error } = await supabase.functions.invoke(providerConfig.functionName, {
      body: { 
        prompt: "test availability", 
        type: "general",
        maxTokens: 10
      },
    });
    
    if (error) {
      console.warn(`Provider ${provider} not available:`, error.message);
      unavailableProviders.add(provider);
      return false;
    }
    
    return true;
  } catch (err) {
    console.warn(`Error checking provider ${provider} availability:`, err);
    unavailableProviders.add(provider);
    return false;
  }
}

// Reset providers (e.g., when starting a new conversation)
function resetProviders(): void {
  unavailableProviders.clear();
}

// Generate a response using the first available provider
async function generateResponse(
  prompt: string, 
  type: ConversationType = 'general',
  systemPrompt?: string,
  modelOptions?: AIModelOptions
): Promise<string> {
  // Try each provider in order
  for (const provider of providerOrder) {
    // Skip 'fallback' as it's not a real provider
    if (provider === 'fallback') {
      console.log('Using fallback provider');
      return getFallbackResponse(type);
    }
    
    // Check if this provider is available
    const isAvailable = await checkProviderAvailability(provider);
    if (!isAvailable) {
      console.log(`Provider ${provider} is not available, trying next`);
      continue;
    }
    
    const providerConfig = providers[provider as Exclude<AIProvider, 'fallback'>];
    
    try {
      console.log(`Generating response with provider: ${provider}`);
      
      // Try to generate a response with this provider
      const { data, error } = await supabase.functions.invoke(providerConfig.functionName, {
        body: { 
          prompt, 
          type,
          systemPrompt,
          maxTokens: modelOptions?.maxTokens || providerConfig.maxTokens,
          temperature: modelOptions?.temperature || providerConfig.temperature
        },
      });
      
      if (error) {
        console.error(`Error with provider ${provider}:`, error);
        
        // If it's a rate limit error, mark this provider as unavailable
        if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
          console.warn(`Provider ${provider} rate limited, marking as unavailable`);
          unavailableProviders.add(provider);
        }
        
        continue; // Try next provider
      }
      
      // Return the generated text if successful
      if (data?.generatedText) {
        return data.generatedText;
      }
      
      // If we get here, the provider didn't return usable data
      console.warn(`Provider ${provider} returned no usable data`);
    } catch (err) {
      console.error(`Exception with provider ${provider}:`, err);
      
      // Mark this provider as unavailable for subsequent requests
      unavailableProviders.add(provider);
    }
  }
  
  // If we've tried all providers and none worked, use the fallback
  console.log('All providers failed, using fallback response');
  return getFallbackResponse(type);
}

// Analyze a file using the provider
async function analyzeFile(
  fileUrl: string, 
  fileName: string, 
  fileType: string,
  systemPrompt?: string,
  modelOptions?: AIModelOptions
): Promise<string> {
  // Try each provider for file analysis
  for (const provider of providerOrder) {
    // Skip 'fallback' as it's not a real provider
    if (provider === 'fallback') {
      return `I'm unable to analyze your file right now. Here are some general tips for this file type:\n\n- For resumes: Focus on clear formatting and quantifiable achievements\n- For cover letters: Tailor to the specific position and company\n- For LinkedIn profiles: Highlight your unique value proposition\n\nIf you'd like specific feedback, you can paste the content directly in our chat.`;
    }
    
    // Check if this provider is available
    const isAvailable = await checkProviderAvailability(provider);
    if (!isAvailable) continue;
    
    const providerConfig = providers[provider as Exclude<AIProvider, 'fallback'>];
    
    try {
      console.log(`Analyzing file with provider: ${provider}`);
      
      // Try to analyze the file with this provider
      const { data, error } = await supabase.functions.invoke(providerConfig.analyzeFunction, {
        body: { 
          fileUrl, 
          fileName, 
          fileType,
          systemPrompt,
          maxTokens: modelOptions?.maxTokens || 1500, // Use more tokens for file analysis
          temperature: modelOptions?.temperature || 0.1  // Lower temperature for more focused analysis
        },
      });
      
      if (error) {
        console.error(`Error analyzing file with provider ${provider}:`, error);
        
        // If it's a rate limit error, mark this provider as unavailable
        if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
          unavailableProviders.add(provider);
        }
        
        continue; // Try next provider
      }
      
      // Return the analysis if successful
      if (data?.analysis) {
        return data.analysis;
      }
      
      // If we get here, the provider didn't return usable data
      console.warn(`Provider ${provider} returned no usable file analysis`);
    } catch (err) {
      console.error(`Exception analyzing file with provider ${provider}:`, err);
      
      // Mark this provider as unavailable for subsequent requests
      unavailableProviders.add(provider);
    }
  }
  
  // Fallback message if all providers failed
  return `I'm unable to analyze your file at the moment. You could try uploading a different format or pasting the content directly in our chat for better results.`;
}

// Export the service with public methods
export const aiProviderService = {
  generateResponse,
  analyzeFile,
  resetProviders
};
