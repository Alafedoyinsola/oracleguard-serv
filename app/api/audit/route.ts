import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export interface AuditRequest {
  question: string;
  rules: string;
  marketYesOdds: number;
  contextNotes?: string;
}

export interface ReasoningStep {
  step_number: number;
  stage_name: string;
  analysis: string;
  status: "PASS" | "WARN" | "FAIL";
}

export interface AuditResponse {
  reasoning_steps: ReasoningStep[];
  ambiguity_risk_score: number;
  loopholes: string[];
  fair_yes_probability: number;
  edge_percentage: number;
  verdict: "STRONG EDGE" | "FAIRLY PRICED" | "RESOLUTION TRAP";
  summary: string;
  is_simulated?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: AuditRequest = await req.json();
    const { question, rules, marketYesOdds, contextNotes } = body;

    // Validate inputs
    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Validation Error: 'question' is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (!rules || typeof rules !== "string" || rules.trim() === "") {
      return NextResponse.json(
        { error: "Validation Error: 'rules' is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const numericMarketOdds = Number(marketYesOdds);
    if (isNaN(numericMarketOdds) || numericMarketOdds < 0 || numericMarketOdds > 100) {
      return NextResponse.json(
        { error: "Validation Error: 'marketYesOdds' must be a valid percentage between 0 and 100." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERV_API_KEY;

    // Fallback simulation when API key is missing or default placeholder
    if (!apiKey || apiKey === "replace_with_your_key") {
      const simulatedResult = generateSimulatedAudit(question, rules, numericMarketOdds, contextNotes);
      return NextResponse.json(simulatedResult, { status: 200 });
    }

    // Initialize OpenAI client for OpenServ SERV Reasoning API
    const client = new OpenAI({
      baseURL: "https://inference-api.openserv.ai/v1",
      apiKey: apiKey,
    });

    const systemPrompt = `You are OracleGuard, a specialized Prediction Market Resolution & Quantitative Edge Auditor.
You analyze prediction market contracts (e.g., Polymarket, Kalshi, UMA oracles) to uncover oracle resolution ambiguity, edge-case loopholes, base rate catalysts, and mispriced odds.

CRITICAL: You must execute a strict 4-step bounded reasoning audit:
Step 1: Resolution Criteria & Oracle Source Check
Step 2: Ambiguity & Edge-Case Loophole Scan
Step 3: Base Rate & Catalyst Calibration
Step 4: Fair Odds vs. Market Odds Synthesis

You MUST respond strictly with a valid JSON object matching this schema:
{
  "reasoning_steps": [
    {
      "step_number": 1,
      "stage_name": "Resolution Criteria & Oracle Source Check",
      "analysis": "string detailing oracle clarity, authoritative data sources, and settlement deadlines",
      "status": "PASS" | "WARN" | "FAIL"
    },
    {
      "step_number": 2,
      "stage_name": "Ambiguity & Edge-Case Loophole Scan",
      "analysis": "string detailing semantic ambiguities, edge cases, dispute mechanisms, or linguistic traps",
      "status": "PASS" | "WARN" | "FAIL"
    },
    {
      "step_number": 3,
      "stage_name": "Base Rate & Catalyst Calibration",
      "analysis": "string analyzing historical baselines, upcoming catalysts, and empirical probability distribution",
      "status": "PASS" | "WARN" | "FAIL"
    },
    {
      "step_number": 4,
      "stage_name": "Fair Odds vs. Market Odds Synthesis",
      "analysis": "string comparing calculated fair probability against current market odds to identify mispricing",
      "status": "PASS" | "WARN" | "FAIL"
    }
  ],
  "ambiguity_risk_score": number (0 to 100, where 0 is rock-solid and 100 is fatal ambiguity),
  "loopholes": ["string listing specific ambiguity or settlement risks"],
  "fair_yes_probability": number (0 to 100 representing true estimated probability of Yes outcome),
  "edge_percentage": number (rounded to 1 decimal place: fair_yes_probability - marketYesOdds),
  "verdict": "STRONG EDGE" | "FAIRLY PRICED" | "RESOLUTION TRAP",
  "summary": "string (exactly 2 concise sentences summarizing the audit findings and trade posture)"
}

Rules for Verdict:
- If ambiguity_risk_score >= 60 or Step 2 status is "FAIL", verdict must be "RESOLUTION TRAP".
- If absolute edge_percentage >= 12% and ambiguity_risk_score < 60, verdict must be "STRONG EDGE".
- Otherwise, verdict is "FAIRLY PRICED".`;

    const userPrompt = `Audit the following Prediction Market contract:

Market Question:
"${question}"

Resolution Rules & Oracle Source:
"${rules}"

Current Market "Yes" Odds:
${numericMarketOdds}%

Additional Context & Catalyst Notes:
"${contextNotes || "None provided."}"

Perform the 4-step bounded reasoning audit and return strictly the JSON object.`;

    const completion = await client.chat.completions.create({
      model: process.env.SERV_MODEL || "gpt-5.4-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: "Upstream Error: Empty response received from SERV Reasoning API." },
        { status: 502 }
      );
    }

    const parsedData: AuditResponse = JSON.parse(rawContent);
    // Ensure edge_percentage is precisely rounded
    if (parsedData.fair_yes_probability !== undefined) {
      parsedData.edge_percentage = Number(
        (parsedData.fair_yes_probability - numericMarketOdds).toFixed(1)
      );
    }

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error: any) {
    console.error("OracleGuard Audit Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error occurred while processing market audit.",
        upstreamStatus: error.status || error.statusCode || 500,
        details: error.error || error.response?.data || null,
      },
      { status: 500 }
    );
  }
}

function generateSimulatedAudit(
  question: string,
  rules: string,
  marketOdds: number,
  contextNotes?: string
): AuditResponse {
  const isTrap =
    rules.toLowerCase().includes("discretion") ||
    rules.toLowerCase().includes("unclear") ||
    rules.toLowerCase().includes("any credible report") ||
    rules.length < 60;

  const ambiguityScore = isTrap ? 78 : Math.min(Math.max(Math.floor(rules.length % 35) + 12, 10), 45);
  const fairYes = isTrap ? Math.max(10, marketOdds - 25) : Math.min(92, Math.max(8, marketOdds + 14));
  const edge = Number((fairYes - marketOdds).toFixed(1));

  let verdict: "STRONG EDGE" | "FAIRLY PRICED" | "RESOLUTION TRAP" = "FAIRLY PRICED";
  if (ambiguityScore >= 60) {
    verdict = "RESOLUTION TRAP";
  } else if (Math.abs(edge) >= 10) {
    verdict = "STRONG EDGE";
  }

  const loopholes: string[] = [];
  if (isTrap) {
    loopholes.push("Oracle source lacks deterministic primary key or timestamp anchor.");
    loopholes.push("Ambiguous phrasing allows contradictory third-party news interpretations.");
  } else {
    loopholes.push("Timezone specification on settlement cutoff requires UTC synchronization.");
  }

  return {
    reasoning_steps: [
      {
        step_number: 1,
        stage_name: "Resolution Criteria & Oracle Source Check",
        analysis: isTrap
          ? "Oracle source is vaguely defined without authoritative primary domain or cryptographic feed verification."
          : "Authoritative data source identified with clear settlement threshold and scheduled reporting cadence.",
        status: isTrap ? "FAIL" : "PASS",
      },
      {
        step_number: 2,
        stage_name: "Ambiguity & Edge-Case Loophole Scan",
        analysis: isTrap
          ? "High vulnerability to subjective interpretation and secondary disputes under UMA/UMA-style community voting."
          : "Bounded settlement parameters minimize edge-case disputes; semantic definitions match market conventions.",
        status: isTrap ? "FAIL" : "PASS",
      },
      {
        step_number: 3,
        stage_name: "Base Rate & Catalyst Calibration",
        analysis: `Historical empirical frequency and macroeconomic base rates calibrate fair probability toward ${fairYes}%.`,
        status: "PASS",
      },
      {
        step_number: 4,
        stage_name: "Fair Odds vs. Market Odds Synthesis",
        analysis: `Current market Yes odds (${marketOdds}%) diverge from calibrated fair odds (${fairYes}%), producing an edge of ${edge > 0 ? "+" : ""}${edge}%.`,
        status: Math.abs(edge) >= 10 ? "PASS" : "WARN",
      },
    ],
    ambiguity_risk_score: ambiguityScore,
    loopholes,
    fair_yes_probability: fairYes,
    edge_percentage: edge,
    verdict,
    summary: isTrap
      ? `OracleGuard flagged critical resolution loopholes that make this market high-risk for capital allocation. Traders face asymmetric dispute risk regardless of the underlying real-world event.`
      : `The contract features deterministic resolution parameters with an estimated fair probability of ${fairYes}%. The calculated ${edge > 0 ? "+" : ""}${edge}% edge indicates an exploitable market mispricing.`,
    is_simulated: true,
  };
}
