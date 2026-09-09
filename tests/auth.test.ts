import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { hashSessionToken } from "../src/lib/auth/token";

test("password hashes are salted and verify only the matching password", async () => {
  const password = "focus-plan-1234";
  const first = await hashPassword(password);
  const second = await hashPassword(password);

  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("wrong-password-1234", first), false);
  assert.equal(await verifyPassword(password, "invalid"), false);
});

test("session tokens are stored as deterministic hashes, not plaintext", () => {
  const token = "plain-session-token";
  const hash = hashSessionToken(token);

  assert.notEqual(hash, token);
  assert.equal(hash, hashSessionToken(token));
  assert.notEqual(hash, hashSessionToken(`${token}-other`));
});
