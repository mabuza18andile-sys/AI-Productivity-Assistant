<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All AI calls go through the single `runAi` server function in src/lib/ai.functions.ts with one purpose-built prompt per tool; keeps keys server-side and prompts in one place.
- Activity counts and planner tasks persist in localStorage only (no Cloud); the app must work without sign-up.
