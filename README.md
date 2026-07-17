# RobotFace

![RobotFace Open Graph card](./public/og-image.png)

Your UI called. It wants a tiny robot friend.

RobotFace is a playful, chunky-pixel React face that blinks, laughs, sulks, cries, gets mad, and generally behaves like it has better plans than your loading spinner. It includes an interactive playground plus a dedicated full-screen display mode where the face lives directly in the browser window.

## What’s inside

- Nine original moods plus the display-loop personalities: happy, excited, laughing, annoyed, crying, angry, sleepy, love, and more.
- Big pixel-segment SVG expressions with CRT bloom and scanlines.
- Cursor-aware gaze, automatic blinking, talking and loading states.
- A full-screen `/face` mode that cycles through a playful emotional loop.
- Responsive demo, SEO metadata, and a custom Open Graph image.

## Make it blink

```bash
npm install
npm run dev
```

Then open the local URL Vite prints. For the full-screen face, visit `/face` or click **Open display** in the app.

## Component API

```tsx
import { RobotFace } from './robot-face'

<RobotFace
  emotion="laughing"
  color="#c8ff6a"
  blinking
  talking={false}
  loading={false}
  interactive
/>
```

Available expressions: `happy`, `neutral`, `sad`, `wink`, `surprised`, `angry`, `sleepy`, `love`, `confused`, `excited`, `laughing`, `annoyed`, and `crying`.

The reusable component lives in [`src/robot-face`](./src/robot-face); the remaining source files power the showcase app.

## Cloudflare Pages

The project is ready for Cloudflare Pages. [`wrangler.jsonc`](./wrangler.jsonc) declares the `robot-face` project and the Vite output directory.

For Git-based deployment, import `yamustofa/robot-face` in **Cloudflare Dashboard → Workers & Pages → Create application → Pages** and use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |

Cloudflare Pages will deploy `main` to production and create preview deployments for pull requests. The current expected production address is `https://robot-face.pages.dev`; update the canonical URL, sitemap, and social-image URLs if you use a custom domain.

For a direct deploy after authenticating Wrangler:

```bash
npm run deploy
```

Made with ♥ by [yamustofa](https://github.com/yamustofa). Find more bits on [Threads](https://www.threads.com/@mustavibe.dev) and [X](https://x.com/mustavibe).
