# ADR-008 – Password Hashing Strategy

## Status

Accepted

## Date

2026-10

## Context

FlowOps requires a secure, production-ready password hashing strategy for user authentication.

The target deployment runtime is Cloudflare Workers (`workerd`). This runtime imposes specific constraints:
- Native C++/Rust Node.js addons (`.node`) are unsupported, ruling out standard npm packages like `argon2` or `@node-rs/argon2`.
- WebAssembly (WASM) packages for Argon2 either suffer from compatibility issues with the Workers V8 sandbox or rely on unofficial, unvetted community wrappers.
- The Web Crypto API (`crypto.subtle`) is natively implemented in Cloudflare Workers and fully supported without external dependencies.

According to the OWASP Password Storage Cheat Sheet, PBKDF2-HMAC-SHA-256 with at least 600,000 iterations is a standardized, secure key derivation function suitable for password hashing when memory-hard functions like Argon2id are not available natively.

## Decision

FlowOps will use PBKDF2-HMAC-SHA-256 via the native Web Crypto API for all password hashing and verification operations.

Key technical specifications:
- **Algorithm:** PBKDF2 with HMAC-SHA-256
- **Work factor:** 600,000 iterations (OWASP recommendation)
- **Salt:** 32 cryptographically secure random bytes generated via `crypto.getRandomValues`
- **Derived key length:** 256 bits (32 bytes)
- **Storage format:** `pbkdf2:sha256:<iterations>:<salt-base64url>:<hash-base64url>`
- **Verification:** Constant-time comparison using bitwise XOR to mitigate timing attacks; iteration count is read from the stored record to support future parameter upgrades.
- **Minimum password length:** 12 characters, enforced server-side.

## Consequences

### Positive
- **Zero dependencies:** Relies entirely on the native Web Crypto API (`crypto.subtle`), eliminating external dependencies and maintenance overhead.
- **Full Workers compatibility:** Guaranteed compatibility with Cloudflare Workers runtime and Vitest runner without polyfills or build-step workarounds.
- **Extensible format:** Self-describing storage format allows seamless future iteration count adjustments without schema changes.
- **OWASP compliant:** Adheres to current security guidelines for PBKDF2 implementations.

### Negative / Trade-offs
- **Lack of memory hardness:** PBKDF2 is not memory-hard compared to Argon2id, making it less resistant to specialized hardware (ASICs/GPUs). This is compensated for by the high iteration count (600,000) and a minimum password length of 12 characters.
- **CPU time:** 600,000 iterations consume approximately 100–300 ms of CPU time per operation, which is well within Cloudflare Workers limits (30s) but must be considered for rate-limiting.