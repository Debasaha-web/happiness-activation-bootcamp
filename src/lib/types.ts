// Shared payload types between client flow components and the API.

export type Block = "am" | "pm";

export type Exercise =
  | "neuro_tagging"
  | "ras"
  | "verbal_encoding"
  | "neuro_journaling"
  | "mindset_bursting";

export type Format = "text" | "tf" | "dropdown" | "voice" | "burst";

/** One answered prompt, sent from the client to /api/responses. */
export type AnswerPayload = {
  promptKey: string;
  exercise: Exercise;
  format: Format;
  scenarioTied: boolean;
  valueText?: string | null;
  valueBool?: boolean | null;
  valueChoice?: string | null;
};

export type SaveRequest = {
  day: number;
  block: Block;
  answers: AnswerPayload[];
  /** When true, marks the block complete and advances the day if PM. */
  complete?: boolean;
};
