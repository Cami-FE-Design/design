"use client"

import { ClockIcon, MapPinIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatTime12h,
  getDayIdFromDate,
  isOpenNow,
  type PublicBusiness,
  type WeekDay,
} from "@/lib/public-business"
import { cn } from "@/lib/utils"

export function PublicBookingCard({ business }: { business: PublicBusiness }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const today: WeekDay | null = now ? getDayIdFromDate(now) : null
  const open = now ? isOpenNow(business.hours, now) : null
  const todaySchedule = today ? business.hours[today] : null

  const fullAddress = [business.street, business.city, business.emirate].filter(Boolean).join(", ")
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {business.displayName}
        </h1>

        {open !== null && todaySchedule && (
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon
              className={cn(
                "size-4 shrink-0",
                open ? "text-cami-green-11" : "text-muted-foreground",
              )}
              aria-hidden
            />
            {open && !todaySchedule.closed ? (
              <span className="flex items-center gap-1">
                <span className="font-medium text-cami-green-11">Open</span>
                <span className="text-foreground">until {formatTime12h(todaySchedule.close)}</span>
              </span>
            ) : todaySchedule.closed ? (
              <span className="text-muted-foreground">Closed today</span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="font-medium text-muted-foreground">Closed</span>
                <span className="text-foreground">opens {formatTime12h(todaySchedule.open)}</span>
              </span>
            )}
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <MapPinIcon className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
          <div className="flex flex-col gap-0.5">
            <p className="text-foreground">{fullAddress}</p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="link w-fit font-medium text-cami-violet-8"
            >
              Get directions
            </a>
          </div>
        </div>

        <Button size="lg" radius="full" className="w-full">
          Book now
        </Button>
      </CardContent>
    </Card>
  )
}
