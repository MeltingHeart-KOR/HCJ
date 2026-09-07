import MetroMap from './MetroMap'

export default function MetroMapSection() {
  return (
    <section className="bg-card/35 backdrop-blur-sm px-5 pt-[70px] pb-[90px]" id="map">
      <h2
        className="flex flex-col items-center gap-2 text-center m-0 mb-[46px]"
        style={{ fontFamily: 'var(--font-rounded)' }}
      >
        <span className="text-[17px] font-extrabold text-ink tracking-[0.03em]">地下鉄で行く！</span>
        <span className="inline-flex items-center gap-2.5 text-[34px] sm:text-[46px] font-black text-[#5b6f9e] leading-[1.25]">
          釜山ときめきマップ
          <svg width="34" height="34" viewBox="0 0 24 24" fill="var(--color-pink)" aria-hidden="true" className="flex-none">
            <path d="M12 21.3s-7.2-4.4-9.8-9C.6 8.1 2.1 4 6.3 4c2.1 0 3.8 1.3 5.7 3.4C13.9 5.3 15.6 4 17.7 4c4.2 0 5.7 4.1 4.1 8.3-2.6 4.6-9.8 9-9.8 9z" />
          </svg>
        </span>
      </h2>
      <div className="max-w-[840px] mx-auto">
        <MetroMap className="w-full h-auto block" />
      </div>
    </section>
  )
}
