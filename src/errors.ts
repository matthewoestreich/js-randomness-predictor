export class UnsatError extends Error {
  constructor(message?: string) {
    message = message === undefined ? "Cannot solve state. Unable to make accurate predictions." : message;
    super(message);
    this.name = "UnsatError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SequenceNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "SequenceNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
