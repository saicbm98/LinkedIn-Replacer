
import { ProfileContent } from './types';

export const ADMIN_PASSWORD = "admin123";
export const RECOVERY_CODE = "recovery";

export const INITIAL_PROFILE: ProfileContent = {
  name: "Sai Medicherla",
  headline: "AI-Based No-Code Operator | Workflow Optimiser | Ex-Insurance Analyst",
  location: "United Kingdom",
  shortSummary: "I streamline manual workflows and help teams scale using Airtable, Zapier, and Gen AI tools.",
  aboutLong: "Thanks for stopping by. 👋\n\nI am a dynamic technical professional with a diverse academic background in Engineering and International Relations. I specialize in data-focused problem-solving and driving operational excellence through AI automation and no-code platforms.\n\nI have over 2 years of experience in ops-heavy analyst roles across insurance tech and higher education. My focus is on identifying inefficiencies and building scalable solutions without the need for traditional heavy coding. I streamline messy workflows using tools like Airtable, Zapier, Relay, and ChatGPT.\n\nI am a 'brilliant generalist' at heart—obsessed with improving how things work and helping teams scale with simple, clear, and efficient processes.",
  experience: [
    {
      id: '1',
      company: "Migreats",
      title: "Operations and Product",
      dates: "Jul 2025 - Sept 2025",
      location: "London, UK (Remote)",
      description: [
        "Map and streamline community and events workflows to remove friction and clarify owners and handoffs.",
        "Analyse engagement and operations data to surface bottlenecks and simple wins that move key metrics.",
        "Co-create lightweight internal tools with founders to speed up execution in a fast-moving startup context."
      ],
      logoUrl: "https://ui-avatars.com/api/?name=Migreats&background=random",
      employmentType: "Contract"
    },
    {
      id: '2',
      company: "NFU Mutual",
      title: "Insurance Analyst",
      dates: "Nov 2023 - Oct 2024",
      location: "Bristol, UK",
      description: [
        "Led analysis for 1,500+ policies with a value over £30 million to improve data quality and decisions.",
        "Used Excel with 100+ policy data points to underwrite around four policies per hour with high accuracy.",
        "Partnered with Claims, Sales, and IT to redesign and automate internal steps, cutting cycle time by ~30%.",
        "Proposed an AI referral helper that reduced handling time by ~20% and initiated wider AI discussions."
      ],
      logoUrl: "https://logo.clearbit.com/nfumutual.co.uk",
      employmentType: "Full-time"
    },
    {
      id: '3',
      company: "Vue UK and Ireland",
      title: "Customer Operations Analyst",
      dates: "Mar 2023 - Oct 2023",
      location: "Bristol, UK",
      description: [
        "Turned multi-source customer feedback into concrete fixes, reducing response time by ~20%.",
        "Kept satisfaction at over 90% during process changes."
      ],
      logoUrl: "https://logo.clearbit.com/myvue.com",
      employmentType: "Full-time"
    },
    {
      id: '4',
      company: "University of Bristol",
      title: "Student Experience Quality Analyst",
      dates: "Nov 2021 - May 2022",
      location: "Bristol, UK",
      description: [
        "Analysed over 1,000 student feedback inputs against the Quality Framework and highlighted gaps.",
        "Presented 10+ improvements to department leads and landed changes that lifted satisfaction by ~20%."
      ],
      logoUrl: "https://logo.clearbit.com/bristol.ac.uk",
      employmentType: "Part-time"
    },
    {
      id: '5',
      company: "Analog Devices",
      title: "Firmware Data Intern",
      dates: "Jul 2020 - May 2021",
      location: "Bangalore, India",
      description: [
        "Built a data framework that removed key inefficiencies and pushed testing efficiency toward 90%.",
        "Delivered over 95% accuracy on large client datasets used for engineering decisions.",
        "Coordinated 10+ internal and external stakeholders across projects."
      ],
      logoUrl: "https://logo.clearbit.com/analog.com",
      employmentType: "Contract"
    }
  ],
  education: [
    {
      id: '1',
      school: "University of Bristol",
      degree: "MSc International Relations",
      dates: "2021 - 2022",
      logoUrl: "https://logo.clearbit.com/bristol.ac.uk"
    },
    {
      id: '2',
      school: "NIT Jamshedpur",
      degree: "BTech Electronics and Communication Engineering",
      dates: "2015 - 2019",
      logoUrl: "https://logo.clearbit.com/nitjsr.ac.in"
    }
  ],
  projects: [
    {
      id: '1',
      name: "Pomodoro Accountability Bot (Discord)",
      description: "Group focus tool for a peer job seeking circle with custom intervals. Posts live countdowns and breaks in a shared channel for lightweight accountability.",
      stack: ["Discord API", "Automation"],
      link: "https://github.com/saicbm98"
    },
    {
      id: '2',
      name: "LinkedIn Replacer",
      description: "A professional profile web app with integrated messaging, AI profile Q&A, and SOC evaluator. Features a clean, network-style UI for recruiters and hiring managers.",
      stack: ["React", "TypeScript", "Tailwind CSS", "Gemini API"],
      link: "https://github.com/saicbm98"
    },
    {
      id: '3',
      name: "QueSense",
      description: "QueueSense is an AI helper app for support teams at B2B SaaS companies. It reads support tickets, shows the important details about each customer, and writes reply drafts so agents can clear the queue faster with less effort. It is a demo and portfolio project, but it should feel like a real support tool for a mid sized B2B SaaS company.",
      stack: ["React", "Firebase", "Tailwind"],
      link: "https://github.com/saicbm98/quesense"
    }
  ],
  skills: [
    "Airtable", "Zapier", "Relay", "ChatGPT", "n8n", "Excel", "Slack", "Gemini", 
    "Operations Strategy", "Process Improvement", "Data Analysis", "No-Code Ops"
  ],
  whatLookingFor: [
    "Immediate entry to mid-level Business Ops, Product Ops, or General Ops roles."
  ],
  collaborateSubtitle: "Are you a founder hiring manager or recruiter looking for someone who",
  collaborateBullets: [
    "Is obsessed with improving how things work and learns fast from setbacks",
    "Uses AI and no code tools to make operations faster and more efficient",
    "Brings whatever it takes to help you hit mission critical goals"
  ],
  contact: {
    email: "medicherlasaicharan@gmail.com",
    githubUrl: "https://github.com/saicbm98",
    whatsappLink: "#"
  },
  avatarUrl: "https://ui-avatars.com/api/?name=Sai+Medicherla&background=0A66C2&color=fff",
  coverUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
};
