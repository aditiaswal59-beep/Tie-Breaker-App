export interface SampleDilemma {
  id: string;
  category: string;
  title: string;
  dilemma: string;
  options: string[];
  priorities: string;
  context: string;
}

export const SAMPLE_DILEMMAS: SampleDilemma[] = [
  {
    id: 'career-startup',
    category: 'Career & Work',
    title: 'Stable Tech Job vs. High-Growth Startup',
    dilemma: 'Should I remain at my established tech company with predictable hours and good compensation, or accept an offer as Head of Product at an early-stage venture-backed startup?',
    options: ['Stay at Established Corp', 'Join Early-Stage Startup'],
    priorities: 'Long-term wealth creation, autonomy, maintaining health and personal relationships',
    context: 'Current role is comfortable but learning curve has plateaued. The startup has 18 months runway and top-tier seed investors.',
  },
  {
    id: 'housing-buy-rent',
    category: 'Finance & Housing',
    title: 'Buy Suburban Home vs. Rent & Invest in City',
    dilemma: 'Should we buy a suburban house requiring a 20% down payment and 30-year mortgage, or keep renting an apartment in the city and dollar-cost average the capital into diversified equities?',
    options: ['Buy Suburban Home', 'Rent & Invest Difference'],
    priorities: 'Wealth preservation, lifestyle flexibility, family space, commute time',
    context: 'Interest rates are moderate. We plan to stay in the region for at least 5-7 years, but value mobility.',
  },
  {
    id: 'tech-stack',
    category: 'Product & Tech',
    title: 'Custom In-House Architecture vs. Managed Platform',
    dilemma: 'Should we build our core multi-tenant analytics engine from scratch on AWS/PostgreSQL or build on top of a fully-managed developer platform (Supabase/Vercel)?',
    options: ['Custom Cloud Infrastructure', 'Managed Serverless Platform'],
    priorities: 'Speed to market, vendor lock-in avoidance, maintenance overhead, team bandwidth',
    context: 'Small engineering team of 3 developers. We need to reach enterprise pilots within 4 months.',
  },
  {
    id: 'relocation',
    category: 'Lifestyle & Relocation',
    title: 'Stay in Current Hometown vs. Relocate to Major Tech Hub',
    dilemma: 'Should I relocate across the country to a major tech metropolis (higher cost of living, dense network) or stay remote in my lower cost-of-living hometown near close family?',
    options: ['Relocate to Tech Metropolis', 'Stay Remote in Hometown'],
    priorities: 'Career serendipity, proximity to family, monthly savings rate, psychological grounding',
    context: 'Currently 29 years old, single, working remotely with permission to relocate if desired.',
  },
];
