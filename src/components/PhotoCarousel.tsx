import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'

export default function PhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const touchStart = useRef<number | null>(null)
  if (!photos?.length) return <div className="detail-placeholder"><span>BY</span><strong>CARS</strong></div>
  const prev = () => setIndex((index - 1 + photos.length) % photos.length)
  const next = () => setIndex((index + 1) % photos.length)

  return (
    <div
      className="carousel"
      onTouchStart={e => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStart.current === null) return
        const delta = e.changedTouches[0].clientX - touchStart.current
        if (Math.abs(delta) > 45) delta < 0 ? next() : prev()
        touchStart.current = null
      }}
    >
      <img src={photos[index]} alt={`${alt} - photo ${index + 1}`} />
      {photos.length > 1 && <>
        <button className="carousel-arrow left" onClick={prev} aria-label="Photo précédente"><ChevronLeft /></button>
        <button className="carousel-arrow right" onClick={next} aria-label="Photo suivante"><ChevronRight /></button>
        <div className="carousel-count">{index + 1} / {photos.length}</div>
        <div className="carousel-dots">{photos.map((_, i) => <button key={i} aria-label={`Photo ${i + 1}`} onClick={() => setIndex(i)} className={i === index ? 'active' : ''} />)}</div>
      </>}
    </div>
  )
}
