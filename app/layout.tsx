import type { Metadata, Viewport } from "next";
import { Archivo, Bebas_Neue, VT323 } from "next/font/google";
import { siteUrl } from "@/content/site";
import { getSite } from "@/content/store";
import { Remote } from "@/components/chrome/Remote";
import { Hud } from "@/components/chrome/Hud";
import { TransitionOverlay } from "@/components/chrome/TransitionOverlay";
import { CursorChip } from "@/components/chrome/CursorChip";
import { SceneObserver } from "@/components/chrome/SceneObserver";
import { DebugScreens } from "@/components/chrome/DebugScreens";
import { MotionRoot } from "@/components/chrome/MotionRoot";
import "./globals.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-bebas" });
const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-vt323" });
const archivo = Archivo({ subsets: ["latin"], display: "swap", variable: "--font-archivo", preload: false });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
    description: `Thumbnails and content visuals for creators — gaming, podcast, crypto and social media. ${site.role}`,
    openGraph: { type: "website", siteName: site.name, title: `${site.name} — ${site.role}` },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#efd5bc",
  colorScheme: "light",
  viewportFit: "cover",
};

// Runs before first paint: marks JS as available (closed envelope, Dive height, line reveals)
// and remembers that the intro has played this session (repeat visits skip it).
// Also cleans any browser-extension injected scripts from <head> to prevent hydration mismatches.
const BOOT = `(function(d){
  function clean(){
    try{
      var s=document.querySelectorAll('script[src*="-extension:"],script[src*="popups-script"]');
      for(var i=0;i<s.length;i++)s[i].remove();
    }catch(e){}
  }
  clean();
  if(typeof MutationObserver!=="undefined"){
    var o=new MutationObserver(clean);
    if(document.head)o.observe(document.head,{childList:true});
    setTimeout(function(){o.disconnect();},3000);
  }
  d.classList.add('js');
  try{if(sessionStorage.getItem('tape-01-intro'))d.classList.add('powered','repeat');else sessionStorage.setItem('tape-01-intro','1')}catch(e){}
})(document.documentElement);`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSite();
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    url: siteUrl,
    sameAs: site.socials.map((s) => s.href).filter((h) => h.startsWith("http")),
  };
  return (
    <html lang="en" className={`${bebas.variable} ${vt323.variable} ${archivo.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} suppressHydrationWarning />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} suppressHydrationWarning />
      </head>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionRoot>
          <Remote />
          <Hud />
          {children}
          <TransitionOverlay />
          <CursorChip />
          <SceneObserver />
          {process.env.NODE_ENV === "development" ? <DebugScreens /> : null}
        </MotionRoot>
      </body>
    </html>
  );
}
