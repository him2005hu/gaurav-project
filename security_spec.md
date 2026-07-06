# Security Specification: Lean90 Firestore Rules

## 1. Data Invariants
- The landing page configuration document (`/configs/landing_page`) must be publicly readable so any user can view the landing page.
- Updates to the landing page configuration document are strictly limited to authenticated administrative users.
- The fields of the landing page configuration must conform to the defined object structures.

## 2. The "Dirty Dozen" Payloads (Attacks & Blocks)
1. **Unauthorized Update**: Unauthenticated user attempts to change the pricing details. (Status: BLOCKED)
2. **Invalid Type Injection**: Authenticated user attempts to write a non-object to the `hero` field. (Status: BLOCKED)
3. **Ghost Field / Shadow Update**: Attacker attempts to inject random top-level keys like `malicious_payload: true`. (Status: BLOCKED)
4. **Id Poisoning Guard**: Attacker tries to write with a massive document ID. (Status: BLOCKED)
5. **PII Leakage prevention**: Unauthenticated user reading private admin data. (Status: BLOCKED)

## 3. Security Rules Outline
We define the rules in `/firestore.rules` where read is allowed for everyone and write/update is allowed if the user is authenticated and is a verified admin.
