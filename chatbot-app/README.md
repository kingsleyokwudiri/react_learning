# Chatbot (Vite build)

The same chatbot exercise as `../no-build/chatbot/`, but built with a real
toolchain instead of running straight from a file.

## Why this exists

`../no-build/chatbot/` is deliberately build-free: React is vendored into
`../no-build/libs/`, Babel compiles the JSX in the browser, and you open
`../no-build/chatbot/index.html` directly. That keeps the focus on React
itself. This folder exists to show what changes once a build step is in play,
so the two can be read side by side.

The components in `src/scripts/Chatbot.jsx` are the same as the exercise's.
The differences are the ones the toolchain introduces:

|                  | `../no-build/chatbot/`                      | here                          |
| ---------------- | ------------------------------------------- | ----------------------------- |
| React comes from | `<script src="../libs/react.js">`, a global | the `react` npm package       |
| Hooks written as | `React.useState(...)`                       | `useState(...)`, imported     |
| JSX compiled     | in the browser, by Babel, on every load     | ahead of time, by Vite        |
| Editing          | save, then refresh the page                 | save, and it hot-reloads      |
| Ship it          | copy the files                              | `npm run build`               |

Two more things moved as part of the port:

- `../no-build/libs/chatbot.js` is now `src/scripts/chatbot.js`. The UMD
  wrapper is gone -- it is a normal ES module that exports the `Chatbot`
  object.
- `robot.png` and `user.png` moved into `public/`, so the `<img>` tags point
  at `/robot.png` and `/user.png` instead of `../assets/`.

## Commands

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
npm run lint
```

<!--
cd chatbot-app
  <!-- npm run dev --> starts Vite and prints a local URL -->
