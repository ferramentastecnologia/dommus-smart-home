type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

type WindowWithFbq = Window & {
  fbq?: Fbq;
  _fbq?: Fbq;
};

const SCRIPT_ID = "meta-pixel-script";
const INITIALIZED_IDS = new Set<string>();

export function initMetaPixel(pixelId: string) {
  if (!pixelId) return;

  const windowWithFbq = window as WindowWithFbq;
  const currentFbq = windowWithFbq.fbq;

  if (!currentFbq) {
    const fbq: Fbq = (...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }
      fbq.queue?.push(args);
    };

    if (!windowWithFbq._fbq) {
      windowWithFbq._fbq = fbq;
    }

    fbq.push = (...args: unknown[]) => {
      fbq.queue?.push(args);
    };
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    windowWithFbq.fbq = fbq;

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }
  }

  if (!INITIALIZED_IDS.has(pixelId)) {
    windowWithFbq.fbq?.("init", pixelId);
    INITIALIZED_IDS.add(pixelId);
  }
}

export function trackMetaPageView() {
  const windowWithFbq = window as WindowWithFbq;
  windowWithFbq.fbq?.("track", "PageView");
}
