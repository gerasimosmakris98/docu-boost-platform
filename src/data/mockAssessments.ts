
export const technicalAssessment = {
  id: "tech-assessment-1",
  title: "Technical Skills Assessment",
  description: "Test your knowledge of web development concepts and technologies",
  questions: [
    {
      id: "q1",
      text: "Which of the following is NOT a JavaScript framework?",
      options: [
        { id: "a", text: "React" },
        { id: "b", text: "Angular" },
        { id: "c", text: "Vue" },
        { id: "d", text: "Laravel" }
      ],
      correctOptionId: "d"
    },
    {
      id: "q2",
      text: "What does CSS stand for?",
      options: [
        { id: "a", text: "Computer Style Sheets" },
        { id: "b", text: "Creative Style Sheets" },
        { id: "c", text: "Cascading Style Sheets" },
        { id: "d", text: "Custom Style Sheets" }
      ],
      correctOptionId: "c"
    },
    {
      id: "q3",
      text: "Which HTTP method is used to submit form data to be processed?",
      options: [
        { id: "a", text: "GET" },
        { id: "b", text: "POST" },
        { id: "c", text: "PUT" },
        { id: "d", text: "DELETE" }
      ],
      correctOptionId: "b"
    },
    {
      id: "q4",
      text: "What is the correct way to declare a JavaScript variable?",
      options: [
        { id: "a", text: "var x = 5;" },
        { id: "b", text: "let x = 5;" },
        { id: "c", text: "const x = 5;" },
        { id: "d", text: "All of the above" }
      ],
      correctOptionId: "d"
    },
    {
      id: "q5",
      text: "Which of the following is a CSS preprocessor?",
      options: [
        { id: "a", text: "JSON" },
        { id: "b", text: "SASS" },
        { id: "c", text: "JSX" },
        { id: "d", text: "XML" }
      ],
      correctOptionId: "b"
    }
  ],
  timeLimit: 300 // 5 minutes
};

export const communicationAssessment = {
  id: "comm-assessment-1",
  title: "Communication Skills Assessment",
  description: "Evaluate your professional communication abilities",
  questions: [
    {
      id: "q1",
      text: "Which of the following is the most effective way to start an email to a potential employer?",
      options: [
        { id: "a", text: "Hey there!" },
        { id: "b", text: "To whom it may concern," },
        { id: "c", text: "Dear [Specific Name]," },
        { id: "d", text: "Attention: Hiring Manager" }
      ],
      correctOptionId: "c"
    },
    {
      id: "q2",
      text: "When giving a presentation, what should you do if you don't know the answer to a question?",
      options: [
        { id: "a", text: "Make up an answer to appear knowledgeable" },
        { id: "b", text: "Admit you don't know and offer to find out" },
        { id: "c", text: "Redirect the question to someone else" },
        { id: "d", text: "Ignore the question and move on" }
      ],
      correctOptionId: "b"
    },
    {
      id: "q3",
      text: "Which of the following is NOT an effective active listening technique?",
      options: [
        { id: "a", text: "Paraphrasing what the speaker said" },
        { id: "b", text: "Maintaining eye contact" },
        { id: "c", text: "Thinking about your response while they're speaking" },
        { id: "d", text: "Asking clarifying questions" }
      ],
      correctOptionId: "c"
    }
  ],
  timeLimit: 180 // 3 minutes
};

export const leadershipAssessment = {
  id: "lead-assessment-1",
  title: "Leadership Skills Assessment",
  description: "Evaluate your leadership and management abilities",
  questions: [
    {
      id: "q1",
      text: "What is the most effective way to handle team conflict?",
      options: [
        { id: "a", text: "Avoid addressing it to maintain harmony" },
        { id: "b", text: "Address it privately with each individual" },
        { id: "c", text: "Facilitate open discussion between conflicting parties" },
        { id: "d", text: "Ask a higher authority to resolve it" }
      ],
      correctOptionId: "c"
    },
    {
      id: "q2",
      text: "Which of the following is an example of a SMART goal?",
      options: [
        { id: "a", text: "Improve team performance" },
        { id: "b", text: "Increase sales by 15% in the next quarter" },
        { id: "c", text: "Work harder" },
        { id: "d", text: "Be a better leader" }
      ],
      correctOptionId: "b"
    },
    {
      id: "q3",
      text: "What leadership style involves making decisions without consulting team members?",
      options: [
        { id: "a", text: "Democratic" },
        { id: "b", text: "Laissez-faire" },
        { id: "c", text: "Autocratic" },
        { id: "d", text: "Transformational" }
      ],
      correctOptionId: "c"
    }
  ],
  timeLimit: 180 // 3 minutes
};

export const problemSolvingAssessment = {
  id: "problem-assessment-1",
  title: "Problem-Solving Assessment",
  description: "Test your analytical and critical thinking skills",
  questions: [
    {
      id: "q1",
      text: "A project is behind schedule. What should you do first?",
      options: [
        { id: "a", text: "Add more team members immediately" },
        { id: "b", text: "Work overtime to catch up" },
        { id: "c", text: "Identify the root cause of the delay" },
        { id: "d", text: "Reduce the project scope" }
      ],
      correctOptionId: "c"
    },
    {
      id: "q2",
      text: "Which of these is NOT a step in the design thinking process?",
      options: [
        { id: "a", text: "Empathize" },
        { id: "b", text: "Define" },
        { id: "c", text: "Execute" },
        { id: "d", text: "Prototype" }
      ],
      correctOptionId: "c"
    },
    {
      id: "q3",
      text: "What is the best approach to solving complex problems?",
      options: [
        { id: "a", text: "Trust your intuition and act quickly" },
        { id: "b", text: "Break it down into smaller, manageable parts" },
        { id: "c", text: "Delegate it to someone with more experience" },
        { id: "d", text: "Apply a standardized solution" }
      ],
      correctOptionId: "b"
    }
  ],
  timeLimit: 180 // 3 minutes
};
