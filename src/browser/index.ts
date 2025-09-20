import { Buffer } from "buffer";
import JSRandomnessPredictor from "..";

const { firefox, safari, chrome } = JSRandomnessPredictor;

export default {
  firefox,
  safari,
  chrome,
  init: async (): Promise<void> => {
    window.Buffer = Buffer;
  },
};
