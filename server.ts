import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DECISION_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    decisionTitle: {
      type: Type.STRING,
      description: 'Clean, punchy title framing the decision dilemma',
    },
    decisionSummary: {
      type: Type.STRING,
      description: 'An executive summary framing the stakes, primary tensions, and time horizon',
    },
    reversibility: {
      type: Type.STRING,
      description: 'High (Type 2, two-way door) or Low (Type 1, one-way door) or Medium',
    },
    options: {
      type: Type.ARRAY,
      description: 'List of 2 to 4 options being evaluated',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Short unique identifier e.g. opt-1, opt-2' },
          name: { type: Type.STRING, description: 'Concise name of the option' },
          tagline: { type: Type.STRING, description: 'One-sentence essence or thesis of this option' },
          keyTakeaway: { type: Type.STRING, description: 'Key strategic consequence of picking this' },
        },
        required: ['id', 'name', 'tagline', 'keyTakeaway'],
      },
    },
    prosCons: {
      type: Type.ARRAY,
      description: 'Detailed pros and cons for each option',
      items: {
        type: Type.OBJECT,
        properties: {
          optionId: { type: Type.STRING },
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                point: { type: Type.STRING },
                detail: { type: Type.STRING },
                category: { type: Type.STRING },
                impact: { type: Type.INTEGER, description: 'Positive impact score from 1 to 5' },
              },
              required: ['id', 'point', 'detail', 'category', 'impact'],
            },
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                point: { type: Type.STRING },
                detail: { type: Type.STRING },
                category: { type: Type.STRING },
                impact: { type: Type.INTEGER, description: 'Negative impact score from -1 to -5' },
                mitigation: { type: Type.STRING, description: 'How to neutralize or soften this risk' },
              },
              required: ['id', 'point', 'detail', 'category', 'impact', 'mitigation'],
            },
          },
        },
        required: ['optionId', 'pros', 'cons'],
      },
    },
    matrix: {
      type: Type.OBJECT,
      description: 'Direct multi-criteria comparison matrix',
      properties: {
        criteria: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              defaultWeight: { type: Type.INTEGER, description: 'Default importance from 1 to 5' },
              evaluations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    optionId: { type: Type.STRING },
                    score: { type: Type.INTEGER, description: 'Score out of 10 for this criterion' },
                    comment: { type: Type.STRING, description: 'Specific factual reasoning for this score' },
                  },
                  required: ['optionId', 'score', 'comment'],
                },
              },
            },
            required: ['id', 'name', 'description', 'defaultWeight', 'evaluations'],
          },
        },
      },
      required: ['criteria'],
    },
    swot: {
      type: Type.ARRAY,
      description: 'SWOT analysis for each option',
      items: {
        type: Type.OBJECT,
        properties: {
          optionId: { type: Type.STRING },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Internal advantages, direct wins, core competencies',
          },
          weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Internal hurdles, vulnerabilities, skill gaps',
          },
          opportunities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'External tailwinds, market/life timing, serendipity',
          },
          threats: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'External risks, unforeseen blockers, macro risks',
          },
          strategicSummary: { type: Type.STRING },
        },
        required: ['optionId', 'strengths', 'weaknesses', 'opportunities', 'threats', 'strategicSummary'],
      },
    },
    tiebreakerVerdict: {
      type: Type.OBJECT,
      description: 'The definitive tiebreaker recommendation with decision rules',
      properties: {
        recommendedOptionId: { type: Type.STRING },
        confidence: { type: Type.STRING, description: 'High, Moderate, or Razor-Thin' },
        headline: { type: Type.STRING, description: 'Strong, decisive 1-sentence verdict' },
        reasoning: { type: Type.STRING, description: '2-3 paragraphs synthesizing the core trade-off' },
        rulesOfThumb: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING, description: 'e.g. Choose Option A if...' },
              optionId: { type: Type.STRING },
            },
            required: ['condition', 'optionId'],
          },
        },
        blindspot: {
          type: Type.STRING,
          description: 'The subtle or psychological blindspot people usually miss in this decision',
        },
        regretMinimizationTakeaway: {
          type: Type.STRING,
          description: 'Looking back from 10 years in the future, which path minimizes irreversible regret?',
        },
        immediateNextStep: {
          type: Type.STRING,
          description: 'A low-stakes 24-48 hour micro-experiment to test the decision before going all-in',
        },
      },
      required: [
        'recommendedOptionId',
        'confidence',
        'headline',
        'reasoning',
        'rulesOfThumb',
        'blindspot',
        'regretMinimizationTakeaway',
        'immediateNextStep',
      ],
    },
  },
  required: ['decisionTitle', 'decisionSummary', 'reversibility', 'options', 'prosCons', 'matrix', 'swot', 'tiebreakerVerdict'],
};

// API: Analyze Decision
app.post('/api/analyze-decision', async (req: Request, res: Response) => {
  try {
    const { dilemma, optionsInput, priorities, userContext } = req.body;

    if (!dilemma || typeof dilemma !== 'string') {
      res.status(400).json({ error: 'Please provide a decision dilemma statement.' });
      return;
    }

    const systemInstruction = `You are "The Tiebreaker", an expert strategic decision advisor, behavioral economist, and executive thinking partner.
Your mission is to help people make clear, confident, and rigorous decisions without decision paralysis.
Provide an exceptionally high-quality, balanced, and deep analysis of the dilemma.
Generate:
1. Distinct, clearly articulated options (if the user provided options, refine and use them; if only a dilemma was given, deduce 2-3 logical competing options or Yes vs No).
2. Deep Pros & Cons for each option, with concrete impacts and actionable mitigations for every con.
3. A multi-criteria Comparison Matrix with 4 to 6 sharp criteria (e.g. Cost, Time/Effort, Emotional Wellbeing, Career/Strategic Growth, Reversibility, Downside Risk).
4. A complete SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for each option.
5. A decisive "Tiebreaker Verdict" that cuts through the noise, provides practical "If/Then" decision rules, uncovers hidden psychological blind spots, and applies Jeff Bezos's Regret Minimization framework.

Be specific, realistic, objective, and eliminate fluff.`;

    const userPrompt = `Dilemma: "${dilemma}"
${optionsInput ? `Provided Options: ${JSON.stringify(optionsInput)}` : 'Options: Please formulate the 2 or 3 best competing options.'}
${priorities ? `User Priorities & Constraints: "${priorities}"` : ''}
${userContext ? `Additional Context: "${userContext}"` : ''}

Analyze this thoroughly and provide the complete JSON structured analysis according to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: DECISION_ANALYSIS_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received empty response from Gemini model');
    }

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing decision:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze decision. Please check your network and API credentials.',
    });
  }
});

// API: Devil's Advocate / Pre-Mortem Stress Test
app.post('/api/devils-advocate', async (req: Request, res: Response) => {
  try {
    const { dilemma, chosenOptionName, options } = req.body;

    if (!chosenOptionName) {
      res.status(400).json({ error: 'Chosen option name is required.' });
      return;
    }

    const prompt = `Conduct a rigorous "Pre-Mortem" and Devil's Advocate stress-test on this decision.
Dilemma: "${dilemma}"
Option being challenged: "${chosenOptionName}"
Other competing options considered: ${JSON.stringify(options || [])}

Provide a structured JSON output with:
1. "catastrophicAssumption": The #1 false assumption people make when choosing this option.
2. "failureStory": A realistic 1-year timeline scenario describing how this choice could silently fail or cause deep regret.
3. "counterPunchMitigations": 3 concrete, non-obvious ways to protect against this failure right now.
4. "shouldYouBacktrack": Clear signs/metrics indicating it's time to pivot away if chosen.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            catastrophicAssumption: { type: Type.STRING },
            failureStory: { type: Type.STRING },
            counterPunchMitigations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            pivotIndicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['catastrophicAssumption', 'failureStory', 'counterPunchMitigations', 'pivotIndicators'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error running devil advocate:', error);
    res.status(500).json({ error: error?.message || 'Failed to run devil advocate analysis.' });
  }
});

// API: Scenario Simulation ("What If?")
app.post('/api/simulate-scenario', async (req: Request, res: Response) => {
  try {
    const { dilemma, scenario, options } = req.body;

    if (!scenario) {
      res.status(400).json({ error: 'Scenario description is required.' });
      return;
    }

    const prompt = `Simulate this specific "What-If" scenario for the ongoing decision:
Dilemma: "${dilemma}"
What-If Scenario: "${scenario}"
Options under consideration: ${JSON.stringify(options || [])}

Analyze how this new condition or shock changes the playing field.
Return structured JSON:
- "scenarioImpact": Concise summary of who wins and who loses under this shock.
- "optionImpacts": array of { optionName: string, impactLevel: "Heavily Favored" | "Neutral" | "Heavily Hurt", explanation: string }
- "newRecommendation": string (updated recommendation under this specific scenario)
- "hedgingStrategy": string (how to protect oneself against this scenario regardless of which option is chosen)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioImpact: { type: Type.STRING },
            optionImpacts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING },
                  impactLevel: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['optionName', 'impactLevel', 'explanation'],
              },
            },
            newRecommendation: { type: Type.STRING },
            hedgingStrategy: { type: Type.STRING },
          },
          required: ['scenarioImpact', 'optionImpacts', 'newRecommendation', 'hedgingStrategy'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error simulating scenario:', error);
    res.status(500).json({ error: error?.message || 'Failed to simulate scenario.' });
  }
});

// Setup server and frontend handling
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
