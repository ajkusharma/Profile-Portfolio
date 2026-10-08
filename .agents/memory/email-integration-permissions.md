---
name: Email integration permissions
description: Permission limits observed on the project's connected Resend account.
---

The connected Resend credential is send-only. A read request to list verified domains was rejected as a restricted-key operation, while a real contact submission was accepted.

**Why:** The user approved using the existing Resend connection and confirmed the verification message arrived in their inbox. Replacing a working send-only credential with broader access is not necessary for sending contact messages.

**How to apply:** Do not interpret denied domain or email-record reads as proof that sending is broken. If final inbox arrival must be confirmed, ask the inbox owner rather than promising delivery based only on provider acceptance.
