import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  ink: '#070F1D',
  sea: '#6FFFE8',
  blue: '#80B9FF',
  white: '#F3F8FF',
  muted: '#91A9BE',
  line: '#294052',
};

const clip = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const font = 'Inter, "Aptos", "Segoe UI", Arial, sans-serif';

const visible = (frame: number, start: number, on: number, off: number, end: number) =>
  interpolate(frame, [start, on, off, end], [0, 1, 1, 0], clip);

const enter = (frame: number, fps: number, at: number) =>
  spring({frame: frame - at, fps, config: {damping: 200, mass: 0.7, stiffness: 100}});

const tag: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 13,
  color: C.sea,
  fontSize: 19,
  letterSpacing: 4,
  fontWeight: 750,
  textTransform: 'uppercase',
};

const textGradient: React.CSSProperties = {
  background: 'linear-gradient(100deg, #FFFFFF 8%, #D0F2F2 57%, #77FDE2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={tag}>
    <span style={{
      width: 9, height: 9, borderRadius: 99, background: C.sea,
      boxShadow: '0 0 22px rgba(111,255,232,0.85)',
    }}/>
    {children}
  </div>
);

const Scene: React.FC<{
  opacity: number;
  shift: number;
  kicker: string;
  a: string;
  b: string;
  description: string;
}> = ({opacity, shift, kicker, a, b, description}) => (
  <div style={{
    position: 'absolute', left: 148, top: 270, width: 1060,
    opacity, transform: 'translateY(' + shift + 'px)',
  }}>
    <Kicker>{kicker}</Kicker>
    <div style={{
      marginTop: 38, fontFamily: font, lineHeight: 0.94,
      fontWeight: 820, fontSize: 127, letterSpacing: -8,
    }}>
      <div style={{color: C.white}}>{a}</div>
      <div style={textGradient}>{b}</div>
    </div>
    <div style={{
      marginTop: 48, paddingLeft: 25, borderLeft: '3px solid ' + C.sea,
      fontSize: 29, lineHeight: 1.45, width: 700, color: '#B9CBD8',
      fontWeight: 430, letterSpacing: 0.4,
    }}>
      {description}
    </div>
  </div>
);

const OrbitVisual: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / 30;
  const theta = t * 0.66;
  const x = 426 + 300 * Math.cos(theta);
  const y = 370 + 190 * Math.sin(theta);
  const p = (Math.sin(t * 2.7) + 1) / 2;
  return (
    <div style={{
      position: 'absolute', left: 1000, top: 118, width: 850, height: 780,
      opacity: 0.92, transform: 'rotate(-8deg)',
    }}>
      <svg viewBox="0 0 850 780" width="850" height="780">
        <defs>
          <radialGradient id="core" cx="40%" cy="35%">
            <stop offset="0" stopColor="#C8FFFF"/>
            <stop offset="0.3" stopColor="#79EEDF"/>
            <stop offset="1" stopColor="#176C8D"/>
          </radialGradient>
          <linearGradient id="orbit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5DBDC8" stopOpacity="0.1"/>
            <stop offset="0.55" stopColor="#75EEDD" stopOpacity="0.8"/>
            <stop offset="1" stopColor="#2D4C7C" stopOpacity="0.25"/>
          </linearGradient>
          <filter id="blur"><feGaussianBlur stdDeviation="34"/></filter>
          <filter id="glow"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <ellipse cx="430" cy="375" rx="290" ry="265" fill="#0F5578" opacity="0.21" filter="url(#blur)"/>
        <circle cx="425" cy="375" r="265" stroke="#264E68" strokeWidth="2" strokeDasharray="2 14" fill="none"/>
        <circle cx="425" cy="375" r="207" stroke="#426E7B" strokeWidth="1.5" opacity="0.6" fill="none"/>
        <ellipse cx="425" cy="375" rx="300" ry="190" stroke="url(#orbit)" strokeWidth="3" fill="none"/>
        <ellipse cx="425" cy="375" rx="158" ry="298" stroke="#3F6C79" opacity="0.55" strokeWidth="2" fill="none" transform="rotate(37 425 375)"/>
        <ellipse cx="425" cy="375" rx="195" ry="295" stroke="#2C536B" opacity="0.65" strokeWidth="2" fill="none" transform="rotate(-36 425 375)"/>
        <circle cx="425" cy="375" r="111" fill="#0E3850" stroke="#34889A" strokeWidth="2"/>
        <circle cx="425" cy="375" r="92" fill="url(#core)" opacity="0.82"/>
        <circle cx="410" cy="348" r="34" fill="#DBFFFF" opacity={0.28 + p * 0.12} filter="url(#blur)"/>
        <circle cx="425" cy="375" r={123 + p * 8} stroke="#7DEDE9" strokeWidth="2" opacity={0.22 + p * 0.2} fill="none"/>
        <circle cx={x} cy={y} r="22" fill="#6FFFE8" opacity="0.45" filter="url(#glow)"/>
        <circle cx={x} cy={y} r="11" fill="#C6FFF6"/>
        {Array.from({length: 11}, (_, i) => {
          const a = i * (Math.PI * 2 / 11) + t * (i % 2 === 0 ? 0.18 : -0.13);
          const r = 270 + (i % 3) * 19;
          return <circle key={i} cx={425 + r * Math.cos(a)} cy={375 + r * Math.sin(a)}
            r={i % 3 === 0 ? 4.5 : 2.5} fill={i % 3 === 0 ? C.sea : C.blue} opacity={0.45 + 0.3 * Math.sin(t + i)}/>;
        })}
        <g opacity="0.83" fontFamily={font} fontSize="16" fill="#A1D4DF" letterSpacing="3">
          <text x="582" y="124">01 / CARRIER</text>
          <text x="625" y="652">02 / INTERFACE</text>
          <text x="64" y="420">03 / RESPONSE</text>
        </g>
      </svg>
    </div>
  );
};

export const MolecularTransport: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s1 = visible(frame, 0, 20, 115, 133);
  const s2 = visible(frame, 133, 151, 267, 288);
  const s3 = visible(frame, 288, 311, 436, 449);
  const progress = interpolate(frame, [0, 449], [0, 100], clip);

  return (
    <AbsoluteFill style={{
      overflow: 'hidden', backgroundColor: C.ink, color: C.white, fontFamily: font,
      backgroundImage: [
        'radial-gradient(ellipse 850px 730px at 77% 42%, rgba(20,112,117,0.27), transparent 72%)',
        'radial-gradient(ellipse 950px 850px at 10% 95%, rgba(21,49,91,0.4), transparent 78%)',
        'linear-gradient(135deg, #081323, #07101C)',
      ].join(','),
    }}>
      <AbsoluteFill style={{
        opacity: 0.26,
        backgroundImage: 'linear-gradient(#315263 1px, transparent 1px), linear-gradient(90deg, #315263 1px, transparent 1px)',
        backgroundSize: '84px 84px',
        maskImage: 'linear-gradient(90deg, transparent 0%, black 65%)',
      }}/>
      <div style={{
        position: 'absolute', top: 102, left: 148, width: 1624,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: 21, letterSpacing: 5, fontWeight: 780, textTransform: 'uppercase',
          color: '#E5F5FA',
        }}>
          AL-RUWEIDI <span style={{color: C.sea}}> / MOTION LAB</span>
        </div>
        <div style={{fontSize: 17, fontWeight: 600, letterSpacing: 2.7, color: C.muted}}>
          SCIENCE FILM 001&nbsp; / &nbsp;2026
        </div>
      </div>
      <div style={{
        position: 'absolute', top: 157, left: 148, width: 1624, height: 1,
        background: 'linear-gradient(90deg, rgba(123,220,216,.48), rgba(123,220,216,.07))',
      }}/>
      <OrbitVisual frame={frame}/>
      <Scene opacity={s1} shift={(1 - enter(frame, fps, 4)) * 28}
        kicker="MOLECULAR PHARMACEUTICS"
        a="A MOLECULE" b="IN MOTION"
        description="Every therapeutic has a journey. Engineer what happens along the way."/>
      <Scene opacity={s2} shift={(1 - enter(frame, fps, 133)) * 35}
        kicker="FROM DELIVERY TO RESPONSE"
        a="CONTROL THE" b="JOURNEY"
        description="Deposition, transport, tissue interaction. One connected design problem."/>
      <Scene opacity={s3} shift={(1 - enter(frame, fps, 288)) * 35}
        kicker="RESEARCH / DESIGN / MECHANISM"
        a="DESIGN THE" b="DESTINATION"
        description="A translational approach to nanocarriers, pulmonary therapeutics and living systems."/>
      <div style={{
        position: 'absolute', bottom: 102, left: 148, right: 148,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{display: 'flex', gap: 12}}>
          {['DEPOSITION', 'INTERFACE', 'DELIVERY'].map((word, i) => {
            const active = Math.min(2, Math.floor(frame / 150)) === i;
            return (
              <div key={word} style={{
                padding: '13px 20px', borderRadius: 4,
                background: active ? 'rgba(98,244,219,0.12)' : 'rgba(13,40,56,0.55)',
                border: '1px solid ' + (active ? '#58D9CF' : '#294354'),
                color: active ? '#A0FFF3' : '#7491A7',
                fontWeight: 700, fontSize: 15, letterSpacing: 2.2,
              }}>{String(i + 1).padStart(2, '0')} / {word}</div>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <span style={{fontSize: 15, color: C.muted, letterSpacing: 3}}>EXPLORATION</span>
          <span style={{width: 160, height: 3, background: '#264052'}}>
            <span style={{display: 'block', width: progress + '%', height: '100%', background: C.sea}}/>
          </span>
          <span style={{fontSize: 17, fontWeight: 700, color: C.sea}}>
            {String(Math.floor(progress)).padStart(2, '0')}%
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
