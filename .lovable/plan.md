# AI-assisted quiz drafting

## What will change
- Add a doctor-facing form in the quiz builder for clinic specialty and campaign goal.
- Generate a patient-friendly, explicitly non-diagnostic quiz draft with questions, answer choices, scoring, and outcome copy.
- Load the generated draft into the existing quiz editor so doctors can review and edit it before saving or publishing.
- Keep model calls on the server through a Lovable Cloud function; validate inputs and generated structure, and show safe recoverable errors.

## Technical details
- Use the Lovable AI Gateway SDK and the workspace-resolved text model on the Responses surface, after checking workspace model availability and generated request types.
- Invoke a server-side Edge Function from the signed-in quiz builder; do not expose prompts or credentials in browser code.
- Validate the returned draft and map it to the quiz builder's existing question, scoring, and result types.
- Verify the feature through the builder UI and review current build diagnostics.