const LINE1 = 'var(--color-line1)'
const LINE2 = 'var(--color-line2)'
const INK = 'var(--color-ink)'
const PINK_BG = 'var(--color-pink-bg)'
const NOTE = '#7a5566'

type StationLinkProps = {
  href: string
  children: React.ReactNode
}

function StationLink({ href, children }: StationLinkProps) {
  return (
    <a href={href} className="station-link">
      {children}
    </a>
  )
}

export default function MetroMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 680 920" role="img" className={className}>
      <title>釜山地下鉄1・2号線を左右対称のハート型に再構成した手描き路線図</title>
      <desc>
        温泉場の温泉、広安の海、釜山駅の列車、南浦の映画フィルムリールの落書きが各駅の横に描かれ、西面は乗り換えハブとして表示されたハート型の路線図
      </desc>

      {/* header badge + line chips */}
      <rect x="30" y="24" width="150" height="30" rx="15" fill={INK} />
      <text
        x="105"
        y="44"
        fontFamily="sans-serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="1.5"
        fill={PINK_BG}
        textAnchor="middle"
      >
        BUSAN METRO
      </text>
      <circle cx="600" cy="39" r="16" fill={LINE1} />
      <text x="600" y="44" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">
        1
      </text>
      <circle cx="640" cy="39" r="16" fill={LINE2} />
      <text x="640" y="44" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF" textAnchor="middle">
        2
      </text>

      {/* small hearts */}
      <g stroke={INK} strokeWidth="1.5" fill="none" opacity="0.55">
        <path d="M255,95 c-3,-6 -12,-4 -12,3 c0,6 12,14 12,14 c0,0 12,-8 12,-14 c0,-7 -9,-9 -12,-3 Z" />
        <path d="M95,470 c-2.5,-5 -10,-3.5 -10,2.5 c0,5 10,11.5 10,11.5 c0,0 10,-6.5 10,-11.5 c0,-6 -7.5,-7.5 -10,-2.5 Z" />
      </g>

      {/* heart-shaped lines */}
      <path
        d="M340,640 C340,640 100,479.5 100,337 C100,244.5 157,209.5 227.5,209.5 C278.5,209.5 319,239.5 340,283"
        fill="none"
        stroke={LINE1}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M340,283 C361,239.5 401.5,209.5 452.5,209.5 C523,209.5 580,244.5 580,337 C580,479.5 340,640 340,640"
        fill="none"
        stroke={LINE2}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M340,640 Q390,652 430,668" fill="none" stroke={LINE2} strokeWidth="6" strokeLinecap="round" />
      <path d="M340,640 Q380,682 400,730 Q412,760 400,760" fill="none" stroke={LINE1} strokeWidth="6" strokeLinecap="round" />
      <path d="M400,730 Q425,790 345,830" fill="none" stroke={LINE1} strokeWidth="6" strokeLinecap="round" />

      {/* hot spring doodle (Oncheonjang) */}
      <g stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round">
        <ellipse cx="55" cy="240" rx="26" ry="12" />
        <path d="M35,225 Q31,205 42,192" />
        <path d="M55,225 Q51,199 64,183" />
        <path d="M75,225 Q73,206 84,194" />
      </g>

      {/* sailboat + waves doodle (Gwangan) */}
      <g stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M600,182 L600,198 L613,196 Z" />
        <path d="M593,198 Q600,203 610,198" />
        <path d="M595,199 Q607,192 619,199 Q631,206 643,199 Q650,194 656,199" />
        <path d="M595,214 Q607,207 619,214 Q631,221 643,214 Q650,209 656,214" />
        <path d="M595,229 Q607,222 619,229 Q631,236 643,229 Q650,224 656,229" />
      </g>

      {/* train doodle (Busan Station) */}
      <g stroke={INK} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d="M480,765 L458,778 L480,791 Z" />
        <rect x="480" y="765" width="85" height="26" rx="13" />
        <rect x="500" y="770" width="13" height="9" rx="3" />
        <rect x="519" y="770" width="13" height="9" rx="3" />
        <rect x="538" y="770" width="13" height="9" rx="3" />
        <circle cx="505" cy="798" r="7" />
        <circle cx="552" cy="798" r="7" />
        <line x1="452" y1="805" x2="595" y2="805" />
        <path d="M572,772 L590,766 M572,780 L594,774 M572,788 L590,782" />
      </g>

      {/* film reel doodle (Nampo) */}
      <g stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="190" cy="812" r="30" />
        <circle cx="190" cy="812" r="6" />
        <circle cx="206" cy="812" r="5" />
        <circle cx="174" cy="812" r="5" />
        <circle cx="190" cy="828" r="5" />
        <circle cx="190" cy="796" r="5" />
        <path d="M167,836 Q150,858 170,873 Q188,886 176,902" />
      </g>

      {/* stations — clickable links to each station page */}
      <g fontFamily="sans-serif" fontSize="14" fill={INK}>
        <StationLink href="/pages/oncheonjang.html">
          <circle cx="227.5" cy="209.5" r="7" fill={PINK_BG} stroke={LINE1} strokeWidth="3.5" />
          <text x="196" y="188" textAnchor="end" fontWeight="700">
            温泉場
          </text>
          <text x="196" y="203" textAnchor="end" fontSize="11" fill={NOTE}>
            1号線・温泉
          </text>
        </StationLink>

        <StationLink href="/pages/gwangan.html">
          <circle cx="452.5" cy="209.5" r="7" fill={PINK_BG} stroke={LINE2} strokeWidth="3.5" />
          <text x="472" y="188" fontWeight="700">
            広安
          </text>
          <text x="472" y="203" fontSize="11" fill={NOTE}>
            2号線・海
          </text>
        </StationLink>

        <StationLink href="/pages/jeonpo.html">
          <circle cx="430" cy="668" r="6.5" fill={PINK_BG} stroke={LINE2} strokeWidth="3.5" />
          <text x="450" y="666" fontWeight="700">
            田浦
          </text>
          <text x="450" y="681" fontSize="11" fill={NOTE}>
            2号線・カフェ通り
          </text>
        </StationLink>

        <StationLink href="/pages/seomyeon.html">
          <circle cx="340" cy="640" r="10" fill={PINK_BG} stroke={INK} strokeWidth="3.5" />
          <circle cx="340" cy="640" r="4.5" fill={INK} />
          <text x="306" y="662" textAnchor="end" fontWeight="700">
            西面
          </text>
          <text x="306" y="678" textAnchor="end" fontSize="11" fill={NOTE}>
            乗り換えハブ
          </text>
        </StationLink>

        <StationLink href="/pages/busan-station.html">
          <circle cx="400" cy="730" r="6.5" fill={PINK_BG} stroke={LINE1} strokeWidth="3.5" />
          <text x="422" y="728" fontWeight="700">
            釜山駅
          </text>
          <text x="422" y="743" fontSize="11" fill={NOTE}>
            1号線・KTX乗り換え
          </text>
        </StationLink>

        <StationLink href="/pages/nampo.html">
          <circle cx="345" cy="830" r="6.5" fill={PINK_BG} stroke={LINE1} strokeWidth="3.5" />
          <text x="320" y="860" textAnchor="middle" fontWeight="700">
            南浦
          </text>
          <text x="320" y="876" textAnchor="middle" fontSize="11" fill={NOTE}>
            1号線・BIFF広場
          </text>
        </StationLink>
      </g>
    </svg>
  )
}
