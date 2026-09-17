import { Button } from "./Button";
import { endOfWeek, format, startOfWeek } from "date-fns";
export const Header = ({ onPreviousWeek, goToNextWeek ,currentDate,habits}) => {

const weekStart=startOfWeek(currentDate,{weekStartsOn:1})
const weekEnd=endOfWeek(currentDate,{weekStartsOn:1})

const today=format(new Date(),"yyyy-MM-dd")
const completeToday=habits.filter((habit)=>habit.completedDates.includes(today)).length
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
          Habit Tracker
        </h1>
        <span className="text-zinc-500 text-sm">
          {completeToday}/{habits.length} done today
        </span>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <span className="text-zinc-500 text-sm">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
        </span>
        <div className="flex  items-center gap-2">
          <Button onClick={onPreviousWeek}>←</Button>
          <Button onClick={goToNextWeek}>→</Button>
        </div>
      </div>
    </header>
  );
};
