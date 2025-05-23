
import { toast } from "sonner";
import { getSystemPrompt } from "./utils/conversationUtils";

// Define the types for chat responses from the AI
export interface AIResponse {
  content: string;
  error?: string;
}

// Message structure for conversation history
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Type of conversation for contextual prompts
export type ConversationType = 'resume' | 'cover_letter' | 'interview_prep' | 'general';

// AI service to handle interactions with OpenAI
export const aiService = {
  // Function to generate a chat response from the AI
  async generateChatResponse(
    message: string, 
    history: ConversationMessage[] = [], 
    conversationType: ConversationType = 'general'
  ): Promise<string> {
    try {
      // Get appropriate system prompt based on conversation type
      const systemPrompt = getSystemPrompt(conversationType);
      
      // Format the messages for the AI API
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        })),
        { role: 'user', content: message }
      ];
      
      // Check if we're in development mode (use mock responses to save API costs)
      if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_AI) {
        return getMockResponse(message, conversationType);
      }
      
      try {
        // Try to use real API if available
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: formattedMessages,
            conversationType
          }),
        });
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data.content || getMockResponse(message, conversationType);
      } catch (apiError) {
        console.warn('API request failed, falling back to mock responses:', apiError);
        return getMockResponse(message, conversationType);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast.error("Failed to generate response. Please try again.");
      return "I'm sorry, I encountered an error while generating a response. Please try again.";
    }
  },
  
  // Generate a document based on user input and job description
  async generateDocument(
    documentType: 'resume' | 'cover_letter',
    userProfile: any,
    jobDescription: string
  ): Promise<{title: string, content: string} | null> {
    try {
      // For real implementation, we'd call an API here
      // For now, we'll continue to use mock responses
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response based on document type
      if (documentType === 'resume') {
        return {
          title: "Professional Resume for " + (userProfile?.full_name || "New Position"),
          content: `# ${userProfile?.full_name || "Your Name"}\n
${userProfile?.title || "Professional Title"}\n
${userProfile?.email || "email@example.com"} | ${userProfile?.phone || "Phone Number"} | ${userProfile?.location || "Location"}\n
## Professional Summary
${userProfile?.summary || "Experienced professional with a track record of success in the industry."}\n
## Skills
- Leadership & Team Management
- Strategic Planning
- Project Management
- Data Analysis\n
## Experience
**Senior Role | Company Name | 2020 - Present**
- Led cross-functional teams to deliver projects on time and under budget
- Increased department efficiency by 25% through process improvements
- Managed relationships with key stakeholders\n
**Previous Role | Previous Company | 2017 - 2020**
- Developed and implemented new strategies that increased revenue by 15%
- Collaborated with multiple departments to streamline operations
- Received recognition for outstanding performance\n
## Education
**Master's Degree | University Name | 2017**
**Bachelor's Degree | University Name | 2015**
`
        };
      } else {
        return {
          title: "Cover Letter for " + (jobDescription?.substring(0, 30) || "New Position"),
          content: `# ${userProfile?.full_name || "Your Name"}\n
${userProfile?.email || "email@example.com"} | ${userProfile?.phone || "Phone Number"} | ${userProfile?.location || "Location"}\n
**Date:** ${new Date().toLocaleDateString()}\n
Dear Hiring Manager,\n
I am writing to express my interest in the position advertised on your company website. With my background in ${userProfile?.title || "the industry"} and proven success in delivering results, I'm confident in my ability to make a valuable contribution to your team.\n
My experience has equipped me with the skills necessary to excel in this role. I have consistently ${userProfile?.summary || "demonstrated the ability to perform at a high level and meet organizational objectives"}.\n
I am particularly drawn to your company because of its reputation for innovation and commitment to excellence. I am excited about the opportunity to bring my unique skills and perspective to your team.\n
Thank you for considering my application. I look forward to the possibility of discussing how my experience and skills would benefit your organization.\n
Sincerely,\n
${userProfile?.full_name || "Your Name"}
`
        };
      }

    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document. Please try again.");
      return null;
    }
  },

  // Generate interview questions based on job description
  async generateInterviewQuestions(jobDescription: string): Promise<string[] | null> {
    try {
      // In a real implementation, we'd call an API here
      // For now, we'll return mock questions
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return [
        "Tell me about your experience with similar roles.",
        "How do you handle tight deadlines and pressure situations?",
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "What are your greatest professional strengths and weaknesses?",
        "Why are you interested in this position and our company?",
        "Where do you see yourself in 5 years?",
        "Tell me about a time you failed and what you learned from it.",
        "How would your previous colleagues describe your work style?",
        "What questions do you have for me about the role or company?"
      ];

    } catch (error) {
      console.error("Error generating interview questions:", error);
      toast.error("Failed to generate interview questions. Please try again.");
      return null;
    }
  }
};

// Helper function to get mock responses based on the message and conversation type
function getMockResponse(message: string, conversationType: ConversationType): string {
  if (message.toLowerCase().includes("help") || message.toLowerCase().includes("start")) {
    switch(conversationType) {
      case 'resume':
        return "I'll help you create a professional resume. To get started, could you tell me about your work experience, education, and key skills? Or if you'd like, you can upload an existing resume and I can help improve it.";
      case 'cover_letter':
        return "I'll help you craft a compelling cover letter. To make it targeted, could you share the job description you're applying for and a brief summary of your relevant experience?";
      case 'interview_prep':
        return "I'll help you prepare for your interview. What position are you interviewing for? I can generate common questions and we can practice your responses together.";
      default:
        return "I'm here to help with your career development needs. What would you like assistance with today?";
    }
  } else if (message.toLowerCase().includes("job") || message.toLowerCase().includes("position")) {
    switch(conversationType) {
      case 'resume':
        return "Great! Based on the job description, let's tailor your resume to highlight the most relevant experience and skills. I recommend emphasizing your [specific skills] since they align with the requirements. Would you like me to draft a summary section for the top of your resume?";
      case 'cover_letter':
        return "Thanks for sharing the job description. I can help you write a cover letter that addresses the specific requirements. Let's start by explaining why you're interested in this position and how your experience in [relevant area] makes you a strong candidate.";
      case 'interview_prep':
        return "Based on this position, here are 5 common questions you might be asked:\n\n1. Tell me about your experience with [relevant skill].\n2. Describe a challenging project you've worked on and how you handled it.\n3. Why are you interested in this role and our company?\n4. How do you handle tight deadlines and pressure?\n5. Where do you see yourself in 5 years?\n\nWould you like to practice answering any of these?";
      default:
        return "I see you're interested in a specific job position. Would you like help with creating a resume, writing a cover letter, or preparing for an interview?";
    }
  } else {
    // Generic responses based on conversation type
    switch(conversationType) {
      case 'resume':
        return "I've analyzed your background and here's a suggestion for your resume:\n\n**Professional Summary**\nDedicated professional with experience in [field/industry], skilled in [key skill] and [key skill]. Proven track record of [achievement] resulting in [positive outcome].\n\n**Key Skills**\n- [Skill 1]\n- [Skill 2]\n- [Skill 3]\n\nWould you like me to continue with the work experience section?";
      case 'cover_letter':
        return "Based on our conversation, here's a draft for your cover letter introduction:\n\n\"Dear Hiring Manager,\n\nI am writing to express my interest in the [Position] role at [Company Name]. With my background in [relevant field] and proven success in [relevant achievement], I'm confident in my ability to contribute to your team's goals and drive results.\"\n\nHow does this sound? Shall I continue with the body paragraphs?";
      case 'interview_prep':
        return "That's a great practice answer! To strengthen it further, consider:\n\n1. Adding a specific example that demonstrates your skills in action\n2. Quantifying your achievements with metrics if possible\n3. Connecting your experience directly to the requirements of the role\n\nWould you like to try another question or refine this answer?";
      default:
        return "I understand what you're looking for. In the career development field, it's important to present yourself effectively. Can you tell me more about your specific goals so I can provide more targeted assistance?";
    }
  }
}
