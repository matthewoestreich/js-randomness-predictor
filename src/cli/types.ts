export const DEFAULT_NUM_PREDICTIONS = 10;
export const PREDICTOR_ENVIRONMENTS = ["firefox", "chrome", "v8"] as const;
export const ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24] as const;

export type PredictorEnvironment = (typeof PREDICTOR_ENVIRONMENTS)[number];
export type NodeJsMajorVersion = (typeof ALL_POSSIBLE_NODEJS_MAJOR_VERSIONS)[number];

export interface PredictorArgs {
  environment: PredictorEnvironment;
  sequence?: number[];
  envVersion?: NodeJsMajorVersion;
  predictions?: number;
}

export type PredictorResult = {
  sequence: number[];
  predictions: number[];
  actual: string | number[];
  isCorrect?: boolean;
};

export class SequenceNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "SequenceNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
