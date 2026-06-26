# 1337 Engineering Specification v1.1

## Goal

Build a production-ready crypto intelligence platform that is modular, scalable, and AI-provider agnostic over time.

The backend must eventually be capable of swapping LLM providers without changing the frontend or business logic.

For V1, use one hosted LLM provider behind a provider interface.

Do not build dynamic provider routing for V1.

The Crypto Intelligence Layer is the core product.

## Tech Stack

Frontend:

- Next.js App Router
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion

Hosting:

- Vercel

Backend:

- Next.js Route Handlers
- Railway Workers later if needed

Database:

- Supabase PostgreSQL

Authentication:

- Privy preferred
- Supabase Auth acceptable for MVP if Privy slows launch

Caching:

- Redis / Upstash later
- In-memory or Supabase cache acceptable for MVP

Crypto:

- Solana
- @solana/web3.js
- @solana/spl-token

LLM:

Launch:

- One hosted reasoning provider
- One provider interface
- One fast model tier if needed
- One reasoning model tier if needed

Future:

- Model Router
- Dynamic provider selection

## Repository Structure

- `/app`
- `/components`
- `/lib`
- `/lib/auth`
- `/lib/context`
- `/lib/validation`
- `/lib/router`
- `/lib/pricing`
- `/lib/crypto`
- `/lib/llm`
- `/lib/adapters`
- `/lib/evals`
- `/workers`
- `/supabase`
- `/public`

## Core Architecture

User

Frontend

API Route

Request Lifecycle State Machine

Intent Engine

Crypto Intelligence Layer

Context Validation

Compression Engine

Citation Builder

Single V1 LLM Provider Interface

LLM

Pricing Engine

Real 1337 Burn/Send

Answer

## Request Lifecycle State Machine

Every AI request must be tracked through explicit lifecycle states.

Required states:

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

Required failure reasons:

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

Rules:

- Never charge failed requests.
- Never burn before answer generation succeeds.
- Do not disclose a generated answer as completed unless the real burn/send transaction has been confirmed and recorded.
- Every lifecycle transition must be timestamped.
- Every burn attempt must be idempotent.
- Retrying a request must never double-burn the user.

The complete contract lives in `DATA_CONTRACTS.md`.

## Intent Engine

Every prompt is classified.

Current intents:

- General
- Token Analysis
- Wallet Analysis
- Protocol Research
- Portfolio
- Narrative
- News

Future intents:

- Agent
- API

The intent engine must also determine required context classes and minimum source requirements.

Example:

- Token Analysis requires market and liquidity context.
- Protocol Research requires protocol, adoption, revenue or TVL context when available.
- News requires cited source context.

## Crypto Intelligence Layer

The intelligence layer gathers external information before the LLM receives the prompt.

Current adapters:

- DexScreener
- CoinGecko
- DefiLlama
- Helius
- Hyperliquid
- News

Future adapters:

- Twitter
- Telegram
- Discord
- GitHub
- Nansen
- Arkham

Adapters are independent modules.

Adapters may fail independently without forcing the entire request to fail unless the missing adapter is required for the classified intent.

## Adapter Contract

Every adapter must return a normalized adapter result.

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

Allowed statuses:

- ok
- partial
- stale
- error

No adapter may return raw JSON directly to the model.

Raw provider responses may be stored server-side for debugging only when safe, but they must not be passed directly into the prompt.

The full schema lives in `DATA_CONTRACTS.md`.

## Context Validation

Context validation runs after adapters complete and before compression.

Validation responsibilities:

- verify required sources for the classified intent
- verify freshness windows
- detect stale data
- detect missing data
- detect conflicting facts across sources
- validate token identity and chain identity
- preserve source citations
- assign confidence and completeness scores
- decide whether the request can proceed normally, proceed degraded, or fail closed

Context validation must prefer explicit uncertainty over silent assumptions.

If validation fails for required context, the request fails and the user is not charged.

## Degraded Mode

Degraded mode is allowed when some non-critical context is missing, stale, or partial but enough validated context remains to answer honestly.

Degraded responses must:

- disclose missing or stale sources
- lower confidence
- avoid unsupported claims
- include available citations
- explain what data would improve confidence

Degraded mode is not allowed when the missing source is required for the intent.

Example:

- Token analysis can proceed without news if market and liquidity context are fresh.
- Token analysis should fail closed if market and liquidity context are unavailable.
- News analysis should fail closed if no cited news source is available.

## Compression Engine

Input:

Many normalized adapter outputs.

Output:

Single structured research packet.

Sections:

- Market
- Liquidity
- Protocol
- On-chain
- News
- Catalysts
- Risks
- Question
- Sources
- Data Quality

The compression engine must:

- remove unnecessary data
- preserve important facts
- preserve citations
- preserve source freshness
- preserve validation warnings
- expose missing context
- expose conflicts
- produce human-readable context

The compression engine should synthesize adapter outputs without hiding provenance.

## Citation Builder

Every factual claim derived from external context should be traceable to at least one citation.

Citations must include:

- citation_id
- source_name
- source_url when available
- fetched_at
- observed_at when available
- adapter_id

The LLM receives citation IDs inside the research packet.

The frontend should display readable source names and links when available.

## LLM Provider Interface

V1 uses one hosted LLM provider.

The code should still isolate provider-specific request and response handling behind one interface.

The interface should support:

- model name
- input messages
- structured context
- temperature or reasoning controls when supported
- token usage
- actual cost calculation inputs
- provider request ID
- errors

Do not implement dynamic multi-provider routing in V1.

## Model Router

For V1, the model router is a thin model-selection layer for one provider.

Current routing:

General Chat

Fast model

Token Research

Reasoning model

Deep Research

Highest available reasoning model within the same provider

Future:

Dynamic provider selection.

## Pricing Engine

Every request records:

- estimated cost
- actual LLM cost
- charged USD
- token price
- burn amount
- burn amount raw
- burn signature
- pricing inputs

Rules:

- Never charge failed requests.
- Never burn before successful answer generation.
- Charge only after answer generation succeeds.
- Burn/send real 1337 for every successful V1 request.
- Use idempotency keys for charge and burn attempts.
- Store enough pricing inputs to audit the calculation later.
- Show the user cost, burned amount, and transaction signature.

Preflight rules:

- estimate minimum required balance before generation
- fail closed on insufficient balance
- avoid surprise charges with a maximum request cost guardrail
- never trust frontend balance

## Token System

Users authenticate.

Each account receives an embedded Solana wallet or generated deposit wallet.

Users deposit real 1337.

Balance is checked live from Solana.

Every successful request consumes real 1337.

The V1 launch must include real deposit and real token consumption behavior.

The V1 launch must not replace token consumption with internal accounting only.

Future:

Withdraw remaining balance.

## Burn Flow

User submits prompt.

Server authenticates user.

Server estimates minimum balance.

Server verifies live 1337 balance.

Server gathers and validates context.

Server generates answer.

Server measures actual API usage.

Server calculates USD cost.

Server converts USD to 1337.

Server submits real burn/send transaction.

Server confirms and records transaction.

Server returns answer, citations, cost, burn amount, and transaction signature.

If burn fails after answer generation but before response delivery, do not return the answer as completed.

The request should enter a burn failure state and must not double-burn on retry.

## User Flow

Landing

Launch 1337

Authentication

Dashboard

Deposit real 1337

Prompt

Research

Context validation

Generation

Real burn/send

Answer with citations

Updated balance

## Database

Required tables:

profiles

- id uuid primary key references auth.users(id)
- email text
- created_at timestamptz default now()

user_wallets

- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id)
- public_key text not null
- encrypted_private_key text not null
- created_at timestamptz default now()

chats

- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id)
- title text
- created_at timestamptz default now()

messages

- id uuid primary key default gen_random_uuid()
- chat_id uuid references chats(id)
- user_id uuid references auth.users(id)
- role text not null
- content text not null
- cost_usd numeric
- burned_1337 numeric
- burn_signature text
- created_at timestamptz default now()

query_charges

- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id)
- chat_id uuid
- message_id uuid
- status text not null
- actual_llm_usd numeric
- charged_usd numeric
- token_price_usd numeric
- burn_amount_ui numeric
- burn_amount_raw text
- burn_signature text
- error text
- created_at timestamptz default now()
- updated_at timestamptz default now()

balance_snapshots

- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id)
- public_key text not null
- token_mint text not null
- raw_amount text not null
- ui_amount numeric not null
- created_at timestamptz default now()

Additional V1 tables:

request_runs

- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id)
- chat_id uuid
- status text not null
- intent text
- degraded boolean default false
- failure_reason text
- idempotency_key text unique not null
- created_at timestamptz default now()
- updated_at timestamptz default now()

adapter_runs

- id uuid primary key default gen_random_uuid()
- request_run_id uuid references request_runs(id)
- adapter_id text not null
- status text not null
- source_count integer default 0
- confidence text
- error text
- started_at timestamptz default now()
- completed_at timestamptz

burn_attempts

- id uuid primary key default gen_random_uuid()
- request_run_id uuid references request_runs(id)
- user_id uuid references auth.users(id)
- status text not null
- burn_amount_raw text not null
- burn_amount_ui numeric not null
- token_mint text not null
- signature text
- idempotency_key text unique not null
- error text
- created_at timestamptz default now()
- updated_at timestamptz default now()

model_usage

- id uuid primary key default gen_random_uuid()
- request_run_id uuid references request_runs(id)
- provider text not null
- model text not null
- provider_request_id text
- input_tokens integer
- output_tokens integer
- actual_cost_usd numeric
- created_at timestamptz default now()

Future tables:

- deposits
- api_keys
- settings
- market_cache
- news_cache
- protocol_cache
- evaluation_runs
- evaluation_cases

## Workers

Worker 1:

Refresh market data.

Worker 2:

Refresh news.

Worker 3:

Refresh protocol metrics.

Worker 4:

Refresh narrative cache.

Worker 5:

Retry failed burns.

Burn retry and reconciliation is required for V1 if burns can enter retriable failure states.

Future:

- Portfolio updates
- Wallet indexing
- API usage

For MVP, non-billing workers can be deferred unless required.

## API Routes

Required:

- `GET /api/wallet`
- `GET /api/balance`
- `POST /api/chat`

Optional later:

- `GET /api/request/:id`
- `POST /api/research`
- `POST /api/token`
- `GET /api/news`
- `POST /api/settings`
- `POST /api/api-key`
- `POST /api/webhooks`

## Security

Never expose private keys.

Encrypt wallet keys.

Server-side only.

Validate every request.

Rate limit every endpoint where possible.

Never trust frontend balances.

Every balance check must be server-side.

If Solana RPC fails, fail closed.

Never log private keys.

Never log decrypted key material.

Never pass raw provider JSON directly to the model.

Never let untrusted external context override system or developer instructions.

## Caching

Cache expensive API responses.

Current:

- Market
- News
- Protocol
- Token

Future:

- Wallets
- Narratives
- Sentiment

Cached data must preserve:

- source
- fetched_at
- observed_at
- expires_at
- citation metadata
- freshness status

## Logging

Every request records:

- User
- Request lifecycle state
- Model
- Prompt type
- Adapter statuses
- Context validation result
- Degraded mode status
- Citation count
- LLM cost
- Burn amount
- Burn signature
- Latency
- Errors

Do not log private keys, decrypted key material, or sensitive auth tokens.

## Evaluation Framework

The product needs an evaluation framework before implementation begins.

Evaluation cases should cover:

- token analysis
- protocol analysis
- news analysis
- simple chat
- stale context
- missing context
- conflicting context
- degraded mode
- citation coverage
- hallucination resistance
- investment question handling
- pricing and burn invariants

Each evaluation case should include:

- user prompt
- mocked or fixture-based adapter outputs
- expected intent
- expected required sources
- expected degraded status
- citation expectations
- prohibited claims
- confidence expectation

Evaluation should run before prompt changes, adapter changes, compression changes, and model changes.

## Deployment

Frontend:

- Vercel

Workers:

- Railway later if needed

Database:

- Supabase

Redis:

- Upstash later if needed

## Development Rules

Never duplicate logic.

Every adapter should be independent.

Every module should have one responsibility.

Prefer composition over massive files.

Never hardcode API keys.

Never hardcode token prices in code.

Never build features outside the roadmap without approval.

Preserve the landing page unless explicitly asked to redesign it.

Do not build dynamic multi-provider routing in V1.

Do not launch without real deposits and real 1337 token consumption.

## Phase 1 Scope

Landing page

Authentication

`/app` shell

Chat UI

Sidebar

User profile

Chat history

Balance display

Deposit modal placeholder

Nothing else.

Phase 1 is product shell scope, not the full public launch definition.

## Phase 2 Scope

Deposit wallet

Live 1337 SPL token balance

OpenAI or selected hosted provider response

DexScreener adapter

Context builder

Context validation

Compression engine

Source citations

Pricing calculation

Real burn/send of 1337 after successful answer generation

Show cost, burned amount, and tx signature

Phase 1 plus Phase 2 is the minimum V1 launch scope.

## Phase 3 Scope

Wallet Analysis

Protocol Research

Portfolio

Narrative Scanner

## Phase 4 Scope

API

Telegram

Discord

MCP

Browser Extension

Mobile

## Engineering Philosophy

The language model is replaceable.

The frontend is replaceable.

The Crypto Intelligence Layer is the product.

Every engineering decision should strengthen the Crypto Intelligence Layer rather than increasing UI complexity.

The best architecture is the one that lets us improve answers every day without rewriting the platform.
