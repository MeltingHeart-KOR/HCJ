export default function Nav() {
  return (
    <nav className="fixed top-4 inset-x-0 z-50 flex items-center gap-5 max-w-[1100px] mx-auto px-[20px] py-[10px] text-[11px] text-sub tracking-[0.05em] bg-card-strong backdrop-blur-lg rounded-full border border-border">
      <div className="flex items-center gap-2 font-bold text-sm tracking-[0.06em] text-[#5b6f9e] mr-auto">
        <svg viewBox="0 0 40 40" fill="none" className="w-[18px] h-[18px]">
          <path d="M4 6h20l12 14-12 14H4V6z" fill="var(--color-navy)" />
        </svg>
        BUSAN GUIDE
      </div>
      <a href="#course-preview">COURSE PREVIEW</a>
      <a href="#map">地下鉄MAP</a>
    </nav>
  )
}
