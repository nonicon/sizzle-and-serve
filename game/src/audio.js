// All sound is synthesized with the Web Audio API — no audio files, so the
// game loads nothing over the network. Every effect is a short oscillator or
// filtered-noise burst; the music is a quiet bass-and-pluck loop.
export function createAudio() {
  let ctx = null;
  let musicTimer = null;
  let muted = false;
  let step = 0;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, seconds, type, volume, when = 0, slideTo = 0) {
    const ac = ensure();
    if (!ac || muted) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + seconds);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  function noise(seconds, volume, filterFreq, when = 0) {
    const ac = ensure();
    if (!ac || muted) return;
    const t0 = ac.currentTime + when;
    const length = Math.max(1, Math.floor(ac.sampleRate * seconds));
    const buffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = ac.createGain();
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ac.destination);
    source.start(t0);
  }

  const MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
  const BASS = [130.81, 98, 110, 146.83];

  return {
    unlock() { ensure(); },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() { return muted; },
    startMusic() {
      ensure();
      if (musicTimer || !ctx) return;
      musicTimer = setInterval(() => {
        if (muted || !ctx) return;
        const bar = Math.floor(step / 4) % 4;
        tone(BASS[bar], 0.5, 'sine', 0.05);
        if (step % 2 === 0) tone(MELODY[step % MELODY.length], 0.22, 'triangle', 0.035);
        step += 1;
      }, 240);
    },
    stopMusic() {
      if (musicTimer) clearInterval(musicTimer);
      musicTimer = null;
    },
    pickup() { tone(440, 0.08, 'square', 0.05, 0, 660); },
    place() { tone(330, 0.09, 'triangle', 0.07, 0, 220); },
    chop() { noise(0.07, 0.16, 1800); tone(180, 0.06, 'square', 0.06); },
    sizzleStart() { noise(0.5, 0.05, 5200); },
    ding() { tone(880, 0.35, 'sine', 0.09); tone(1318.5, 0.3, 'sine', 0.05, 0.07); },
    served() {
      tone(523.25, 0.12, 'triangle', 0.08);
      tone(659.25, 0.12, 'triangle', 0.08, 0.1);
      tone(783.99, 0.22, 'triangle', 0.09, 0.2);
    },
    error() { tone(160, 0.18, 'sawtooth', 0.06, 0, 110); },
    burnt() { tone(220, 0.3, 'sawtooth', 0.07, 0, 90); noise(0.25, 0.08, 900); },
    tick() { tone(980, 0.05, 'square', 0.04); },
    gameOver() {
      tone(392, 0.2, 'triangle', 0.08);
      tone(329.63, 0.2, 'triangle', 0.08, 0.18);
      tone(261.63, 0.45, 'triangle', 0.09, 0.36);
    },
  };
}
