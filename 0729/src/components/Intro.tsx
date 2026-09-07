export default function Intro() {
  return (
    <div
      id="main"
      className="max-w-[1100px] mx-auto px-5 pt-[6px] pb-[50px] grid grid-cols-1 min-[641px]:grid-cols-2 gap-5"
    >
      <div className="bg-card backdrop-blur-md border border-border rounded-[14px] px-5 py-[18px]">
        <h3 className="text-xs tracking-[0.1em] text-sub m-0 mb-[10px]">ABOUT THIS GUIDE</h3>
        <p className="text-[13px] m-0 mb-[6px]">
          釜山地下鉄1号線・2号線を軸に、旅行者向けの見どころを駅ごとに整理しました。
        </p>
        <p className="text-[13px] m-0 mb-[6px]">タップで各駅の詳細が開きます。</p>
      </div>
      <div className="bg-card backdrop-blur-md border border-border rounded-[14px] px-5 py-[18px]">
        <h3 className="text-xs tracking-[0.1em] text-sub m-0 mb-[10px]">HOW TO USE</h3>
        <p className="text-[13px] m-0 mb-[6px]">
          下にスクロールすると「Course Preview」でテーマ別コースを、さらに下で路線図全体を確認できます。
        </p>
      </div>
    </div>
  )
}
