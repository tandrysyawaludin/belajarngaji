import { getStrings } from "./i18n";

/** Default Indonesian strings for server metadata and static fallbacks. */
export const strings = getStrings("id");

export { formatString, getStrings, type Locale, type Strings, type StringKey } from "./i18n";
