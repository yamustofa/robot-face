import { useMemo, useState } from 'react'
import { emotions, RobotFace, type Emotion } from './robot-face'

const colors = ['#c8ff6a', '#62e8ff', '#ff8bc3', '#ffbb54']

const emotionDetails: Record<Emotion, { glyph: string; note: string }> = {
  happy: { glyph: '^ᴗ^', note: 'Default welcome' },
  neutral: { glyph: '—_—', note: 'Standing by' },
  sad: { glyph: '╥_╥', note: 'Something went wrong' },
  wink: { glyph: '^‿—', note: 'Nice work' },
  surprised: { glyph: '⊙o⊙', note: 'New discovery' },
  angry: { glyph: '>_<', note: 'System alert' },
  sleepy: { glyph: '–_–', note: 'Idle mode' },
  love: { glyph: '♥_♥', note: 'Favorite' },
  confused: { glyph: 'o_O', note: 'Needs context' },
  excited: { glyph: '*_*', note: 'Big news' },
  laughing: { glyph: '^ᴗ^', note: 'Pure delight' },
  annoyed: { glyph: '¬_¬', note: 'Not impressed' },
  crying: { glyph: 'T_T', note: 'Feeling blue' },
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: string }) {
  return (
    <button className="toggle" type="button" role="switch" aria-checked={checked} onClick={onChange}>
      <span className="toggle__track"><i /></span>
      <span>{children}</span>
    </button>
  )
}

export default function App() {
  const [emotion, setEmotion] = useState<Emotion>('happy')
  const [color, setColor] = useState(colors[0])
  const [talking, setTalking] = useState(false)
  const [blinking, setBlinking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const snippet = useMemo(() => `<RobotFace
  emotion="${emotion}"
  color="${color}"
  talking={${talking}}
  blinking={${blinking}}
  loading={${loading}}
/>`, [emotion, color, talking, blinking, loading])

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="app-shell">
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="RobotFace home">
          <span className="brand__mark">•ᴗ•</span>
          <span>RobotFace</span>
        </a>
        <div className="nav__status"><i /> Component online</div>
        <div className="nav__actions">
          <a className="nav__link" href="#expressions">Expressions <span>↘</span></a>
          <a className="nav__display-link" href="/face" target="_blank" rel="noreferrer">Open display <span>↗</span></a>
        </div>
      </nav>

      <main id="top">
        <header className="hero-copy">
          <div className="eyebrow"><span>01</span> Pixel personality for React</div>
          <h1>Give your interface<br />a little <em>soul.</em></h1>
          <p>A tiny, expressive CRT mascot built with React, SVG, and motion. Pick a mood, tune the behavior, and make it yours.</p>
        </header>

        <section className="playground" aria-label="Robot face playground">
          <div className="stage">
            <div className="stage__label"><span>LIVE PREVIEW</span><span>{emotionDetails[emotion].glyph}</span></div>
            <div className="stage__face">
              <div className="stage__halo" style={{ background: color }} />
              <RobotFace emotion={emotion} color={color} talking={talking} blinking={blinking} loading={loading} />
            </div>
            <p className="stage__hint">Move your cursor — it’s watching.</p>
          </div>

          <aside className="controls">
            <div className="controls__head">
              <span>CONTROL PANEL</span>
              <span className="controls__number">RF–01</span>
            </div>

            <fieldset>
              <legend>EXPRESSION</legend>
              <div className="emotion-grid">
                {emotions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={emotion === item ? 'emotion-button active' : 'emotion-button'}
                    aria-pressed={emotion === item}
                    onClick={() => setEmotion(item)}
                  >
                    <span>{emotionDetails[item].glyph}</span>{item}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>BEHAVIOR</legend>
              <div className="toggles">
                <Toggle checked={talking} onChange={() => setTalking((value) => !value)}>Talking</Toggle>
                <Toggle checked={blinking} onChange={() => setBlinking((value) => !value)}>Auto blink</Toggle>
                <Toggle checked={loading} onChange={() => setLoading((value) => !value)}>Loading</Toggle>
              </div>
            </fieldset>

            <fieldset>
              <legend>PHOSPHOR</legend>
              <div className="swatches">
                {colors.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={color === item ? 'swatch active' : 'swatch'}
                    style={{ background: item }}
                    aria-label={`Use ${item}`}
                    aria-pressed={color === item}
                    onClick={() => setColor(item)}
                  />
                ))}
              </div>
            </fieldset>
          </aside>
        </section>

        <section className="code-section">
          <div>
            <div className="eyebrow"><span>02</span> Drop-in simple</div>
            <h2>One component.<br />Lots of character.</h2>
            <p>Every state is driven by a small, typed API. No sprite sheets and no canvas plumbing.</p>
          </div>
          <div className="code-card">
            <div className="code-card__top"><span><i /><i /><i /></span><span>App.tsx</span><button type="button" onClick={copySnippet}>{copied ? 'Copied!' : 'Copy'}</button></div>
            <pre><code>{snippet}</code></pre>
          </div>
        </section>

        <section className="expressions" id="expressions">
          <div className="expressions__head">
            <div>
              <div className="eyebrow"><span>03</span> Expression system</div>
              <h2>A mood for every moment.</h2>
            </div>
            <p>Nine composable expressions, each built from crisp SVG paths and ready to animate.</p>
          </div>
          <div className="expression-cards">
            {emotions.map((item, index) => (
              <button type="button" className="expression-card" key={item} onClick={() => { setEmotion(item); window.scrollTo({ top: 380, behavior: 'smooth' }) }}>
                <span className="expression-card__index">0{index + 1}</span>
                <RobotFace emotion={item} color={color} blinking={false} interactive={false} />
                <span className="expression-card__name">{item}</span>
                <small>{emotionDetails[item].note}</small>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top"><span className="brand__mark">•ᴗ•</span><span>RobotFace</span></a>
        <p className="footer__made">Made with <span aria-label="love">♥</span> by <a href="https://github.com/yamustofa" target="_blank" rel="noreferrer">yamustofa</a></p>
        <div className="footer__links">
          <a href="https://www.threads.com/@mustavibe.dev" target="_blank" rel="noreferrer">Threads ↗</a>
          <a href="https://x.com/mustavibe" target="_blank" rel="noreferrer">X ↗</a>
          <a href="#top">Top ↑</a>
        </div>
      </footer>
    </div>
  )
}
