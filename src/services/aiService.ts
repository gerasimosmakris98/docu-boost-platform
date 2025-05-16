
// Mock AI service
// Would be replaced with actual OpenAI API calls

import { toast } from "sonner";

export interface AISuggestion {
  content: string;
  sectionType: 'summary' | 'experience' | 'skills' | 'education' | 'cover-letter';
}

export interface CoverLetterRequest {
  jobTitle: string;
  company: string;
  jobDescription?: string;
  userExperience?: string[];
  userSkills?: string[];
}

export const aiService = {
  // Generate section suggestions
  generateSectionSuggestion: async (
    sectionType: AISuggestion['sectionType'],
    context: string
  ): Promise<AISuggestion> => {
    return new Promise((resolve) => {
      // Simulate AI response delay
      setTimeout(() => {
        let content = '';
        
        // Mock different responses based on section type
        switch(sectionType) {
          case 'summary':
            content = "Results-driven software engineer with 5+ years of experience developing scalable web applications. Proficient in React, TypeScript, and Node.js with a strong focus on performance optimization and clean code practices. Passionate about solving complex problems through innovative solutions and collaborative teamwork.";
            break;
          case 'experience':
            content = "• Led development of a customer-facing dashboard that increased user engagement by 40%\n• Optimized API response times by 60% through implementation of caching strategies\n• Mentored junior developers and conducted code reviews to maintain high quality standards";
            break;
          case 'skills':
            content = "JavaScript, TypeScript, React, Redux, Node.js, Express, MongoDB, AWS, Docker, CI/CD, Jest, Testing Library, Git, Agile/Scrum";
            break;
          case 'education':
            content = "Bachelor of Science in Computer Science\nUniversity of Technology\nGraduated: May 2016 - GPA: 3.8/4.0\n\nRelevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering";
            break;
          case 'cover-letter':
            content = "Dear Hiring Manager,\n\nI am writing to express my interest in the Software Engineer position at [Company Name]. With my background in web development and passion for creating user-friendly applications, I believe I would be a valuable addition to your team.\n\nIn my current role as a Senior Developer at TechCorp, I've led the development of several key projects that have significantly improved user engagement and system performance. My experience aligns perfectly with the requirements outlined in your job description.\n\nI am particularly excited about the opportunity to contribute to [specific company project or goal] and believe my skills in [relevant technologies] would allow me to make an immediate impact.\n\nThank you for considering my application. I look forward to the possibility of discussing how my background and skills would benefit your team.\n\nSincerely,\n[Your Name]";
            break;
        }
        
        toast.success(`AI suggestion for ${sectionType} generated!`);
        resolve({ content, sectionType });
      }, 1800);
    });
  },
  
  // Generate cover letter based on job details and user background
  generateCoverLetter: async (request: CoverLetterRequest): Promise<AISuggestion> => {
    return new Promise((resolve) => {
      // Simulate AI response delay
      setTimeout(() => {
        const { jobTitle, company, jobDescription } = request;
        
        const content = `Dear Hiring Manager,

I am writing to express my enthusiasm for the ${jobTitle} position at ${company}. As a passionate professional with experience in this field, I was excited to see this opportunity.

${jobDescription ? `After reviewing the job description, I believe my background in ${jobDescription.slice(0, 50)}... aligns perfectly with what you're seeking.` : `I believe my background and skills align perfectly with what you're seeking.`}

In my previous roles, I have:
• Developed and implemented strategic initiatives that increased efficiency by 30%
• Led cross-functional teams to successful project completions
• Utilized advanced technical skills to solve complex problems

I am particularly drawn to ${company}'s commitment to innovation and excellence in the industry. I am confident that my experience and passion for this field would make me a valuable addition to your team.

I welcome the opportunity to discuss how my background, skills and enthusiasm would benefit ${company}. Thank you for considering my application.

Sincerely,
[Your Name]`;
        
        toast.success(`Cover letter for ${jobTitle} at ${company} generated!`);
        resolve({ content, sectionType: 'cover-letter' });
      }, 2500);
    });
  }
};
