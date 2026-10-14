# Tic Tac Toe (Vite build)

The same tictactoe exercise as `../no-build/tictactoe/`, but built with a real
toolchain instead of running straight from a file.

## Why this exists

`../no-build/tictactoe/` is deliberately build-free: React is vendored into
`../no-build/libs/`, Babel compiles the JSX in the browser, and you open
`../no-build/tictactoe/tictactoe.html` directly. That keeps the focus on React itself. This folder
exists to show what changes once a build step is in play, so the two can be
read side by side.

The game logic in `src/scripts/TicTacToe.jsx` is the same as the exercise's. The
differences are the ones the toolchain introduces:

|                  | `../no-build/tictactoe/`                    | here                      |
| ---------------- | ------------------------------------------- | ------------------------- |
| React comes from | `<script src="../libs/react.js">`, a global | the `react` npm package   |
| Hooks written as | `React.useState(...)`                       | `useState(...)`, imported |
| JSX compiled     | in the browser, by Babel, on every load     | ahead of time, by Vite    |
| Editing          | save, then refresh the page                 | save, and it hot-reloads  |
| Ship it          | copy the files                              | `npm run build`           |

## Commands

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
npm run lint
```

<!--
cd my-react-app
  <!-- npm run dev --> starts Vite and prints a local URL -->
