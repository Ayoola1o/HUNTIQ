import type { JobPostingNormalized } from '../adapters/types';

export interface NormalizedJobAnalysis extends JobPostingNormalized {
  cleanTitle: string;
  departmentConfidence: number;
  seniorityConfidence: number;
  workplaceMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  geo: {
    city: string;
    state?: string;
    country: string;
  };
  detectedSkills: string[];
  detectedTechStack: string[];
  detectedSoftware: string[];
  compensation?: {
    min?: number;
    max?: number;
    currency?: string;
    interval?: 'YEAR' | 'MONTH' | 'HOUR';
  };
  intentTags: string[];
}

export class JobNormalizer {
  /**
   * Sanitizes title by stripping job IDs, office tags, locations, and brackets.
   * Example: "Head of People Operations - Lagos (Hybrid) [#4091]" -> "Head of People Operations"
   */
  public static sanitizeTitle(title: string): string {
    return title
      .replace(/\[.*?\]|\(.*?\)/g, '') // remove bracketed text
      .replace(/#\d+/g, '') // remove requisition IDs
      .replace(/\s*[-–—|]\s*(remote|hybrid|onsite|lagos|nairobi|london|full-?time|part-?time).*$/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Extracts seniority rank and confidence rating.
   */
  public static extractSeniority(title: string): {
    seniority: JobPostingNormalized['seniority'];
    confidence: number;
  } {
    const t = title.toLowerCase();

    if (/\b(chief|cxo|ceo|cto|cfo|cmo|cro|coo|cpo|president)\b/i.test(t)) {
      return { seniority: 'CXO', confidence: 98 };
    }
    if (/\b(vp|vice president|evp|svp)\b/i.test(t)) {
      return { seniority: 'VP', confidence: 96 };
    }
    if (/\b(director|head of|principal|general manager)\b/i.test(t)) {
      return { seniority: 'DIRECTOR', confidence: 95 };
    }
    if (/\b(lead|staff|team lead|manager|tech lead|engineering manager)\b/i.test(t)) {
      return { seniority: 'LEAD', confidence: 90 };
    }
    if (/\b(senior|sr\.?|iii|experienced)\b/i.test(t)) {
      return { seniority: 'SENIOR', confidence: 92 };
    }
    if (/\b(junior|jr\.?|intern|internship|associate|trainee|entry level)\b/i.test(t)) {
      return { seniority: 'ENTRY', confidence: 90 };
    }

    return { seniority: 'MID', confidence: 80 };
  }

  /**
   * Classifies role into standard macro departments & functional areas.
   */
  public static extractDepartment(title: string, rawDept?: string, description: string = ''): {
    department: string;
    functionArea: string;
    confidence: number;
  } {
    const combined = `${title} ${rawDept || ''} ${description}`.toLowerCase();

    if (/\b(people|talent|hr|human resources|recruiter|recruiting|people ops|culture|compensation|benefits|total rewards)\b/i.test(combined)) {
      return { department: 'People & Culture', functionArea: 'Human Resources & Talent', confidence: 96 };
    }

    if (/\b(engineering|software|developer|frontend|backend|fullstack|devops|sre|cloud|infrastructure|architect|qa|qa engineer|firmware)\b/i.test(combined)) {
      return { department: 'Engineering & Technology', functionArea: 'Software Development', confidence: 98 };
    }

    if (/\b(product|product manager|pm|ux|ui|designer|design|product design|user research)\b/i.test(combined)) {
      return { department: 'Product & Design', functionArea: 'Product Management', confidence: 94 };
    }

    if (/\b(sales|account executive|bdr|sdr|revenue|commercial|business development|partnership|account manager)\b/i.test(combined)) {
      return { department: 'Sales & Commercial', functionArea: 'Revenue & Accounts', confidence: 95 };
    }

    if (/\b(marketing|growth|seo|brand|content|social media|performance marketing|communications|copywriter)\b/i.test(combined)) {
      return { department: 'Marketing & Growth', functionArea: 'Brand & Acquisition', confidence: 94 };
    }

    if (/\b(legal|compliance|regulatory|aml|risk|governance|counsel|attorney|ethics)\b/i.test(combined)) {
      return { department: 'Legal, Risk & Compliance', functionArea: 'Regulatory & Risk', confidence: 95 };
    }

    if (/\b(finance|accounting|treasury|controller|audit|fp&a|tax|bookkeeper|financial analyst)\b/i.test(combined)) {
      return { department: 'Finance & Accounting', functionArea: 'Corporate Finance', confidence: 96 };
    }

    if (/\b(operations|expansion|chief of staff|strategy|logistics|supply chain|procurement)\b/i.test(combined)) {
      return { department: 'Operations & Strategy', functionArea: 'Business Operations', confidence: 88 };
    }

    return {
      department: rawDept || 'Operations & Strategy',
      functionArea: 'General Business',
      confidence: 70
    };
  }

  /**
   * Resolves workplace mode: REMOTE, HYBRID, or ONSITE.
   */
  public static extractWorkplaceMode(title: string, location: string = '', description: string = ''): 'REMOTE' | 'HYBRID' | 'ONSITE' {
    const combined = `${title} ${location} ${description}`.toLowerCase();
    if (/\b(hybrid|flexible)\b/i.test(combined)) return 'HYBRID';
    if (/\b(remote|work from home|anywhere|distributed)\b/i.test(combined)) return 'REMOTE';
    return 'ONSITE';
  }

  /**
   * Extracts geographic coordinates, city, and country.
   */
  public static extractGeo(location: string = ''): { city: string; state?: string; country: string } {
    const loc = location.toLowerCase();

    if (loc.includes('lagos') || loc.includes('abuja') || loc.includes('nigeria')) {
      return { city: loc.includes('abuja') ? 'Abuja' : 'Lagos', country: 'Nigeria' };
    }
    if (loc.includes('nairobi') || loc.includes('kenya')) {
      return { city: 'Nairobi', country: 'Kenya' };
    }
    if (loc.includes('johannesburg') || loc.includes('cape town') || loc.includes('south africa')) {
      return { city: loc.includes('cape town') ? 'Cape Town' : 'Johannesburg', country: 'South Africa' };
    }
    if (loc.includes('london') || loc.includes('uk') || loc.includes('united kingdom')) {
      return { city: 'London', country: 'United Kingdom' };
    }
    if (loc.includes('san francisco') || loc.includes('new york') || loc.includes('united states') || loc.includes('usa')) {
      return { city: loc.includes('new york') ? 'New York' : 'San Francisco', country: 'United States' };
    }

    return { city: location ? location.split(',')[0].trim() : 'Lagos', country: 'Nigeria' };
  }

  /**
   * Extracts technology stack, programming languages, and enterprise software.
   */
  public static extractSkillsAndTech(text: string): {
    skills: string[];
    techStack: string[];
    software: string[];
  } {
    const t = ` ${text.toLowerCase()} `;
    const techCatalog: Record<string, string> = {
      'react': 'React',
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'node.js': 'Node.js',
      'nodejs': 'Node.js',
      'python': 'Python',
      'golang': 'Go',
      'go lang': 'Go',
      'java': 'Java',
      'rust': 'Rust',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'aws': 'AWS',
      'gcp': 'Google Cloud',
      'azure': 'Azure',
      'graphql': 'GraphQL',
      'tailwind': 'Tailwind CSS'
    };

    const softwareCatalog: Record<string, string> = {
      'salesforce': 'Salesforce CRM',
      'hubspot': 'HubSpot',
      'greenhouse': 'Greenhouse ATS',
      'lever': 'Lever ATS',
      'workday': 'Workday HCM',
      'bamboohr': 'BambooHR',
      'stripe': 'Stripe Payments',
      'paystack': 'Paystack API',
      'jira': 'Jira / Atlassian',
      'slack': 'Slack Enterprise',
      'segment': 'Twilio Segment',
      'mixpanel': 'Mixpanel'
    };

    const skillsCatalog: Record<string, string> = {
      'aml': 'AML / KYC Compliance',
      'kyc': 'KYC Verification',
      'fintech': 'FinTech Architecture',
      'payments': 'Payment Systems',
      'compensation': 'Compensation Benchmarking',
      'seo': 'SEO & Organic Growth',
      'cross-border': 'Cross-Border Clearing',
      'fundraising': 'Investor Relations'
    };

    const techStack = Object.keys(techCatalog)
      .filter(key => t.includes(key))
      .map(key => techCatalog[key]);

    const software = Object.keys(softwareCatalog)
      .filter(key => t.includes(key))
      .map(key => softwareCatalog[key]);

    const skills = Object.keys(skillsCatalog)
      .filter(key => t.includes(key))
      .map(key => skillsCatalog[key]);

    return {
      techStack: Array.from(new Set(techStack)),
      software: Array.from(new Set(software)),
      skills: Array.from(new Set(skills))
    };
  }

  /**
   * Parses compensation data if present in title or content.
   */
  public static extractCompensation(text: string): NormalizedJobAnalysis['compensation'] {
    const match = text.match(/(\$|£|€|₦)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:-|to)\s*(\$|£|€|₦)?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:\/|\s*per\s*)?(year|yr|month|mo|hour|hr)?/i);

    if (match) {
      const currency = match[1] === '₦' ? 'NGN' : match[1] === '£' ? 'GBP' : match[1] === '€' ? 'EUR' : 'USD';
      const min = parseInt(match[2].replace(/,/g, ''), 10);
      const max = parseInt(match[4].replace(/,/g, ''), 10);
      const intervalRaw = match[5]?.toLowerCase();
      const interval = intervalRaw?.startsWith('mo') ? 'MONTH' : intervalRaw?.startsWith('h') ? 'HOUR' : 'YEAR';

      return { min, max, currency, interval };
    }

    return undefined;
  }

  /**
   * Detects intent tags based on seniority, department, and keywords.
   */
  public static extractIntentTags(title: string, seniority: string, department: string, skills: string[]): string[] {
    const tags: string[] = [];

    if (seniority === 'DIRECTOR' || seniority === 'VP' || seniority === 'CXO') {
      tags.push('LEADERSHIP_EXPANSION');
    }
    if (department === 'People & Culture') {
      tags.push('TALENT_INFRASTRUCTURE_BUILD');
    }
    if (department === 'Sales & Commercial' || department === 'Marketing & Growth') {
      tags.push('REVENUE_RAMP_UP');
    }
    if (department === 'Legal, Risk & Compliance') {
      tags.push('REGULATORY_COMPLIANCE_EXPANSION');
    }
    if (skills.some(s => s.includes('Cross-Border') || s.includes('FinTech'))) {
      tags.push('REGIONAL_EXPANSION');
    }

    return Array.from(new Set(tags));
  }

  /**
   * Complete End-to-End Normalization Runner.
   */
  public static normalize(raw: {
    externalId?: string;
    title: string;
    department?: string;
    location?: string;
    content?: string;
    url?: string;
    postedAt?: string;
    rawPayload?: any;
  }): NormalizedJobAnalysis {
    const cleanTitle = this.sanitizeTitle(raw.title);
    const { seniority, confidence: seniorityConfidence } = this.extractSeniority(raw.title);
    const { department, functionArea, confidence: departmentConfidence } = this.extractDepartment(raw.title, raw.department, raw.content);
    const workplaceMode = this.extractWorkplaceMode(raw.title, raw.location, raw.content);
    const geo = this.extractGeo(raw.location);
    const { skills, techStack, software } = this.extractSkillsAndTech(`${raw.title} ${raw.content || ''}`);
    const compensation = this.extractCompensation(`${raw.title} ${raw.content || ''}`);
    const intentTags = this.extractIntentTags(cleanTitle, seniority, department, skills);

    return {
      externalId: raw.externalId || `norm_${Date.now()}`,
      title: raw.title,
      cleanTitle,
      department,
      functionArea,
      seniority,
      seniorityConfidence,
      departmentConfidence,
      location: raw.location || `${geo.city}, ${geo.country}`,
      country: geo.country,
      remote: workplaceMode === 'REMOTE',
      workplaceMode,
      employmentType: 'FULL_TIME',
      jobUrl: raw.url || '',
      postedAt: raw.postedAt || new Date().toISOString(),
      descriptionSnippet: raw.content ? raw.content.substring(0, 250).replace(/<[^>]*>?/gm, '') : raw.title,
      geo,
      detectedSkills: skills,
      detectedTechStack: techStack,
      detectedSoftware: software,
      compensation,
      intentTags,
      rawPayload: raw.rawPayload || {}
    };
  }
}
