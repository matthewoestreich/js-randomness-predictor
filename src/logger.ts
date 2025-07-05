function redText(text: string): string {
  return `\x1b[31m${text}\x1b[0m`;
}

function yellowText(s: string): string {
  return `\x1b[33m${s}\x1b[0m`;
}

export default class Logger {
  static info(...messages: string[]) {
    console.info(`[INFO] ${messages.join(" ")}`);
  }
  static log(...messages: string[]) {
    console.log(`[LOG] ${messages.join(" ")}`);
  }
  static warn(...messages: string[]) {
    console.warn(yellowText(`[WARN] ${messages.join(" ")}`));
  }
  static error(...messages: string[]) {
    console.error(redText(`[ERROR] ${messages.join(" ")}`));
  }
}
