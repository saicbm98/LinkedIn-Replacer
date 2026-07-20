import { ProfileContent } from './types';

export const INITIAL_PROFILE_VERSION = 4; // Increment this to force reset visitor's local storage

export const INITIAL_PROFILE: ProfileContent = {
  name: "Sai Medicherla",
  headline: "Operations & Process Improvement Specialist | Experience in Insurance + Tech | I improve processes and help teams work more efficiently, saving cost and time | AI workflow builder",
  location: "New Zealand",
  shortSummary: "Operations and process improvement customer-facing professional with experience across insurance, technology and higher education.",
  aboutLong: "Thanks for stopping by. 👋\n\nI'm an ops and process improvement professional with experience across insurance, technology, and higher education. Background in electronics engineering and international relations, so I'm comfortable moving between technical detail and a business-oriented mindset effortlessly.\n\nI have 2+ years in ops and ops-adjacent analyst roles, managing high volumes, maintaining accuracy under pressure, and working cross-functionally to find and solve process inefficiencies.\n\nI have built several end-to-end workflows, tools and websites using n8n, Google AI Studio, and Claude Code that simplify and automate manual work.",
  experience: [
    {
      id: '1',
      company: "Migreats",
      title: "Operations Associate",
      dates: "Jul 2025 - Sep 2025",
      location: "Remote, UK",
      description: [
        "Coordinated end-to-end webinar operations for a 250+ member professional community, managing speaker outreach, scheduling, deck preparation and post-event reporting.",
        "Reviewed and formalised internal workflows, drafting SOPs to improve operational clarity and consistency.",
        "Analysed engagement data and collaborated with founders to trial AI-enabled tools and automation processes to enhance member experience and internal efficiency.",
        "Contributed to refining operational strategy during a scaling phase."
      ],
      logoUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178341/migreats_hmuaxc.png",
      employmentType: "Contract"
    },
    {
      id: '2',
      company: "NFU Mutual",
      title: "Insurance Underwriter",
      dates: "Nov 2023 - Oct 2024",
      location: "Bristol, UK",
      description: [
        "Assessed 1,500 policies across new business, renewals and mid-term adjustments, maintaining strict compliance and risk standards.",
        "Consistently exceeded productivity targets, averaging 4 policies per hour while maintaining high data accuracy.",
        "Collaborated with Claims, Sales and IT teams to resolve complex cases and reduce policy processing time.",
        "Identified inefficiencies in referral workflows and proposed a digital improvement initiative that reduced turnaround delays.",
        "Maintained strong broker relationships, supporting accurate documentation and commercial negotiation of terms."
      ],
      logoUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178341/nfu-mutual_bcvbmi.png",
      employmentType: "Full-time"
    },
    {
      id: '3',
      company: "Vue UK & Ireland",
      title: "Customer Assistant",
      dates: "Mar 2023 - Oct 2023",
      location: "Bristol, UK",
      description: [
        "Delivered front-line customer service in a high-volume cinema environment.",
        "Managed peak-period operations across ticketing and retail, maintaining service standards under pressure.",
        "Resolved customer queries and complaints in line with company policy."
      ],
      logoUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178340/vue_kovssl.png",
      employmentType: "Full-time"
    },
    {
      id: '4',
      company: "University of Bristol",
      title: "Student Experience Quality Reviewer",
      dates: "Nov 2021 - May 2022",
      location: "Bristol, UK",
      description: [
        "Analysed structured feedback from 1,000+ students as part of academic quality assurance reviews.",
        "Identified recurring service gaps and presented findings to academic leadership.",
        "Prepared summary reports outlining improvement actions and recommendations.",
        "Supported cross-department collaboration to improve student satisfaction outcomes."
      ],
      logoUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178340/bristol_vibybq.png",
      employmentType: "Part-time"
    },
    {
      id: '5',
      company: "Analog Devices",
      title: "Firmware Engineering Intern",
      dates: "Jul 2020 - May 2021",
      location: "Bangalore, India",
      description: [
        "Supported hardware validation and testing of automotive semiconductor products.",
        "Designed a structured data framework that resolved five key inefficiencies and improved evaluation workflow efficiency to 90%.",
        "Analysed technical datasets and collaborated with engineering teams to troubleshoot performance issues.",
        "Coordinated with 10+ global stakeholders to support product delivery timelines."
      ],
      logoUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178341/analog-devices_bqtmol.jpg",
      employmentType: "Contract"
    }
  ],
  education: [
    {
      id: '1',
      school: "University of Bristol",
      degree: "MSc International Relations",
      dates: "2021 - 2022",
      description: [],
      logoUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178340/bristol_vibybq.png"
    },
    {
      id: '2',
      school: "NIT Jamshedpur",
      degree: "BTech Electronics and Communication Engineering",
      dates: "2015 - 2019",
      description: [],
      logoUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178341/nitjsr_pue6hb.jpg"
    }
  ],
  projects: [
    {
      id: '5',
      name: "AI-Powered Profile Research Tool",
      description: "Discovers and researches candidate profiles using the Perplexity Agent API, scrapes LinkedIn activity via Apify, enriches career history via Bright Data, and surfaces outreach hooks through an embedded Claude drafting assistant. Persists research history to Supabase.",
      stack: ["Claude Code", "Perplexity", "Apify", "Bright Data", "Streamlit", "Supabase"]
    },
    {
    id: '1',
    name: "Sales Lead Enrichment",
    description: "A form submission triggers an n8n workflow that researches the company, scores the lead, writes a draft outreach email, creates a HubSpot CRM record, and sends a Slack alert — all in under 90 seconds.",
    link: "https://github.com/saicbm98/sales-lead-enrichment-n8n",
    stack: ["n8n", "AI agent", "HubSpot", "Slack", "Workflow automation"]
},
    {
      id: '2',
      name: "QueueSense",
      description: "AI helper app for B2B SaaS support teams. Reads incoming tickets, summarises the issue, flags urgency, and drafts a reply so agents clear the queue faster.",
      link: "https://github.com/saicbm98/QueSense---AI-powered-customer-ticketing",
      stack: ["React", "TypeScript", "n8n", "OpenAI", "Webhooks"]
    },
    {
      id: '3',
      name: "Company Research Automation",
      description: "Paste a company URL into a form and get a structured research report in Google Docs within 5 minutes. Scrapes the site, runs GPT analysis, and outputs outreach-ready intelligence.",
      link: "https://github.com/saicbm98/Company-Info-Research-Automation-n8n-Workflow",
      stack: ["n8n", "OpenAI", "Google Docs", "Web scraping", "Prompt engineering"]
    },
    {
      id: '4',
      name: "Email Alarm System",
      description: "n8n workflow that monitors Gmail every 15 minutes, filters by sender whitelist, domain, and keywords, and fires an emergency Pushover alert that bypasses Do Not Disturb.",
      link: "https://github.com/saicbm98/nz-email-alarm-alert-system",
      stack: ["n8n", "Gmail API", "Pushover", "JavaScript", "Workflow automation"]
    }
  ],
  skills: [
    "Process Improvement",
    "Workflow Optimisation",
    "Data Analysis",
    "Customer Onboarding",
    "Operations Strategy",
    "SOP Development",
    "Stakeholder Engagement",
    "Operational Reporting",
    "Operational Support Delivery",
    "n8n",
    "Claude Code",
    "Claude Cowork",
    "Process Mapping",
    "Data Interpretation",
    "FCA Compliance",
    "Risk Assessment",
    "Documentation",
    "Excel",
    "LexisNexis",
    "Slack",
    "Google AI Studio",
    "Claude",
    "Perplexity"
  ],
  whatLookingFor: [
    "Looking for roles in operations, business analysis, process improvement, digital transformation or product, where the work involves identifying and solving operational inefficiencies and improving how the business functions day-to-day",
    "Teams that value collaboration and operational efficiency, and who want someone who can contribute at both ends of the spectrum, from high-level planning with the business context in mind, right through to hands-on delivery"
  ],
  collaborateSubtitle: "Are you a founder, hiring manager or recruiter looking for someone who",
  collaborateBullets: [
    "Can improve your business processes and keep your team operating at maximum efficiency",
    "Can leverage AI and automation tools where needed to reduce costs, save time and improve how work gets done",
    "Works across the full spectrum, from high-level planning to hands-on implementation, whatever is needed"
  ],
  contact: {
    email: "medicherlasaicharan@gmail.com",
    githubUrl: "https://github.com/saicbm98",
    whatsappLink: "https://wa.me/447436950058"
  },
  avatarUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178343/Profile_qboyg1.jpg",
  coverUrl: "https://res.cloudinary.com/djcggerkx/image/upload/v1769178341/cover_trydyw.png"
};