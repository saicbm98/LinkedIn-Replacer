import { ProfileContent } from './types';

export const ADMIN_PASSWORD = "admin123";
export const RECOVERY_CODE = "recovery";

export const INITIAL_PROFILE: ProfileContent = {
  name: "Sai Medicherla",
  headline: "AI Automation & Ops Specialist | n8n Workflows | I build practical automation to reduce manual ops and help and help teams scale faster",
  location: "New Zealand",
  shortSummary: "I streamline manual workflows and help teams scale using Airtable, Zapier, and Gen AI tools.",
  aboutLong: "Thanks for stopping by. 👋\n\nI'm a technical ops analyst who turns messy processes into workable systems using automation and practical AI tools.\n\nI have 2+ years of experience in ops-heavy analyst roles across insurance, customer operations, and higher education. My background combines a Bachelor's in Electronics & Communication Engineering with an MSc in International Relations from the University of Bristol, so I'm super comfortable moving quickly between technical details and business priorities, and between teams when things get stuck.\n\nI'm obsessed with spotting process and product inefficiencies, then fixing them with AI automation and no-code platforms like n8n, Zapier, and Airtable. Recently, I recently built QueueSense, an AI-assisted customer support ticketing workflow, plus this website and several end-to-end n8n automations that eliminated repetitive manual work. Many more to come!\n\nI'm equally comfortable strategising an approach or getting my hands dirty in the weeds of implementation, whatever the problem needs.\n\nIf you're looking for an AI-confident operator who can turn messy ideas into workable systems using automation and AI, I'd love to chat!",
  experience: [
    {
      id: '1',
      company: "migreats",
      title: "Operations and Product",
      dates: "Jul 2025 - Sept 2025",
      location: "London, UK (Remote)",
      description: [
        "Built and managed a guest sourcing and outreach pipeline for community events, tracking status and follow ups end to end.",
        "Created webinar assets (slides, alignment docs, speaker briefs) and coordinated speaker comms and event logistics.",
        "Systematised community operations with lightweight docs and repeatable workflows (templates, checklists, SOPs) to reduce back and forth."
      ],
      logoUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/download.png?raw=true",
      employmentType: "Contract"
    },
    {
      id: '2',
      company: "NFU Mutual",
      title: "Insurance Analyst",
      dates: "Nov 2023 - Oct 2024",
      location: "Bristol, UK",
      description: [
        "Led data analysis for 1500+ policies worth £30 million+, collaborating with internal stakeholders to maintain data quality and accuracy, negotiate terms and make effective policy decisions.",
        "Forecasted policy risk using 100+ data points in Excel, leveraging the insights to underwrite 4 policies/hour with accurate, high-quality decisions.",
        "Collaborated cross-functionally with Claims, Sales and IT teams to optimise and automate key internal processes, reducing the overall policy processing time by 30%.",
        "Identified key operational bottlenecks and proposed an AI-powered referral tool, cutting referral handling time by 20% and initiating broader conversations on using AI to streamline ops and improve delivery."
      ],
      logoUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/download%20(1).png?raw=true",
      employmentType: "Full-time"
    },
    {
      id: '3',
      company: "Vue UK and Ireland",
      title: "Customer Operations Analyst",
      dates: "Mar 2023 - Oct 2023",
      location: "Bristol, UK",
      description: [
        "Analysed 5+ parameters of customer feedback data, identifying operational bottlenecks and implementing solutions that cut response times by 20% while maintaining 90%+ customer satisfaction."
      ],
      logoUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/download%20(2).png?raw=true",
      employmentType: "Full-time"
    },
    {
      id: '4',
      company: "University of Bristol",
      title: "Student Experience Quality Analyst",
      dates: "Nov 2021 - May 2022",
      location: "Bristol, UK",
      description: [
        "Analysed the University Quality Framework based on feedback from 1000+ students, leveraging data insights to present 10+ process enhancements to senior department members.",
        "Established and maintained strong relationships with 5+ key stakeholders, resolving 80% of identified issues and driving a 20% improvement in student satisfaction scores."
      ],
      logoUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/download%20(4).png?raw=true",
      employmentType: "Part-time"
    },
    {
      id: '5',
      company: "Analog Devices",
      title: "Firmware Data Intern",
      dates: "Jul 2020 - May 2021",
      location: "Bangalore, India",
      description: [
        "Built a new data framework that resolved 5+ inefficiencies, boosting overall product testing efficiency to 90%.",
        "Delivered 95%+ accuracy while analysing large client datasets using our internal framework, supporting data-led decision-making across multiple projects.",
        "Managed relationships with 10+ internal and external stakeholders, delivering 100+ technical solutions."
      ],
      logoUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/Analog%20Devices.jpg?raw=true",
      employmentType: "Contract"
    }
  ],
  education: [
    {
      id: '1',
      school: "University of Bristol",
      degree: "MSc International Relations",
      dates: "2021 - 2022",
      logoUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/download%20(4).png?raw=true"
    },
    {
      id: '2',
      school: "NIT Jamshedpur",
      degree: "BTech Electronics and Communication Engineering",
      dates: "2015 - 2019",
      logoUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/nitjsr.jpg?raw=true"
    }
  ],
  projects: [
    {
      id: '1',
      name: "Pomodoro Accountability Bot (Discord)",
      description: "Group focus tool for a peer job seeking circle with custom intervals. Posts live countdowns and breaks in a shared channel for lightweight accountability.",
      stack: ["Process automation", "Workflow design", "Vibe coding", "Discord bot development", "Logging and debugging", "Deployment basics"],
      link: "https://github.com/saicbm98"
    },
    {
      id: '2',
      name: "LinkedIn Replacer",
      description: "A professional profile web app with integrated messaging, AI profile Q&A, and SOC evaluator. Features a clean, network-style UI for recruiters and hiring managers.",
      stack: ["React", "TypeScript", "Tailwind CSS", "Gemini API", "Claude", "Workflow design", "Google AI Studio", "Debugging", "Vibe coding", "Database integration"],
      link: "https://github.com/saicbm98"
    },
    {
      id: '3',
      name: "QueueSense",
      description: "QueueSense is an AI helper app for support teams at B2B SaaS companies. It reads support tickets, shows the important details about each customer, and writes reply drafts so agents can clear the queue faster with less effort. It is a demo and portfolio project, but it should feel like a real support tool for a mid sized B2B SaaS company.",
      stack: ["React", "Firebase", "Tailwind"],
      link: "https://github.com/saicbm98/quesense"
    }
  ],
  skills: [
    "n8n", "Excel", "Slack", "Gemini", "Operations Strategy", "Process Improvement", 
    "Data Analysis", "No-Code Ops", "AI Automation", "Google AI Studio", 
    "Strategic Planning", "Prompt Engineering"
  ],
  whatLookingFor: [
    "AI Operations, Automation Engineering, or Product Ops roles where I automate manual processes and build AI-powered operational systems",
    "Teams that value shipping fast and solving messy operational problems"
  ],
  collaborateSubtitle: "Are you a founder, hiring manager or recruiter looking for someone who",
  collaborateBullets: [
    "Fixes your operational headaches with AI-powered automation (n8n, Zapier, custom workflows)",
    "Builds workflows that help you scale your team quickly and efficiently",
    "Works across the full spectrum from high-level planning to hands-on implementation, whatever the problem needs"
  ],
  contact: {
    email: "medicherlasaicharan@gmail.com",
    githubUrl: "https://github.com/saicbm98",
    whatsappLink: "https://wa.me/447436950058"
  },
  avatarUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/IMG-20230227-WA0019.jpg?raw=true",
  coverUrl: "https://github.com/saicbm98/LinkedIn-Replacer/blob/main/LinkedIn%20Background%20Photo.png?raw=true"
};
