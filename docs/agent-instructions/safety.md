# Safety Boundaries

## Overview

Use this file before making changes that could affect public API behavior, authentication, configuration, dependencies, routing, or repository structure.

## Repository Scope

- Analyze, modify, and run commands only inside this repository unless the user explicitly requests work elsewhere.
- Do not infer or mutate files outside the repository as part of this project's maintenance work.

## Public API Stability

- Do not change existing route semantics without an explicit requirement.
- Do not change public response structures unless the task specifically asks for it.
- Do not change default runtime configuration such as port `3200` without a clear requirement.
- Keep API metadata, docs, and tests aligned when public behavior changes.

## Authentication and User Data

- For QR login, Cookie, user information, and credential-related code, make only compatibility fixes or explicitly requested changes.
- Do not redesign the authentication flow without first confirming that it is part of the task.
- Do not expand credential usage, weaken protective logic, or remove validation as an incidental cleanup.

## Change Control

- Do not introduce unrelated large refactors, bulk formatting, or directory migrations.
- Do not delete files, adjust public configuration, or alter build scripts unless that change is necessary for the task.
- If a business rule is uncertain, handle it conservatively and call out the assumption in the handoff.
