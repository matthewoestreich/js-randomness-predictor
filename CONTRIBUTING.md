# Commit Messages

We follow the **Angular style commit message** convention. The main commit types are:

| Type       | Description               |
| ---------- | ------------------------- |
| `feat`     | New feature               |
| `fix`      | Bug fix                   |
| `perf`     | Performance improvement   |
| `build`    | Build system changes      |
| `ci`       | CI configuration changes  |
| `revert`   | Revert a previous commit  |
| `docs`     | Documentation changes     |
| `style`    | Formatting-only changes   |
| `refactor` | Code restructuring        |
| `test`     | Test changes              |
| `chore`    | Miscellaneous maintenance |

## Important Notes

- **Breaking Changes:** Must be noted in the commit footer as `BREAKING CHANGE:` to appear in the changelog.
- **Visibility:** By default, only `feat`, `fix`, `perf`, and `BREAKING CHANGE` appear prominently in generated changelogs. Other types are typically ignored unless configured otherwise.

## Examples

### Feature with scope

feat(cli): add runtime field

### Bug fix

fix(core): handle edge case in sequence generation

### Breaking change

feat(cli): change output format

BREAKING CHANGE: removed 'actual' field from CLI output

# JavaScript Engine Sources

- [V8 Source Code](https://source.chromium.org/chromium/chromium/src/+/main:v8)
  - V8 source code is part of the Chromium repo
  - Used by `Node`, `Chrome`, `Deno`
- [SpiderMonkey Source Code](https://github.com/mozilla-firefox/firefox/tree/main/js)
  - SpiderMonkey source code is part of the Firefox repo
  - Used by `Firefox`
- [JavaScriptCore Source Code](https://github.com/WebKit/WebKit/tree/main/Source/JavaScriptCore)
  - JavaScriptCore source code is part of the WebKit repo
  - Used by `Safari`, `Bun`
