import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface WeeklyTimelineProps {
  currentWeek: number
  onWeekSelect: (week: number) => void
  completedWeeks: number[]
}

export function WeeklyTimeline({ currentWeek, onWeekSelect, completedWeeks }: WeeklyTimelineProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek)

  const handleWeekClick = (week: number) => {
    setSelectedWeek(week)
    onWeekSelect(week)
  }

  return (
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline Program</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((week) => {
            const isCompleted = completedWeeks.includes(week)
            const isCurrent = week === currentWeek
            const isSelected = week === selectedWeek
            const isPast = week < currentWeek
            const isFuture = week > currentWeek

            return (
              <button
                key={week}
                onClick={() => handleWeekClick(week)}
                disabled={isFuture}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[0.98] active:scale-95",
                  {
                    // Current week - violet/purple
                    "bg-rose-500 text-white shadow-md hover:bg-rose-600": isCurrent && isSelected,
                    "bg-rose-100 text-rose-700 hover:bg-rose-200": isCurrent && !isSelected,

                    // Completed past weeks - green
                    "bg-emerald-500 text-white shadow-md hover:bg-emerald-600": isCompleted && isSelected,
                    "bg-emerald-100 text-emerald-700 hover:bg-emerald-200": isCompleted && !isSelected,

                    // Incomplete past weeks - gray
                    "bg-slate-500 text-white shadow-md hover:bg-slate-600": isPast && !isCompleted && isSelected,
                    "bg-slate-100 text-slate-700 hover:bg-slate-200": isPast && !isCompleted && !isSelected,

                    // Future weeks - disabled
                    "bg-slate-50 text-slate-400 cursor-not-allowed": isFuture,
                  },
                )}
              >
                Minggu {week}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
