export const DEFAULT_NUM_PREDICTIONS = 10;
export const PREDICTOR_ENVIRONMENTS = ["firefox", "chrome", "v8"] as const;

export type PredictorEnvironment = (typeof PREDICTOR_ENVIRONMENTS)[number];

export interface PredictorArgs {
  environment: PredictorEnvironment;
  sequence?: number[];
  predictions?: number;
}

export type OptionalResults = {
  actual: number[] | string;
  isCorrect?: boolean;
};

export type PredictorResult = OptionalResults & {
  sequence: number[];
  predictions: number[];
};

export class SequenceNotFoundError extends Error {
  constructor(message = "'--sequence' is only optional when '--environment' is 'v8'.") {
    super(message);
    this.name = "SequenceNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
