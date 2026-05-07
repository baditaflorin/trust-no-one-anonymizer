export function renderAppShell(): string {
  return `
    <main class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">client-side media shield</p>
          <h1>Trust No One Anonymizer</h1>
        </div>
        <nav class="toplinks" aria-label="Project links">
          <a id="repoLink" href="https://github.com/baditaflorin/trust-no-one-anonymizer" target="_blank" rel="noreferrer">
            <i data-lucide="github" aria-hidden="true"></i>
            <span>GitHub</span>
          </a>
          <a id="paypalLink" href="https://www.paypal.com/paypalme/florinbadita" target="_blank" rel="noreferrer">
            <i data-lucide="heart" aria-hidden="true"></i>
            <span>PayPal</span>
          </a>
        </nav>
      </header>

      <section class="privacy-strip" aria-label="Privacy status">
        <div>
          <strong>No backend.</strong>
          Raw camera, microphone, landmarks, and audio buffers stay in this browser.
        </div>
        <div id="buildInfo" class="build-info">Version loading · Commit loading</div>
      </section>

      <section class="workspace" aria-label="Anonymizer workspace">
        <div class="stage-panel">
          <canvas id="avatarCanvas" class="avatar-canvas" aria-label="Processed avatar video feed"></canvas>
          <video id="rawVideo" class="raw-video" playsinline muted aria-hidden="true"></video>
          <video id="remoteVideo" class="remote-video" playsinline autoplay controls></video>
        </div>

        <aside class="control-panel" aria-label="Controls">
          <div class="panel-section">
            <h2>Session</h2>
            <div class="button-row">
              <button id="startButton" class="primary-button" type="button">
                <i data-lucide="camera" aria-hidden="true"></i>
                <span>Start</span>
              </button>
              <button id="stopButton" class="ghost-button" type="button" disabled>
                <i data-lucide="square" aria-hidden="true"></i>
                <span>Stop</span>
              </button>
            </div>
            <div id="statusList" class="status-list" aria-live="polite"></div>
          </div>

          <div class="panel-section">
            <h2>Avatar</h2>
            <label class="field">
              <span>Seed</span>
              <input id="avatarSeed" type="text" maxlength="48" autocomplete="off" />
            </label>
            <label class="toggle">
              <input id="enhancementEnabled" type="checkbox" />
              <span>ESRGAN snapshot enhancement</span>
            </label>
            <button id="enhanceButton" class="ghost-button full-width" type="button" disabled>
              <i data-lucide="sparkles" aria-hidden="true"></i>
              <span>Enhance Snapshot</span>
            </button>
            <figure id="enhancementFigure" class="enhancement-figure hidden">
              <img id="enhancementImage" alt="Enhanced avatar keyframe" />
              <figcaption id="enhancementCaption"></figcaption>
            </figure>
          </div>

          <div class="panel-section">
            <h2>Voice</h2>
            <label class="field">
              <span>Timbre</span>
              <input id="timbreShift" type="range" min="-100" max="100" step="1" />
            </label>
            <label class="toggle">
              <input id="rnnoiseEnabled" type="checkbox" />
              <span>RNNoise suppression</span>
            </label>
            <meter id="voiceMeter" min="0" max="1" value="0"></meter>
          </div>
        </aside>
      </section>

      <section class="webrtc-panel" aria-label="Manual WebRTC signaling">
        <div class="webrtc-header">
          <h2>WebRTC Export</h2>
          <label class="toggle compact">
            <input id="usePublicStun" type="checkbox" />
            <span>Public STUN</span>
          </label>
        </div>
        <div class="signal-grid">
          <label class="field">
            <span>Local signal</span>
            <textarea id="localSignal" spellcheck="false" readonly></textarea>
          </label>
          <label class="field">
            <span>Remote signal</span>
            <textarea id="remoteSignal" spellcheck="false"></textarea>
          </label>
        </div>
        <div class="button-row">
          <button id="createOfferButton" class="ghost-button" type="button" disabled>
            <i data-lucide="radio" aria-hidden="true"></i>
            <span>Create Offer</span>
          </button>
          <button id="createAnswerButton" class="ghost-button" type="button" disabled>
            <i data-lucide="reply" aria-hidden="true"></i>
            <span>Create Answer</span>
          </button>
          <button id="acceptAnswerButton" class="ghost-button" type="button" disabled>
            <i data-lucide="check" aria-hidden="true"></i>
            <span>Accept Answer</span>
          </button>
          <button id="copySignalButton" class="ghost-button" type="button" disabled>
            <i data-lucide="copy" aria-hidden="true"></i>
            <span>Copy Local</span>
          </button>
        </div>
      </section>

      <div id="toast" class="toast hidden" role="status" aria-live="polite"></div>
    </main>
  `;
}
