"use client"

import { useI18n } from "@/locales/client"
import { useState } from "react"
import { FiCheck } from "react-icons/fi"
import "../globals.css"

interface PricingCardProps {
  plan: string
  price: string
  yearlyPrice: string
  period: string
  features: string[]
  isPopular: boolean
  buttonText: string
  isYearly: boolean
  t: any
}

function PricingCard({ plan, price, yearlyPrice, period, features, isPopular, buttonText, isYearly, t }: PricingCardProps) {
  const currentPrice = isYearly ? yearlyPrice : price

  return (
    <div
      className={`bg-background border rounded-2xl p-8 transition-all duration-300 relative ${
        isPopular ? "border-brand ring-2 ring-brand/20 scale-105" : "border-border-color/30"
      }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-brand text-title-foreground text-sm px-4 py-1 rounded-full font-medium">POPULAR</div>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-title mb-2">{t(plan)}</h3>
        <p className="text-subTitle text-sm">{t(`plan.${plan.toLowerCase()}.subtitle`)}</p>
      </div>
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-title mb-1">{currentPrice}</div>
        <div className="text-subTitle text-sm">/{period}</div>
      </div>
      <button
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 active:scale-98 mb-8 ${
          isPopular
            ? "bg-brand hover:bg-brand/90 text-title-foreground"
            : "bg-foreground/40 hover:bg-foreground/60 border border-border-color/30 text-title"
        }`}>
        {buttonText}
      </button>
      <div className="space-y-4">
        <div className="text-title font-semibold mb-4">{t("plan.features")}</div>
        {features.map(function (feature, idx) {
          return (
            <div key={idx} className="flex items-start gap-3">
              <FiCheck className="text-success flex-shrink-0 mt-0.5 text-sm" />
              <span className="text-subTitle text-sm leading-relaxed">{t(feature)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const [isYearly, setIsYearly] = useState(false)
  const [isSubscription, setIsSubscription] = useState(true)
  const t = useI18n()

  const pricingPlans: Omit<PricingCardProps, "isYearly" | "t">[] = [
    {
      plan: "Free",
      price: "$0",
      yearlyPrice: "$0",
      period: "month",
      features: ["plan.feature.reports.10", "plan.feature.support.chat", "plan.feature.selling.local.3", "plan.feature.pos.lite"],
      buttonText: "Current plan", // TODO - make it depending on current plan
      isPopular: false,
    },
    {
      plan: "Basic",
      price: "$9",
      yearlyPrice: "$90",
      period: "month",
      features: [
        "plan.feature.reports.custom",
        "plan.feature.inventory.100",
        "plan.feature.support.enhanced",
        "plan.feature.selling.local.5",
        "plan.feature.staff.15",
        "plan.feature.checkout.10x",
      ],
      buttonText: "Get Advanced",
      isPopular: true,
    },
    {
      plan: "Pro",
      price: "$49",
      yearlyPrice: "$490",
      period: "month",
      features: [
        "plan.feature.reports.custom",
        "plan.feature.inventory.200",
        "plan.feature.support.priority",
        "plan.feature.selling.local.50",
        "plan.feature.staff.unlimited",
        "plan.feature.checkout.40x",
      ],
      buttonText: "Get Plus",
      isPopular: false,
    },
  ]

  return (
    <main className="min-h-screen bg-background text-title font-primary mx-4 mb-4">
      {/* Pricing Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-3xl font-bold text-title">{t("plan.title")}</h1>

            {/* Toggle Controls */}
            <div className="flex flex-col items-end gap-6">
              {/* Subscription/One-time Toggle */}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${isSubscription ? "text-title" : "text-subTitle"}`}>
                  {t("plan.subscription")}
                </span>
                <button
                  onClick={function () {
                    setIsSubscription(!isSubscription)
                  }}
                  className="relative w-12 h-6 bg-border-color/20 rounded-full transition-all duration-200 active:scale-95">
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-brand rounded-full transition-transform duration-200 ${
                      !isSubscription ? "transform translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Monthly/Yearly Toggle */}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${!isYearly ? "text-title" : "text-subTitle"}`}>{t("plan.monthly")}</span>
                <button
                  onClick={function () {
                    setIsYearly(!isYearly)
                  }}
                  className="relative w-12 h-6 bg-border-color/20 rounded-full transition-all duration-200 active:scale-95">
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-brand rounded-full transition-transform duration-200 ${
                      isYearly ? "transform translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid laptop:grid-cols-3 gap-8">
            {pricingPlans.map(function (plan, idx) {
              return <PricingCard key={idx} {...plan} isYearly={isYearly} t={t} />
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
