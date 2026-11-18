# Architecture decisions

- Store quiz, calculator, chatbot, and spin-wheel definitions as owner-scoped typed JSON in `content_items`; keep lead contact details separate in an owner-only `leads` table so public quiz access cannot read private records.
- Serve published quizzes and accept lead forms only through narrowly scoped database functions; this keeps anonymous visitors away from owner data and raw table access.