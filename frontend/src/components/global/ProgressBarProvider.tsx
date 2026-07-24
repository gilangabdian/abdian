'use client';

import NextTopLoader from 'nextjs-toploader';

export default function ProgressBarProvider() {
  return (
    <NextTopLoader
      color="#9ca3af"
      initialPosition={0.08}
      crawlSpeed={200}
      height={2}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #9ca3af,0 0 5px #9ca3af"
    />
  );
}
