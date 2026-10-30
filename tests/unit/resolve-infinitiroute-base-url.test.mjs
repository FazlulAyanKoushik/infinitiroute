import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_INFINITIROUTE_BASE_URL,
  resolveInfinitiRouteBaseUrl,
} from "../../src/shared/utils/resolveInfinitiRouteBaseUrl.ts";

test("resolveInfinitiRouteBaseUrl prefers INFINITIROUTE_BASE_URL", () => {
  assert.equal(
    resolveInfinitiRouteBaseUrl({
      INFINITIROUTE_BASE_URL: "https://internal.example.com/",
      BASE_URL: "https://base.example.com",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://internal.example.com"
  );
});

test("resolveInfinitiRouteBaseUrl falls back to BASE_URL", () => {
  assert.equal(
    resolveInfinitiRouteBaseUrl({
      BASE_URL: "https://base.example.com/",
      NEXT_PUBLIC_BASE_URL: "https://public.example.com",
    }),
    "https://base.example.com"
  );
});

test("resolveInfinitiRouteBaseUrl falls back to NEXT_PUBLIC_BASE_URL", () => {
  assert.equal(
    resolveInfinitiRouteBaseUrl({
      NEXT_PUBLIC_BASE_URL: "https://public.example.com/",
    }),
    "https://public.example.com"
  );
});

test("resolveInfinitiRouteBaseUrl ignores blank values", () => {
  assert.equal(
    resolveInfinitiRouteBaseUrl({
      INFINITIROUTE_BASE_URL: "   ",
      BASE_URL: "",
      NEXT_PUBLIC_BASE_URL: " https://public.example.com/ ",
    }),
    "https://public.example.com"
  );
});

test("resolveInfinitiRouteBaseUrl uses the default localhost fallback", () => {
  assert.equal(resolveInfinitiRouteBaseUrl({}), DEFAULT_INFINITIROUTE_BASE_URL);
});
