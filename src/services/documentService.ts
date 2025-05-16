
// Mock document processing service
// Would be replaced with actual implementation using pdf-parse, mammoth.js, etc.

import { toast } from "sonner";

export interface ParsedDocument {
  title: string;
  content: {
    summary?: string;
    experience?: string[];
    education?: string[];
    skills?: string[];
    contact?: Record<string, string>;
  };
  rawText: string;
  fileType: 'pdf' | 'docx' | 'doc' | 'txt';
  originalFileName: string;
}

export const documentService = {
  parseDocument: async (file: File): Promise<ParsedDocument> => {
    return new Promise((resolve) => {
      // In a real implementation, we would:
      // 1. Parse PDF using pdf-parse
      // 2. Parse DOCX using mammoth.js
      // 3. Extract structured data from the content
      
      // For now, we'll mock the response
      setTimeout(() => {
        const fileType = file.name.split('.').pop()?.toLowerCase();
        
        const mockParsed: ParsedDocument = {
          title: file.name.replace(/\.(pdf|docx|doc|txt)$/i, ''),
          content: {
            summary: "Experienced software engineer with a passion for creating elegant solutions to complex problems. Proficient in multiple programming languages and frameworks with a focus on web development.",
            experience: [
              "Senior Software Engineer at TechCorp (2020-Present)",
              "Software Developer at InnovateSoft (2018-2020)",
              "Junior Developer at StartupXYZ (2016-2018)"
            ],
            education: [
              "Bachelor of Computer Science, University of Technology (2016)"
            ],
            skills: [
              "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "Git", "AWS"
            ],
            contact: {
              email: "example@email.com",
              phone: "(123) 456-7890",
              location: "San Francisco, CA"
            }
          },
          rawText: "This would be the full raw text of the document...",
          fileType: (fileType as 'pdf' | 'docx' | 'doc' | 'txt') || 'pdf',
          originalFileName: file.name
        };
        
        toast.success(`Document "${file.name}" parsed successfully!`);
        resolve(mockParsed);
      }, 2000);
    });
  }
};
