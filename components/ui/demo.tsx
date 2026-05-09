"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Calendar20Props {
  onConfirm?: (date: Date | undefined, time: string | null) => void;
  isBooking?: boolean;
  rate?: string;
  selectedDate?: Date;
  selectedTime?: string | null;
  onDateChange?: (date: Date | undefined) => void;
  onTimeChange?: (time: string | null) => void;
}

export function Calendar20({ 
  onConfirm, 
  isBooking, 
  rate,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange
}: Calendar20Props) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(new Date())
  const [internalTime, setInternalTime] = React.useState<string | null>("10:00")

  const date = selectedDate !== undefined ? selectedDate : internalDate;
  const setDate = (d: Date | undefined) => {
    setInternalDate(d);
    onDateChange?.(d);
  };

  const time = selectedTime !== undefined ? selectedTime : internalTime;
  const setTime = (t: string | null) => {
    setInternalTime(t);
    onTimeChange?.(t);
  };
  const timeSlots = Array.from({ length: 37 }, (_, i) => {
    const totalMinutes = i * 15
    const hour = Math.floor(totalMinutes / 60) + 9
    const minute = totalMinutes % 60
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  })

  const bookedDates = Array.from(
    { length: 3 },
    (_, i) => new Date(2025, 5, 17 + i)
  )

  return (
    <Card className="gap-0 p-0 border-white/10 bg-white/5 backdrop-blur-xl">
      <CardContent className="relative p-0 md:pr-40">
        <div className="p-4 sm:p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
            disabled={bookedDates}
            showOutsideDays={false}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersClassNames={{
              booked: "[&>button]:line-through opacity-100",
            }}
            className="bg-transparent p-0 [--cell-size:--spacing(9)] md:[--cell-size:--spacing(10)]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("en-US", { weekday: "short" })
              },
            }}
          />
        </div>
        <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t border-white/10 p-4 sm:p-6 md:absolute md:max-h-none md:w-40 md:border-t-0 md:border-l">
          <div className="grid gap-2">
            {timeSlots.map((timeSlot) => (
              <Button
                key={timeSlot}
                variant={time === timeSlot ? "default" : "outline"}
                onClick={() => setTime(timeSlot)}
                className={`w-full shadow-none ${time === timeSlot ? 'bg-purple-500 text-white' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                {timeSlot}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t border-white/10 px-6 !py-5 md:flex-row items-center">
        <div className="flex-1">
          <div className="text-[10px] text-gray-300">
            {date && time ? (
              <>
                Meeting on <span className="font-bold text-white">{date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}</span> at <span className="font-bold text-white">{time}</span>
              </>
            ) : (
              <>Select date & time</>
            )}
          </div>
          {rate && (
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-white font-mono">{rate.split('/')[0]}</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">/{rate.split('/')[1] || 'hr'}</span>
            </div>
          )}
        </div>
        <Button
          disabled={!date || !time || isBooking}
          onClick={() => onConfirm?.(date, time)}
          className="w-full md:w-auto bg-white text-black hover:bg-emerald-400 hover:text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl transition-all active:scale-95"
        >
          {isBooking ? "Confirming..." : "Confirm Session"}
        </Button>
      </CardFooter>
    </Card>
  )
}
