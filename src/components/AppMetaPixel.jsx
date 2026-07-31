import { useEffect } from 'react';
import { fetchPublicPixelId } from '../lib/metaPixelApi';

// Pixel Meta de l'app TonTunnel elle-même (configuré dans le panneau admin)
// — distinct du pixel par tunnel (Brand Kit, voir PublishedFunnelPage.jsx)
// qui suit les visiteurs des pages publiées par les vendeurs. Celui-ci sert
// à suivre les conversions de la publicité faite AUTOUR de TonTunnel
// (inscriptions, passages en plan payant).
export default function AppMetaPixel() {
  useEffect(() => {
    let cancelled = false;

    fetchPublicPixelId()
      .then(({ pixelId }) => {
        if (cancelled || !pixelId || window.fbq) return;

        const script = document.createElement('script');
        script.setAttribute('data-tontunnel-pixel', 'app');
        script.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
        document.head.appendChild(script);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
