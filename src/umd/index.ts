import { firefox, safari, chrome } from "../index.js";
import loader from "./loader.js";

// Invoke immediately upon page load.
loader();

export default {
  firefox,
  safari,
  chrome,
};
