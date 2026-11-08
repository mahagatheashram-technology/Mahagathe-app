/** Source: https://github.com/mahagatheashram-technology/guna-profile
 * Commit: 2f6b99d99df53073f1c920ad1e65a0d015ac2a1b; src/data/recommendations.ts. Logic and content unchanged; imports localized.
 */
import { Guna } from "./questions";

export interface GunaContent {
  interpretation: string;
  showsUpAs: string[];
  workAlignment: string[];
  foodAlignment: string[];
  dailyRhythm: string[];
  socialFit: string[];
  learningFit: string[];
  careerFit: string[];
  frictionPatterns: string[];
  alignedActions: string[];
  environmentFit: string[];
}

export const gunaContent: Record<Guna, GunaContent> = {
  sattva: {
    interpretation: "You tend to function best through clarity, steadiness, order, and meaningful engagement. Your natural rhythm favours depth over speed, and you draw energy from environments that feel purposeful and composed.",
    showsUpAs: [
      "You gravitate toward structured, meaningful work",
      "You prefer thinking before acting",
      "You seek calm, ordered environments",
      "You value sincerity in relationships",
      "You eat and live with a preference for simplicity",
    ],
    workAlignment: ["Thoughtful planning", "Research", "Teaching", "Mentoring", "Advisory roles", "Ethical leadership", "Structured creative work"],
    foodAlignment: ["Fresh, home-prepared meals", "Light to moderate portions", "Regular eating rhythm", "Simple seasoning", "Food that leaves you clear rather than heavy"],
    dailyRhythm: ["Steady morning routines", "Defined work blocks", "Quiet transition periods", "Consistent sleep patterns", "Minimal late-night stimulation"],
    socialFit: ["Small, trusted groups", "Calm discussion settings", "Honest, low-drama communication", "Meaningful one-on-one conversations", "Values-aligned communities"],
    learningFit: ["Deep reading", "Structured courses", "Meaning-driven study", "Reflective journaling", "Mentorship-based learning"],
    careerFit: ["Education", "Research institutions", "Non-profit leadership", "Consulting", "Writing and publishing", "Wellness and advisory"],
    frictionPatterns: ["Chaotic competitive environments", "Constant urgency without purpose", "Aggressive workplace culture", "High-noise, high-interruption settings", "Reward systems based solely on speed"],
    alignedActions: ["Choose work with clarity, meaning, and structure", "Prefer steady routines over chaotic switching", "Keep your environment orderly and quiet", "Take on roles that require reflection and fairness", "Work in settings where values matter"],
    environmentFit: ["Clean, well-lit spaces", "Quiet offices or home setups", "Natural light and minimal clutter", "Warm, neutral colour palettes", "Spaces that feel intentional"],
  },
  rajas: {
    interpretation: "You tend to function best through motion, ambition, stimulation, challenge, and visible outcomes. Your energy runs high, and you thrive when there is something to chase, build, or win.",
    showsUpAs: [
      "You are energized by juggling multiple goals",
      "You decide fast and course-correct on the move",
      "You thrive under challenge and competition",
      "You enjoy bold, stimulating experiences",
      "You prefer high-energy social environments",
    ],
    workAlignment: ["Execution-heavy roles", "Sales and business development", "Leadership under pressure", "Operations management", "Competitive environments", "Goal-driven projects", "Fast-moving teams"],
    foodAlignment: ["Flavour-rich, energizing meals", "Varied and bold cuisine", "Meals that fuel activity", "Moderate stimulation", "Eating as part of social energy"],
    dailyRhythm: ["Action-packed mornings", "Multiple task blocks", "High-output sprints", "Active recovery through movement", "Flexible but productive schedules"],
    socialFit: ["Active professional networks", "Group momentum and collaboration", "Debate and spirited engagement", "High-energy peers", "Competitive camaraderie"],
    learningFit: ["Goal-tied courses", "Competitive learning environments", "Practical, outcome-driven study", "Learning by doing", "Short, intense skill bursts"],
    careerFit: ["Startups", "Sales organisations", "Trading and finance", "Sports management", "Event production", "Entrepreneurship"],
    frictionPatterns: ["Long passive waiting periods", "Overly slow bureaucratic systems", "Undefined or vague goals", "Low-accountability teams", "Environments that penalise initiative"],
    alignedActions: ["Pursue roles with visible progress and reward", "Channel energy into structured goals", "Surround yourself with driven, active people", "Use competition as fuel, not anxiety", "Build in recovery to sustain your pace"],
    environmentFit: ["Dynamic, buzzing workplaces", "Open-plan or co-working spaces", "Environments with visible progress boards", "Settings that match your pace", "Spaces where energy is welcome"],
  },
  tamas: {
    interpretation: "You tend to function through stability-seeking, familiarity, lower activation, and reduced stimulation. Your system conserves energy and gravitates toward the known. This is a real operating pattern with its own strengths and needs.",
    showsUpAs: [
      "You prefer familiar routines and low-pressure settings",
      "You delay action until external pressure builds",
      "You withdraw when overwhelmed rather than escalate",
      "You favour comfort and consistency over novelty",
      "You function well in predictable, stable environments",
    ],
    workAlignment: ["Stable, predictable environments", "Repetitive tasks with clear expectations", "Low-volatility routines", "Roles with predictable flow", "Physical consistency over frequent switching"],
    foodAlignment: ["Comfort-oriented, familiar meals", "Heavier meals in moderation", "Foods you know and trust", "Routines that reduce decision fatigue", "Simple preparation over elaborate cooking"],
    dailyRhythm: ["Slow, gradual mornings", "Fewer task switches per day", "Extended rest and downtime", "Predictable weekly rhythms", "Minimal sudden schedule changes"],
    socialFit: ["Familiar, trusted people", "Smaller circles", "Lower-pressure gatherings", "Reduced social performance demand", "Relationships built on comfort and safety"],
    learningFit: ["Structured, guided courses", "Repetition-based learning", "Clear step-by-step instructions", "Low-pressure study environments", "Familiar formats and tools"],
    careerFit: ["Government roles", "Administrative positions", "Maintenance and operations", "Archival and record-keeping", "Steady-state manufacturing", "Support roles with clear scope"],
    frictionPatterns: ["Constant change and reorganisation", "Fast-switching multi-role demands", "High-pressure visibility and performance", "Multi-task overload", "Chaotic decision environments"],
    alignedActions: ["Choose environments with clear, stable expectations", "Build routines that reduce daily decision-making", "Work in roles where consistency is valued", "Allow yourself adequate rest without guilt", "Start small — momentum builds from tiny steps"],
    environmentFit: ["Quiet, familiar spaces", "Low-stimulation settings", "Warm, comfortable surroundings", "Predictable layouts", "Spaces that feel safe and unhurried"],
  },
};

export const blendInterpretations: Record<string, string> = {
  "sattva-rajas": "You combine clarity and structure with drive and execution. You think before acting but act with force when ready. Your pattern blends purposeful reflection with ambitious output.",
  "rajas-sattva": "You combine drive and ambition with an underlying pull toward clarity and meaning. You move fast but prefer your speed to serve something worthwhile.",
  "rajas-tamas": "You combine bursts of intense drive with periods of deep withdrawal. Your energy tends to cycle between high output and necessary recovery. Both sides are real.",
  "tamas-rajas": "You operate from a stable, low-activation base but carry the capacity for focused bursts of energy. You are not passive — you conserve until action matters.",
  "sattva-tamas": "You combine a pull toward clarity and meaning with a preference for low stimulation and familiar ground. You value depth and peace over speed and novelty.",
  "tamas-sattva": "You operate from a grounded, stability-seeking base with an underlying thread of thoughtfulness and quiet clarity. You are reflective without needing to be constantly active.",
};
