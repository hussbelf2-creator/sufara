import { useTranslation } from 'react-i18next';
import Split from './Split';
import { videoCover, videoDuration, videoUrl } from '@/mocks/home';

/* One chapter, one continuous take, exactly one screen tall.
   The beats are timed to the acts of the shot list (14 s total):
     act 1  0–5 s  warehouse flow   -> brand / overview
     act 2  5–7 s  ambassador scan  } merged (2 s < 4 s minimum)
     act 3  7–10 s travel home      } 5–10 s, 5 s
     act 4 10–12 s ambassador pride } merged
     act 5 12–14 s at home          } 10–14 s, 4 s
   All copy sits on the physical left / bottom, away from the STA cartons on the right. */
export default function Chapter() {
  const { t } = useTranslation();

  return (
    <section
      className="chapter"
      data-video={videoUrl}
      data-duration={String(videoDuration)}
      data-poster={videoCover}
      data-label={t('home.chapter.label')}
    >
      <div className="stage">
        <img
          className="plate"
          src={videoCover}
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          alt={t('home.chapter.alt')}
        />
        <div className="veil" aria-hidden="true" />
        <div className="veil veil-light" aria-hidden="true" />

        <div
          className="beat"
          data-from="0"
          data-to="0.357"
          data-pos="left"
          data-depth="soft"
          data-tone="dark"
          data-motion="track"
          id="overview"
        >
          <p className="stamp">{t('home.chapter.overview.stamp')}</p>
          <h2 data-split="lines"><Split text={t('home.chapter.overview.title')} /></h2>
          <p className="sub">{t('home.chapter.overview.sub')}</p>
        </div>

        <div
          className="beat"
          data-from="0.357"
          data-to="0.714"
          data-pos="bottom"
          data-depth="soft"
          data-tone="light"
          data-motion="rise"
          id="ambassador"
        >
          <p className="stamp">{t('home.chapter.ambassador.stamp')}</p>
          <h2 data-split="lines"><Split text={t('home.chapter.ambassador.title')} /></h2>
          <p className="sub">{t('home.chapter.ambassador.sub')}</p>
        </div>

        <div
          className="beat"
          data-from="0.714"
          data-to="1"
          data-pos="left"
          data-depth="soft"
          data-tone="dark"
          data-motion="drift"
          id="shop"
        >
          <p className="stamp">{t('home.chapter.trust.stamp')}</p>
          <h2 data-split="lines"><Split text={t('home.chapter.trust.title')} /></h2>
          <p className="sub">{t('home.chapter.trust.sub')}</p>
          <ul className="chips" data-side="right">
            {(t('home.chapter.trust.chips', { returnObjects: true }) as unknown as string[]).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <a className="cta" href="#join">{t('home.chapter.trust.cta')}</a>
        </div>

        <div className="scroll-cue" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}