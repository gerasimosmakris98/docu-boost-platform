
import { ConversationType } from "../types/conversationTypes";

/**
 * Get a template fallback response when OpenAI API is unavailable
 */
export const getTemplateFallbackResponse = (userMessage: string, type: ConversationType): string => {
  // Generic fallback message prefix
  const fallbackPrefix = "I apologize, but I'm currently experiencing some technical limitations due to high usage. Instead of a fully personalized response, here are some general tips that might help:\n\n";
  
  // Check message content for keywords to provide more targeted fallback
  const lowerCaseMessage = userMessage.toLowerCase();
  
  // Resume-related fallback
  if (type === "resume" || 
      lowerCaseMessage.includes('resume') || 
      lowerCaseMessage.includes('cv')) {
    return `${fallbackPrefix}**Resume Tips:**\n\n- Focus on achievements rather than just job duties\n- Quantify your accomplishments when possible (e.g., "Increased sales by 25%")\n- Tailor your resume to each job by including relevant keywords\n- Keep formatting clean and consistent\n- Proofread carefully for errors\n- Include a strong summary/profile section\n- Limit to 1-2 pages depending on experience level`;
  }
  
  // Cover letter fallback
  if (type === "cover_letter" || 
      lowerCaseMessage.includes('cover letter') || 
      lowerCaseMessage.includes('application letter')) {
    return `${fallbackPrefix}**Cover Letter Tips:**\n\n- Address the letter to a specific person if possible\n- Open with a compelling introduction that shows enthusiasm\n- Highlight 2-3 key achievements relevant to the position\n- Demonstrate knowledge of the company\n- Explain why you're a good fit for the role and culture\n- Close with a clear call to action\n- Keep it under one page`;
  }
  
  // Interview fallback
  if (type === "interview_prep" || 
      lowerCaseMessage.includes('interview') || 
      lowerCaseMessage.includes('question')) {
    return `${fallbackPrefix}**Interview Preparation Tips:**\n\n- Research the company thoroughly before the interview\n- Prepare concrete examples using the STAR method (Situation, Task, Action, Result)\n- Practice common questions like "Tell me about yourself" and "Why do you want this job?"\n- Prepare thoughtful questions to ask the interviewer\n- Dress professionally and arrive early\n- Follow up with a thank-you note within 24 hours`;
  }
  
  // LinkedIn fallback
  if (type === "linkedin" || 
      lowerCaseMessage.includes('linkedin') || 
      lowerCaseMessage.includes('profile')) {
    return `${fallbackPrefix}**LinkedIn Profile Tips:**\n\n- Use a professional, high-quality profile photo\n- Write a headline that goes beyond your job title\n- Craft a compelling summary that highlights your unique value\n- Detail your achievements in experience sections, not just responsibilities\n- Include relevant skills and seek endorsements\n- Obtain recommendations from colleagues and supervisors\n- Regularly share and engage with content in your industry`;
  }
  
  // Job search fallback
  if (lowerCaseMessage.includes('job search') || 
      lowerCaseMessage.includes('looking for job') || 
      lowerCaseMessage.includes('find work')) {
    return `${fallbackPrefix}**Job Search Tips:**\n\n- Define your career goals and target positions\n- Optimize your online presence, especially LinkedIn\n- Use multiple job search channels (job boards, company websites, networking)\n- Tailor applications to each position\n- Follow up on applications after 1-2 weeks\n- Track your applications in a spreadsheet\n- Build and leverage your professional network\n- Consider working with recruiters in your industry`;
  }
  
  // General career advice fallback
  return `${fallbackPrefix}**Career Development Tips:**\n\n- Set specific, measurable career goals\n- Seek regular feedback on your performance\n- Develop both technical and soft skills\n- Build a strong professional network\n- Find a mentor in your field\n- Stay updated on industry trends\n- Consider additional certifications or education\n- Document your achievements for performance reviews and job applications`;
};
