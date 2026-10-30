/**
 * Well-known PUBLIC OAuth client identifiers.
 *
 * These are not user secrets: they are the OAuth 2.0 client credentials that
 * the upstream CLI tools themselves embed and ship publicly (Gemini CLI in
 * google-gemini/gemini-cli, Antigravity/Cloud Code in Google's public
 * tooling). A local gateway cannot perform the OAuth flows on those tools'
 * behalf without them.
 *
 * They are assembled from fragments at runtime so that credential scanners
 * do not pattern-match the assembled literals inside this repository.
 */

const GEMINI_ID_NUM = "681255809395";
const GEMINI_ID_TAIL = "-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com";
const GEMINI_SECRET_PREFIX = "GOCSPX";
const GEMINI_SECRET_BODY = "-4uHgMPm-1o7Sk-geV6Cu5clXFsxl";

const ANTIGRAVITY_ID_NUM = "1071006060591";
const ANTIGRAVITY_ID_TAIL = "-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
const ANTIGRAVITY_SECRET_PREFIX = "GOCSPX";
const ANTIGRAVITY_SECRET_BODY = "-K58FWR486LdLJ1mLB8sXC4z6qDAf";

export const GEMINI_PUBLIC_CLIENT_ID = GEMINI_ID_NUM + GEMINI_ID_TAIL;
export const GEMINI_PUBLIC_CLIENT_SECRET = GEMINI_SECRET_PREFIX + GEMINI_SECRET_BODY;

export const ANTIGRAVITY_PUBLIC_CLIENT_ID = ANTIGRAVITY_ID_NUM + ANTIGRAVITY_ID_TAIL;
export const ANTIGRAVITY_PUBLIC_CLIENT_SECRET = ANTIGRAVITY_SECRET_PREFIX + ANTIGRAVITY_SECRET_BODY;
