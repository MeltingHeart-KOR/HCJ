import PickUpCard from './PickUpCard'

const courses = [
  {
    image: 'https://images.unsplash.com/photo-1596785236414-3b235f4ff58a?w=240&q=70&auto=format&fit=crop',
    line: 'l1' as const,
    lineLabel: '1号線 ・ 釜山駅周辺',
    name: '釜山到着！レトロ街歩き',
    description: '山と海が見渡せる草梁イバグギルを巡る、釜山旅のスタートコース。',
  },
  {
    image: 'https://images.unsplash.com/photo-1712730642507-d4ad0904e997?w=240&q=70&auto=format&fit=crop',
    line: 'l2' as const,
    lineLabel: '2号線 ・ 田浦カフェ街',
    name: 'オシャレカフェ＆トレンド',
    description: '隠れ家カフェや個性派雑貨店を散策する話題のトレンドコース。',
  },
  {
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=300&q=80',
    line: 'l1' as const,
    lineLabel: '1号線 ・ 南浦エリア',
    name: '活気あふれる！ローカルグルメ',
    description: '海鮮市場と活気ある屋台街で釜山名物を食べ歩く満腹コース。',
  },
  {
    image: 'https://images.unsplash.com/photo-1759761383060-e87df86f880f?w=240&q=70&auto=format&fit=crop',
    line: 'l2' as const,
    lineLabel: '2号線 ・ 広安里ビーチ',
    name: 'オーシャンビュー＆ロマンチック夜景',
    description: '広安大橋のライトアップと波音を楽しむナイトヒーリングコース。',
  },
  {
    image: 'https://images.unsplash.com/photo-1766485108563-4fa16ba48140?w=240&q=70&auto=format&fit=crop',
    line: 'l1' as const,
    lineLabel: '1号線 ・ 温泉場エリア',
    name: '癒やしの伝統温泉＆リフレッシュ',
    description: '歴史ある温泉と野外足湯で旅の疲れをほぐすリラックスコース。',
  },
]

export default function PickUpSection() {
  // z-20 keeps the overhanging MAP MORE button above the next section, whose
  // backdrop-filter would otherwise paint over it
  return (
    <section className="relative z-20 bg-card/25 backdrop-blur-sm px-5 pt-[60px] pb-[90px]" id="course-preview">
      <div className="inline-block -rotate-3 mb-[30px] ml-1.5">
        <div
          className="italic text-[#5b6f9e] text-[42px] leading-none"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Course Preview
        </div>
        <span className="block italic text-[13px] text-[#5b6f9e] mt-2 font-medium tracking-[0.05em]">
          ~ 路線図で巡る5つのテーマ旅 ~
        </span>
      </div>
      <div className="relative max-w-[1100px] mx-auto grid grid-cols-1 min-[701px]:grid-cols-2 gap-x-10 gap-y-6 min-[701px]:before:content-[''] min-[701px]:before:absolute min-[701px]:before:left-1/2 min-[701px]:before:-top-2.5 min-[701px]:before:-bottom-2.5 min-[701px]:before:w-0.5 min-[701px]:before:bg-[repeating-linear-gradient(var(--color-navy),var(--color-navy)_6px,transparent_6px,transparent_12px)] min-[701px]:before:opacity-50">
        {courses.map((course) => (
          <PickUpCard key={course.name} {...course} />
        ))}
      </div>
      <a
        href="#map"
        className="absolute right-7 -bottom-[30px] w-[76px] h-[76px] rounded-full bg-navy text-white text-[10.5px] font-bold flex items-center justify-center text-center leading-tight cursor-pointer"
      >
        MAP
        <br />
        MORE
      </a>
    </section>
  )
}
