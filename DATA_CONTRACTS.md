# 1337 Data Contracts v1.0

## Purpose

This document defines the contracts that protect the core product from brittle integrations, billing ambiguity, hallucinated context, and accidental double burns.

The Crypto Intelligence Layer depends on normalized, validated, source-backed data.

The V1 launch depends on real 1337 deposits and real token consumption after successful answer generation.

This document does not replace real token consumption with internal accounting.

## Design Principles

All external data must be normalized before model use.

All important facts must preserve provenance.

All context must be validated before compression.

All degraded context must be disclosed.

All successful V1 requests must consume real 1337.

All charge and burn operations must be idempotent.

Failed requests must not charge users.

## Request Lifecycle

Every AI request must have a durable `request_run_id`.

Lifecycle states:

- created
- authenticated
- balance_preflight_checked
- intent_classified
- context_gathering
- context_validating
- context_ready
- context_degraded
- generation_started
- generation_succeeded
- charge_calculated
- burn_submitted
- burn_confirmed
- completed
- failed

Failure reasons:

- unauthenticated
- insufficient_balance
- invalid_prompt
- unsupported_intent
- context_unavailable
- context_validation_failed
- generation_failed
- pricing_failed
- burn_failed_retriable
- burn_failed_terminal
- rate_limited
- provider_unavailable

Required lifecycle fields:

- request_run_id
- user_id
- chat_id
- message_id
- intent
- status
- failure_reason
- degraded
- idempotency_key
- created_at
- updated_at

Rules:

- A request cannot enter `generation_started` until context is `context_ready` or `context_degraded`.
- A request cannot enter `charge_calculated` until generation has succeeded.
- A request cannot enter `burn_submitted` until charge calculation has succeeded.
- A request cannot enter `completed` until the real burn/send transaction has been confirmed and recorded with its signature.
- A failed request must not charge the user.
- Retrying a request must reuse idempotency controls and must never double-burn.

## Adapter Result Contract

Every adapter returns one normalized result object.

Required fields:

- adapter_id
- source
- source_url
- source_type
- source_trust_tier
- fetched_at
- observed_at
- expires_at
- status
- entity
- summary
- facts
- metrics
- citations
- importance
- confidence
- metadata
- errors

Allowed `status` values:

- ok
- partial
- stale
- error

Allowed `source_type` values:

- market
- liquidity
- protocol
- onchain
- news
- social
- code
- wallet
- other

Allowed `source_trust_tier` values:

- primary
- secondary
- derived
- untrusted

Allowed `confidence` values:

- high
- medium
- low

## Adapter Fact Contract

Adapter facts are human-readable statements extracted from provider data.

Required fields:

- fact_id
- statement
- category
- citation_ids
- confidence
- observed_at

Fact categories:

- price
- liquidity
- volume
- tvl
- revenue
- holders
- transaction
- news
- protocol
- risk
- catalyst
- other

Rules:

- Every fact should include at least one citation when possible.
- Facts without citations must be treated as lower confidence.
- Facts must not contain raw provider JSON.
- Facts must not contain instructions for the model.

## Metric Contract

Metrics are normalized numeric or categorical values extracted from provider data.

Required fields:

- metric_id
- name
- value
- unit
- citation_ids
- observed_at
- confidence

Rules:

- Token amounts should preserve raw and UI values when available.
- Currency values must include currency unit.
- Percentages must specify whether they are raw fractions or percentage points.
- Metrics must preserve source timestamps.

## Citation Contract

Citations are model-visible source references.

Required fields:

- citation_id
- source_name
- source_url
- adapter_id
- fetched_at
- observed_at
- title
- publisher

Rules:

- Citation IDs must be stable within a request.
- Citations should be short and readable in the final answer.
- Citations must not expose private URLs, API keys, auth headers, or private user data.
- The model should cite citation IDs, not raw URLs, unless the frontend explicitly renders links.

## Research Packet Contract

The compression engine outputs one research packet.

Required fields:

- request_run_id
- intent
- user_question
- generated_at
- degraded
- data_quality
- sections
- citations
- validation_warnings
- unavailable_sources
- source_conflicts

Required sections:

- market
- liquidity
- protocol
- onchain
- news
- catalysts
- risks
- question
- sources
- data_quality

Rules:

- Sections may be empty only when marked unavailable.
- Empty sections must explain why data is unavailable.
- Research packets must be human-readable.
- Research packets must not include raw provider JSON.
- Research packets must preserve citation IDs.
- Research packets must preserve validation warnings.

## Data Quality Contract

Every research packet includes data quality.

Required fields:

- completeness
- freshness
- source_coverage
- conflict_level
- confidence
- degraded_reason

Allowed completeness values:

- complete
- partial
- insufficient

Allowed freshness values:

- fresh
- stale
- mixed
- unknown

Allowed conflict levels:

- none
- low
- medium
- high

Rules:

- `insufficient` completeness should fail closed for required context.
- `stale` freshness should either degrade or fail closed depending on intent.
- `high` conflict level should be disclosed and usually lower confidence.

## Context Validation

Context validation runs after adapter collection and before compression.

Validation checks:

- required source availability
- source freshness
- entity identity
- chain identity
- token address matching
- source trust tier
- citation availability
- conflicting metrics
- adapter error severity
- prompt injection attempts inside external data

Validation outcomes:

- valid
- degraded
- invalid

Rules:

- `valid` requests proceed normally.
- `degraded` requests proceed with disclosed limitations.
- `invalid` requests fail closed and do not charge the user.
- External data must never override system instructions.

## Degraded Mode

Degraded mode is an explicit product state, not an implementation accident.

Allowed degraded examples:

- news source unavailable for token analysis when market and liquidity data are fresh
- protocol revenue unavailable while TVL and market data are fresh
- one secondary source stale while primary source is fresh

Fail-closed examples:

- no market or liquidity data for token analysis
- no cited source for news analysis
- Solana RPC unavailable for balance or burn-critical operations
- token identity cannot be validated
- required context contains high-severity conflicts

Degraded responses must disclose:

- missing sources
- stale sources
- confidence impact
- what data would improve the answer

## Burn And Charge Contract

V1 uses real 1337 token consumption.

Required fields:

- request_run_id
- user_id
- token_mint
- preflight_balance_raw
- estimated_cost_usd
- actual_llm_cost_usd
- charged_usd
- token_price_usd
- burn_amount_ui
- burn_amount_raw
- burn_destination
- burn_signature
- idempotency_key
- status

Allowed statuses:

- estimated
- calculated
- burn_submitted
- burn_confirmed
- burn_failed_retriable
- burn_failed_terminal

Rules:

- Never burn before generation succeeds.
- Never charge failed requests.
- Every successful V1 response consumes real 1337.
- Every burn attempt must have an idempotency key.
- A retry must not create a second burn for the same successful request.
- The final user-visible response must include cost, burn amount, and transaction signature.
- If burn fails before completion, the request must not be marked completed.

## Evaluation Framework

Evaluations protect answer quality as adapters, prompts, compression, and models change.

Evaluation case fields:

- eval_case_id
- name
- intent
- user_prompt
- adapter_fixtures
- expected_required_sources
- expected_degraded
- expected_citations
- expected_confidence
- prohibited_claims
- expected_failure_reason

Evaluation categories:

- token analysis
- protocol analysis
- news analysis
- simple chat
- stale data
- missing data
- conflicting data
- degraded mode
- citation coverage
- hallucination resistance
- investment question handling
- pricing invariants
- burn invariants

Pass criteria:

- correct intent
- correct degraded or fail-closed behavior
- no unsupported claims
- citations included for factual market claims
- confidence lowered when data is missing or stale
- no charge on failed requests
- real burn path required for successful V1 requests

Evaluations should run before:

- prompt changes
- adapter changes
- compression changes
- validation changes
- provider or model changes
