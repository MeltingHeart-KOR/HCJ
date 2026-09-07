type Line = 'l1' | 'l2'

interface PickUpCardProps {
  image: string
  line: Line
  lineLabel: string
  name: string
  description: string
}

export default function PickUpCard({ image, line, lineLabel, name, description }: PickUpCardProps) {
  const lineColor = line === 'l1' ? 'bg-line1' : 'bg-line2'

  return (
    <div className="bg-card-strong backdrop-blur-md border border-border rounded-xl p-[14px] flex gap-3 shadow-[0_6px_20px_rgba(18,60,76,0.12)]">
      <img
        src={image}
        alt=""
        className="w-[78px] h-[78px] rounded-lg flex-none object-cover bg-neutral-300"
      />
      <div>
        <span
          className={`${lineColor} text-white text-[10px] font-bold px-2 py-[2px] rounded-full inline-block mb-[6px]`}
        >
          {lineLabel}
        </span>
        <b className="text-[13.5px] block mb-1">{name}</b>
        <span className="text-xs text-sub">{description}</span>
      </div>
    </div>
  )
}
