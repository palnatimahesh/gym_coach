/* --- SOUND SYSTEM --- Web Audio API - no external files needed --- */

var SoundSystem = (function() {
  var ctx = null;
  var enabled = true;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) { return null; }
    }
    // Resume if suspended (mobile requires user gesture first)
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Core tone generator
  function tone(freq, duration, type, gain, delay) {
    var c = getCtx();
    if (!c || !enabled) return;
    delay = delay || 0;
    type  = type  || 'sine';
    gain  = gain  || 0.3;

    var osc = c.createOscillator();
    var vol = c.createGain();

    osc.connect(vol);
    vol.connect(c.destination);

    osc.type      = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);

    vol.gain.setValueAtTime(0, c.currentTime + delay);
    vol.gain.linearRampToValueAtTime(gain, c.currentTime + delay + 0.01);
    vol.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);

    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration + 0.05);
  }

  return {
    enable:  function()  { enabled = true; },
    disable: function()  { enabled = false; },
    toggle:  function()  { enabled = !enabled; return enabled; },
    isOn:    function()  { return enabled; },
    // Unlock audio context on first user interaction (required on mobile)
    unlock:  function()  { getCtx(); },

    // Single soft tick - set completion
    tick: function() {
      tone(880, 0.08, 'sine', 0.2);
    },

    // Double beep - rest timer done
    restDone: function() {
      tone(660, 0.12, 'sine', 0.35);
      tone(880, 0.18, 'sine', 0.45, 0.15);
    },

    // Triple ascending beep - warmup step done
    stepDone: function() {
      tone(440, 0.1, 'sine', 0.25);
      tone(554, 0.1, 'sine', 0.25, 0.12);
      tone(659, 0.15, 'sine', 0.3,  0.24);
    },

    // Countdown beeps - last 3 seconds of a timer
    countdown: function(secondsLeft) {
      if (secondsLeft <= 3 && secondsLeft > 0) {
        tone(440, 0.08, 'square', 0.15);
      }
    },

    // Fanfare - workout complete
    fanfare: function() {
      tone(523, 0.15, 'sine', 0.3);
      tone(659, 0.15, 'sine', 0.3,  0.18);
      tone(784, 0.15, 'sine', 0.3,  0.36);
      tone(1047,0.35, 'sine', 0.35, 0.54);
    },

    // Soft chime - session start
    sessionStart: function() {
      tone(528, 0.2,  'sine', 0.25);
      tone(660, 0.25, 'sine', 0.25, 0.22);
    },

    // Alert - warning/swap
    alert: function() {
      tone(330, 0.15, 'square', 0.2);
      tone(280, 0.2,  'square', 0.2, 0.18);
    },

    // Breathing in cue - rising tone
    breathIn: function() {
      var c = getCtx();
      if (!c || !enabled) return;
      var osc = c.createOscillator();
      var vol = c.createGain();
      osc.connect(vol);
      vol.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, c.currentTime);
      osc.frequency.linearRampToValueAtTime(330, c.currentTime + 4);
      vol.gain.setValueAtTime(0, c.currentTime);
      vol.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.3);
      vol.gain.linearRampToValueAtTime(0, c.currentTime + 4);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 4.1);
    },

    // Breathing out cue - falling tone
    breathOut: function() {
      var c = getCtx();
      if (!c || !enabled) return;
      var osc = c.createOscillator();
      var vol = c.createGain();
      osc.connect(vol);
      vol.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, c.currentTime);
      osc.frequency.linearRampToValueAtTime(180, c.currentTime + 6);
      vol.gain.setValueAtTime(0, c.currentTime);
      vol.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.3);
      vol.gain.linearRampToValueAtTime(0, c.currentTime + 6);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 6.1);
    }
  };
})();
