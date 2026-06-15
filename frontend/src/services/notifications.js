let originalTitle = typeof document !== "undefined" ? document.title : "Shantabai";
let titleInterval = null;

// Request permission for Desktop notifications
export const requestNotificationPermission = async () => {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.error("Notification permission request failed:", err);
      }
    }
  }
};

// Play a premium dual-tone synth chime sound using the Web Audio API
export const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Play D5 (587.33Hz) followed by A5 (880.00Hz) for a clean notification tone
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    console.error("Audio synth chime failed:", err);
  }
};

// Flash the tab title to grab user attention
export const startTitleFlash = (senderName) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (titleInterval) clearInterval(titleInterval);

  let showAlert = true;
  titleInterval = setInterval(() => {
    document.title = showAlert
      ? `💬 New message from ${senderName || "User"}!`
      : originalTitle;
    showAlert = !showAlert;
  }, 1500);
};

// Reset tab title
export const stopTitleFlash = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
  }
  document.title = originalTitle;
};

// Trigger browser push notification
export const showDesktopNotification = (senderName, text) => {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        new Notification(`Shantabai: Chat from ${senderName || "User"}`, {
          body: text,
          icon: "/logonavbar.png",
          tag: "chat-msg",
        });
      } catch (err) {
        console.error("Desktop notification popup failed:", err);
      }
    }
  }
};

// Monitor focus to clear tab alerts immediately
if (typeof window !== "undefined") {
  window.addEventListener("focus", () => {
    stopTitleFlash();
  });
}
