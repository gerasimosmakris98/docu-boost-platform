
import { ConversationType } from "../types/conversationTypes";

/**
 * Generate a template fallback response when API quota is exceeded
 */
export const getTemplateFallbackResponse = (
  userMessage: string, 
  conversationType: ConversationType
): string => {
  const message = userMessage.toLowerCase();
  
  // Generic helpful response based on conversation type
  if (conversationType === 'resume') {
    return `Thank you for your question about resumes. I'm currently experiencing connection issues, but I can offer some general advice:

1. **Tailor your resume to each job application** by matching keywords from the job description
2. **Quantify your achievements** with metrics and results when possible
3. **Keep your resume concise** (1-2 pages) and use bullet points for readability
4. **Include a strong professional summary** at the top that highlights your key qualifications
5. **Proofread carefully** for grammar and spelling errors

Would you like specific advice on a particular section of your resume? Please try again in a moment when the connection is restored.`;
  } 
  
  if (conversationType === 'cover_letter') {
    return `Thank you for your question about cover letters. I'm currently experiencing connection issues, but I can offer some general advice:

1. **Address the hiring manager by name** if possible
2. **Open with a compelling introduction** that shows your enthusiasm for the role
3. **Connect your experience to the job requirements** with specific examples
4. **Keep it concise** (3-4 paragraphs) and professional in tone
5. **End with a call to action** expressing interest in an interview

Would you like specific advice on a particular section of your cover letter? Please try again in a moment when the connection is restored.`;
  }
  
  if (conversationType === 'interview_prep') {
    return `Thank you for your interview preparation question. I'm currently experiencing connection issues, but I can offer some general advice:

1. **Research the company thoroughly** before your interview
2. **Prepare STAR method examples** (Situation, Task, Action, Result) to showcase your experience
3. **Practice common questions** like "Tell me about yourself" and "Why do you want this job?"
4. **Prepare thoughtful questions** to ask the interviewer
5. **Follow up with a thank-you email** within 24 hours after the interview

Would you like specific advice on answering particular interview questions? Please try again in a moment when the connection is restored.`;
  }
  
  if (conversationType === 'linkedin') {
    return `Thank you for your LinkedIn profile question. I'm currently experiencing connection issues, but I can offer some general advice:

1. **Use a professional photo** with good lighting and a neutral background
2. **Create a compelling headline** that's more than just your job title
3. **Write a detailed summary** highlighting your expertise and career goals
4. **Add rich media** like presentations or articles to showcase your work
5. **Request recommendations** from colleagues who can speak to your strengths

Would you like specific advice on optimizing a particular section of your profile? Please try again in a moment when the connection is restored.`;
  }
  
  // Default general response
  return `Thank you for your question. I'm currently experiencing connection issues, but I can offer some general career advice:

1. **Regularly update your skills** to stay relevant in your industry
2. **Network consistently** both online and in-person
3. **Seek feedback** from mentors and colleagues
4. **Document your achievements** for performance reviews and job applications
5. **Create a career development plan** with short and long-term goals

Please try again in a moment when the connection is restored for more specific advice on your question.`;
};
