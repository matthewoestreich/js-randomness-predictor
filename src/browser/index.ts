import initZ3 from "z3-solver/build/z3-built.js";
import { Buffer } from "buffer";
import JSRandomnessPredictor from "..";

const { firefox, safari, chrome } = JSRandomnessPredictor;

export default {
  firefox,
  safari,
  chrome,
  init: async (): Promise<void> => {
    window.Buffer = Buffer;
    window.initZ3 = initZ3;
  },
};
