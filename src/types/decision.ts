export interface DecisionOption {
  id: string;
  name: string;
  tagline: string;
  keyTakeaway: string;
}

export interface ProItem {
  id: string;
  point: string;
  detail: string;
  category: string;
  impact: number; // 1 to 5
}

export interface ConItem {
  id: string;
  point: string;
  detail: string;
  category: string;
  impact: number; // -1 to -5
  mitigation: string;
}

export interface OptionProsCons {
  optionId: string;
  pros: ProItem[];
  cons: ConItem[];
}

export interface MatrixEvaluation {
  optionId: string;
  score: number; // 1 to 10
  comment: string;
}

export interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  defaultWeight: number; // 1 to 5
  evaluations: MatrixEvaluation[];
}

export interface ComparisonMatrix {
  criteria: MatrixCriterion[];
}

export interface OptionSwot {
  optionId: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicSummary: string;
}

export interface DecisionRule {
  condition: string;
  optionId: string;
}

export interface TiebreakerVerdict {
  recommendedOptionId: string;
  confidence: 'High' | 'Moderate' | 'Razor-Thin' | string;
  headline: string;
  reasoning: string;
  rulesOfThumb: DecisionRule[];
  blindspot: string;
  regretMinimizationTakeaway: string;
  immediateNextStep: string;
}

export interface DecisionAnalysisResult {
  decisionTitle: string;
  decisionSummary: string;
  reversibility: string;
  options: DecisionOption[];
  prosCons: OptionProsCons[];
  matrix: ComparisonMatrix;
  swot: OptionSwot[];
  tiebreakerVerdict: TiebreakerVerdict;
  createdAt?: string;
  id?: string;
}

export interface DevilsAdvocateResult {
  catastrophicAssumption: string;
  failureStory: string;
  counterPunchMitigations: string[];
  pivotIndicators: string[];
}

export interface ScenarioImpact {
  optionName: string;
  impactLevel: 'Heavily Favored' | 'Neutral' | 'Heavily Hurt' | string;
  explanation: string;
}

export interface ScenarioSimulationResult {
  scenarioImpact: string;
  optionImpacts: ScenarioImpact[];
  newRecommendation: string;
  hedgingStrategy: string;
}

export interface SavedDecision {
  id: string;
  timestamp: string;
  dilemma: string;
  result: DecisionAnalysisResult;
}
