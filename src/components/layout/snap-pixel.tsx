"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Snapchat Snap Pixel — loaded sitewide.
 *
 * The pixel id comes from Admin → Integrations → Snapchat (passed in by the
 * server layout). The loader + one-time `init` run exactly once via next/script
 * (afterInteractive). The Snap stub queues calls until scevent.min.js loads,
 * so the initial PAGE_VIEW fired in the script is never lost.
 *
 * Because this is a single-page app, client-side navigations don't re-run the
 * script. The usePathname effect below fires a PAGE_VIEW for every subsequent
 * route change (it skips its first run, which the script's initial PAGE_VIEW
 * already covers) — keeping the per-navigation track call separate from init.
 */
export default function SnapPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      // Initial load is already tracked by the init script below.
      isFirstLoad.current = false;
      return;
    }
    const snaptr = (window as unknown as { snaptr?: (...args: unknown[]) => void }).snaptr;
    if (typeof snaptr === "function") snaptr("track", "PAGE_VIEW");
  }, [pathname]);

  return (
    <Script id="snap-pixel" strategy="afterInteractive">
      {`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init', '${pixelId}', {});
snaptr('track', 'PAGE_VIEW');`}
    </Script>
  );
}
