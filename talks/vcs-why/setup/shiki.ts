import { defineShikiSetup } from '@slidev/types'

// A `gitol` language for code blocks showing terminal output of the `git ol` alias
// (or `git log --oneline`) and rebase todo lists. The scopes are picked for their colours in vitesse-light, to
// mimic the alias: red hash, yellow refs, green age, bold blue author.
export default defineShikiSetup(() => ({
  langs: [
    {
      name: 'gitol',
      scopeName: 'source.gitol',
      patterns: [
        {
          // $ git ol
          match: '^(\\$) (.*)$',
          captures: { 1: { name: 'comment.gitol' } },
        },
        {
          // pick 3f1c2a9 Add discount code model
          match: '^(pick|reword|edit|squash|fixup|drop|exec)\\s+([0-9a-f]{7,})\\s+((?:fixup|squash|amend)! )?(.*)$',
          captures: {
            1: { name: 'keyword.gitol' },
            2: { name: 'markup.deleted.gitol' },
            3: { name: 'markup.changed.gitol' },
          },
        },
        {
          // %h -%d %s (%cr) <%an>
          match: '^([0-9a-f]{7,}) -(?: (\\([^)]*\\)))? ((?:fixup|squash|amend)! )?(.*) (\\([^)]* ago\\)) (<[^>]*>)$',
          captures: {
            1: { name: 'markup.deleted.gitol' },
            2: { name: 'support.gitol' },
            3: { name: 'markup.changed.gitol' },
            5: { name: 'markup.inserted.gitol' },
            6: { name: 'markup.bold.gitol meta.diff.header.gitol' },
          },
        },
        {
          // %h %s, as from `git log --oneline`, with the Conventional Commits type
          match: '^([0-9a-f]{7,}) (?:([a-z]+)(\\([^)]*\\))?(!)?:)?(.*)$',
          captures: {
            1: { name: 'markup.deleted.gitol' },
            2: { name: 'keyword.gitol' },
            3: { name: 'support.gitol' },
            4: { name: 'markup.changed.gitol' },
          },
        },
      ],
    },
  ],
}))
