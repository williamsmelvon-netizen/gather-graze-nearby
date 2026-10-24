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
- Shopping lists are device-scoped: access only via security-definer RPCs get_shopping_list/save_shopping_list keyed on a localStorage device id (no direct table grants), because there is no login for shoppers.
- Admin access is checked via public.user_roles + has_role(); all content writes are admin-only in RLS.
