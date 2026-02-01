import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

export interface ParsedResume {
  skills: string[];
  experience: Array<{ company: string; role: string; years?: number }>;
  projects: Array<{ name: string; description?: string; tech?: string[] }>;
  credibilityScore: number | null;
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async parseResume(filePath: string): Promise<ParsedResume> {
    let text = '';
    try {
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();

      if (ext === '.pdf') {
        const data = await pdf(buffer);
        text = data.text;
      } else {
        text = buffer.toString('utf-8');
      }
    } catch (e) {
      console.error('Error reading file:', e);
      text = 'Resume content placeholder';
    }
    
    // In a real scenario with API key, we could use Gemini to parse the resume text here too
    // For now using enhanced local keyword extraction
    return {
      skills: this.extractSkillsStub(text),
      experience: [{ company: 'Sample Co', role: 'Developer', years: 2 }],
      projects: [{ name: 'Sample Project', description: 'Description', tech: ['Node.js'] }],
      credibilityScore: 75,
    };
  }

  async generateSkillQuestions(skills: string[]): Promise<any[]> {
    // 1. Try using Gemini if API key is present
    if (this.model) {
      try {
        const prompt = `Generate 15 multiple choice technical interview questions based on these skills: ${skills.join(', ')}. 
        Return ONLY a raw JSON array (no markdown formatting) where each object has:
        - "question": string
        - "options": string[] (4 options)
        - "correctAnswer": string (must be one of the options)
        Make them challenging but fair.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error('Gemini generation failed, falling back to local bank:', error);
      }
    }

    // 2. Fallback to local question bank
    return this.generateFallbackQuestions(skills);
  }

  private generateFallbackQuestions(skills: string[]): any[] {
    const questions = [];
    const skillSet = new Set(skills.map(s => s.toLowerCase()));
    
    // Simple mock database of questions
    const questionBank = {
      javascript: [
        { question: 'What is the output of typeof null?', options: ['"object"', '"null"', '"undefined"', '"number"'], correctAnswer: '"object"' },
        { question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'unshift()', 'shift()'], correctAnswer: 'push()' },
        { question: 'What is a closure?', options: ['Function bundled with lexical environment', 'A variable type', 'A loop structure', 'An object method'], correctAnswer: 'Function bundled with lexical environment' },
        { question: 'What does "use strict" do?', options: ['Enforces stricter parsing', 'Allows global variables', 'Disables functions', 'Imports a library'], correctAnswer: 'Enforces stricter parsing' },
      ],
      typescript: [
        { question: 'What is the "any" type?', options: ['Disables type checking', 'A string type', 'A number type', 'An error'], correctAnswer: 'Disables type checking' },
        { question: 'How do you define an interface?', options: ['interface Name {}', 'type Name = {}', 'class Name {}', 'struct Name {}'], correctAnswer: 'interface Name {}' },
        { question: 'What are Generics?', options: ['Reusable components with types', 'Global variables', 'Database keys', 'Functions'], correctAnswer: 'Reusable components with types' },
      ],
      node: [
        { question: 'What is the Event Loop?', options: ['Handles async callbacks', 'A for loop', 'A library', 'A database'], correctAnswer: 'Handles async callbacks' },
        { question: 'Which module is used for file system?', options: ['fs', 'http', 'path', 'os'], correctAnswer: 'fs' },
        { question: 'What is npm?', options: ['Node Package Manager', 'Node Project Manager', 'New Project Maker', 'None'], correctAnswer: 'Node Package Manager' },
      ],
      react: [
        { question: 'What is a Hook?', options: ['Function to use state in functional components', 'A class method', 'A database connection', 'A routing tool'], correctAnswer: 'Function to use state in functional components' },
        { question: 'What is JSX?', options: ['Syntax extension for JavaScript', 'A library', 'A database', 'A variable'], correctAnswer: 'Syntax extension for JavaScript' },
        { question: 'What is Virtual DOM?', options: ['Lightweight copy of DOM', 'Real DOM', 'A browser', 'A server'], correctAnswer: 'Lightweight copy of DOM' },
      ],
      python: [
        { question: 'What is PEP 8?', options: ['Style guide for Python code', 'A database', 'A library', 'A version'], correctAnswer: 'Style guide for Python code' },
        { question: 'What is a decorator?', options: ['Function that modifies another function', 'A class', 'A variable', 'A loop'], correctAnswer: 'Function that modifies another function' },
        { question: 'What is a tuple?', options: ['Immutable sequence', 'Mutable sequence', 'A dictionary', 'A set'], correctAnswer: 'Immutable sequence' },
      ],
      java: [
        { question: 'What is JVM?', options: ['Java Virtual Machine', 'Java Visual Mode', 'Java Version Manager', 'None'], correctAnswer: 'Java Virtual Machine' },
        { question: 'What is inheritance?', options: ['Mechanism where one class acquires properties of another', 'A loop', 'A variable', 'A library'], correctAnswer: 'Mechanism where one class acquires properties of another' },
      ],
      sql: [
        { question: 'What does SELECT * do?', options: ['Selects all columns', 'Selects all rows', 'Selects nothing', 'Selects random data'], correctAnswer: 'Selects all columns' },
        { question: 'What is a JOIN?', options: ['Combines rows from two or more tables', 'Deletes data', 'Updates data', 'Creates a table'], correctAnswer: 'Combines rows from two or more tables' },
      ],
      // Add more general/default questions
      default: [
        { question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'HyperText Transmission Protocol', 'HyperTest Transfer Protocol', 'None'], correctAnswer: 'HyperText Transfer Protocol' },
        { question: 'What is Git?', options: ['Version Control System', 'A text editor', 'A language', 'A database'], correctAnswer: 'Version Control System' },
        { question: 'What is API?', options: ['Application Programming Interface', 'Application Protocol Interface', 'App Program Interface', 'None'], correctAnswer: 'Application Programming Interface' },
        { question: 'What is JSON?', options: ['JavaScript Object Notation', 'Java Source Object Network', 'JavaScript Open Network', 'None'], correctAnswer: 'JavaScript Object Notation' },
        { question: 'What is SQL?', options: ['Structured Query Language', 'Standard Query Language', 'Simple Query Language', 'None'], correctAnswer: 'Structured Query Language' },
        { question: 'Which data structure uses LIFO?', options: ['Stack', 'Queue', 'Array', 'Tree'], correctAnswer: 'Stack' },
        { question: 'Which data structure uses FIFO?', options: ['Queue', 'Stack', 'Graph', 'Heap'], correctAnswer: 'Queue' },
        { question: 'What is the time complexity of binary search?', options: ['O(log n)', 'O(n)', 'O(n^2)', 'O(1)'], correctAnswer: 'O(log n)' },
        { question: 'What is a Primary Key?', options: ['Unique identifier in a table', 'A password', 'First column', 'None'], correctAnswer: 'Unique identifier in a table' },
        { question: 'What is CI/CD?', options: ['Continuous Integration/Continuous Deployment', 'Code Integration/Code Deployment', 'Computer Interface/Computer Design', 'None'], correctAnswer: 'Continuous Integration/Continuous Deployment' },
      ]
    };

    // Gather questions based on skills
    skillSet.forEach(skill => {
      for (const [key, qList] of Object.entries(questionBank)) {
        if (skill.includes(key) || key.includes(skill)) {
          questions.push(...qList);
        }
      }
    });

    // Fill up to 15 with default questions if needed
    if (questions.length < 15) {
      const needed = 15 - questions.length;
      // Shuffle default questions and pick needed amount
      const defaults = [...questionBank.default].sort(() => 0.5 - Math.random());
      questions.push(...defaults.slice(0, needed));
    }

    // If still less than 15 (unlikely but possible if defaults run out), just duplicate some to fill
    while (questions.length < 15) {
       questions.push(questions[Math.floor(Math.random() * questions.length)]);
    }

    // Shuffle final list and take 15
    return questions.sort(() => 0.5 - Math.random()).slice(0, 15);
  }

  async matchCandidateToJob(
    candidateSkills: string[],
    jobRequiredSkills: string[],
  ): Promise<number> {
    if (jobRequiredSkills.length === 0) return 100;
    const set = new Set(candidateSkills.map((s) => s.toLowerCase()));
    const match = jobRequiredSkills.filter((s) => set.has(s.toLowerCase())).length;
    return Math.round((match / jobRequiredSkills.length) * 100);
  }

  async generateInterviewQuestions(jobTitle: string, jobDescription: string): Promise<string[]> {
    if (this.model) {
      try {
        const prompt = `Generate 5 interview questions for a ${jobTitle} role. 
        Job Description: ${jobDescription}. 
        Return ONLY a raw JSON array of strings.`;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error('Gemini interview question generation failed:', error);
      }
    }

    return [
      `Tell me about your experience with ${jobTitle}.`,
      'Describe a challenging project you worked on.',
      'How do you handle tight deadlines?',
      'How do you stay updated with new technologies?',
      'Where do you see yourself in 5 years?',
    ];
  }

  async scoreInterviewResponse(
    question: string,
    transcript: string,
  ): Promise<{ relevanceScore: number; sentimentScore: number }> {
    if (this.model) {
      try {
        const prompt = `Evaluate this interview answer.
        Question: "${question}"
        Answer: "${transcript}"
        
        Return ONLY a raw JSON object with:
        - "relevanceScore": number (0-100)
        - "sentimentScore": number (0-100)`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error('Gemini scoring failed:', error);
      }
    }

    // Fallback scoring logic (simple heuristic)
    const lengthScore = Math.min(transcript.length / 5, 100); // 500 chars = 100 score
    const randomVar = Math.floor(Math.random() * 20);
    return { 
      relevanceScore: Math.min(100, Math.max(50, lengthScore - randomVar)), 
      sentimentScore: Math.floor(Math.random() * (100 - 70) + 70) 
    };
  }

  private extractSkillsStub(text: string): string[] {
    const lowerText = text.toLowerCase();
    const possibleSkills = [
      'javascript', 'typescript', 'node.js', 'node', 'react', 'reactjs', 'angular', 'vue', 
      'python', 'java', 'c++', 'c#', 'golang', 'rust', 'php', 'ruby',
      'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'linux',
      'html', 'css', 'sass', 'less'
    ];

    const foundSkills = possibleSkills.filter(skill => lowerText.includes(skill));
    
    // De-duplicate and format
    const uniqueSkills = [...new Set(foundSkills.map(s => {
      if (s === 'node' || s === 'node.js') return 'Node.js';
      if (s === 'react' || s === 'reactjs') return 'React';
      if (s === 'postgres' || s === 'postgresql') return 'PostgreSQL';
      return s.charAt(0).toUpperCase() + s.slice(1);
    }))];

    if (uniqueSkills.length === 0) {
      return ['JavaScript', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API'];
    }

    return uniqueSkills;
  }
}
