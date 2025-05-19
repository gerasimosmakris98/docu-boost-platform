
import { ConversationType } from "../types/conversationTypes";

export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Welcome to the Resume Advisor! I'll help you create, improve, and optimize your resume for job applications. Upload your current resume or share a job posting to get started.";
    case 'interview_prep':
      return "Welcome to the Interview Advisor! I'll help you prepare for interviews with practice questions, feedback on your answers, and tips for success. What kind of interview are you preparing for?";
    case 'cover_letter':
      return "Welcome to the Cover Letter Advisor! I'll help you craft compelling cover letters tailored to specific job positions. Share the job posting or tell me about the role you're applying for.";
    case 'job_search':
      return "Welcome to the Job Search Advisor! I'll help you develop strategies for finding and applying to jobs that match your skills and goals. What stage of your job search are you in?";
    case 'linkedin':
      return "Welcome to the LinkedIn Advisor! I'll help you optimize your LinkedIn profile to attract recruiters and showcase your professional brand. Share your profile URL or let's discuss specific sections you want to improve.";
    case 'assessment':
      return "Welcome to the Assessment Advisor! I'll help you prepare for job assessments, tests, and coding challenges. What type of assessment are you facing?";
    default:
      return "Hello! I'm your AI Career Advisor. I can help with resumes, cover letters, interview preparation, job searching, LinkedIn optimization, and more. What would you like assistance with today?";
  }
};

export const getChatPromptForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "I'll help you with your resume. You can ask me to review your existing resume, help you create a new one, or optimize it for a specific job. Upload your resume or job description to get started.";
    case 'interview_prep':
      return "I'll help you prepare for interviews. I can provide practice questions, feedback on your answers, or tips for specific interview types (behavioral, technical, etc.).";
    case 'cover_letter':
      return "I'll help you craft a compelling cover letter. Share details about the job you're applying for, and I'll help you highlight relevant skills and experiences.";
    case 'job_search':
      return "I'll help you with your job search strategy. I can provide tips on finding opportunities, networking, application tracking, and more.";
    case 'linkedin':
      return "I'll help you optimize your LinkedIn profile. I can provide feedback on your headline, summary, experience, and other sections to increase visibility to recruiters.";
    case 'assessment':
      return "I'll help you prepare for job assessments and tests. Let me know what type of assessment you're facing, and I'll provide guidance on how to approach it.";
    default:
      return "How can I assist with your career today? I can help with resumes, cover letters, interview preparation, job searching, and more.";
  }
};
