declare global {
  interface Window {
    // eslint-disable-next-line
    initZ3: (moduleArg?: {}) => any;
  }
}

export {};
