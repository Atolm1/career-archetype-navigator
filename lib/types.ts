export interface CoreStrength {
  name: string;
  description: string;
}

export interface TransferableSkill {
  skill: string;
  description: string;
}

export interface CareerPath {
  title: string;
  category: string;
  fitScore: number;
  whyItFits: string;
}

export interface WatchOutFor {
  title: string;
  description: string;
}

export interface CareerProfile {
  archetypeName: string;
  tagline: string;
  essenceDescription: string;
  coreStrengths: CoreStrength[];
  transferableSkills: TransferableSkill[];
  careerPaths: CareerPath[];
  workEnvironmentNeeds: string[];
  watchOutFor: WatchOutFor[];
  growthEdge: string;
}

export interface GenerateRequest {
  mbtiType: string;
  workBackground?: string;
}
