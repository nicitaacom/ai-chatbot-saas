"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import useThemeStore from "@/stores/useThemeStore"

const slides = [
  { src: "/AI-copy-paste-solution.png", alt: "AI Copy Paste Solution" },
  { src: "/AI-fast-reply.png", alt: "AI Fast Reply" },
  { src: "/AI-trained-on-CX.png", alt: "AI Trained on CX" },
  { src: "/i18n-AI.png", alt: "i18n AI" },
]

export function Slider({ getThemeHsl }: { getThemeHsl: (theme: string) => string }) {
  const { theme } = useThemeStore()

  const [currentSlide, setCurrentSlide] = useState(0)
  const [progresses, setProgresses] = useState<number[]>(Array(slides.length).fill(0))
  const advanceScheduled = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgresses(prev => {
        const updated = [...prev]

        if (updated[currentSlide] < 100) {
          updated[currentSlide] = Math.min(updated[currentSlide] + 1.25, 100)
        } else {
          if (!advanceScheduled.current) {
            advanceScheduled.current = true
            setTimeout(() => {
              advanceScheduled.current = false
              if (currentSlide < slides.length - 1) {
                setCurrentSlide(s => s + 1)
                setProgresses(p => p.map((val, i) => (i < currentSlide + 1 ? 100 : i === currentSlide + 1 ? 0 : val)))
              } else {
                setCurrentSlide(0)
                setProgresses(Array(slides.length).fill(0))
              }
            }, 100)
          }
        }

        return updated
      })
    }, 100)

    return () => clearInterval(timer)
  }, [currentSlide, slides.length])

  const handleBarClick = (index: number) => {
    setCurrentSlide(index)
    setProgresses(prev => prev.map((_, i) => (i < index ? 100 : i === index ? 0 : 0)))
  }

  return (
    <div className="flex items-center justify-center p-8 laptop:p-16 border-l border-border-color/20 relative">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, hsl(${getThemeHsl(theme)}) 5%, hsl(${getThemeHsl(theme).split(",")[0]}, ${Math.max(10, parseInt(getThemeHsl(theme).split(",")[1]) / 4)}%, 5%) 50%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 via-foreground/5 to-background" />
      <div className="w-full max-w-2xl">
        {/* Slider Container */}
        <div className="bg-foreground/40 backdrop-blur-sm rounded-2xl border border-border-color/20 shadow-lg overflow-hidden">
          {/* Slider Content */}
          <div className="relative aspect-video overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0 flex items-center justify-center">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-3 p-6 bg-foreground/20 border-t border-border-color/10">
            {slides.map((_, index) => (
              <button
                key={index}
                className="group relative w-12 h-2 bg-foreground/30 rounded-full overflow-hidden transition-all duration-200 hover:scale-105 active:scale-98"
                onClick={() => handleBarClick(index)}>
                <div
                  className="h-full bg-brand rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${Math.min(progresses[index], 100)}%` }}
                />
                <div className="absolute inset-0 bg-brand/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
