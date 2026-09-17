import { Button } from "./Button";
import Swal from "sweetalert2";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isBefore,
  isFuture,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { useEffect, useState } from "react";
export const HabitList = ({
  habits,
  onDeleteHabit,
  onToggleHabitDate,
  currentDate
}) => {
  const habitPerPages=2
  const [currentPage,setCurrentPage]=useState(1)
  const totalPages=Math.ceil(habits.length/habitPerPages)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const startIndex=(currentPage-1)*habitPerPages
  const visibleHabits=habits.slice(startIndex,startIndex+habitPerPages)
  if (habits.length === 0) {
    return (
      <p className="text-center text text-zinc-500 py-12">
        No habits yet. Add one above to get started!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visibleHabits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          onDeleteHabit={onDeleteHabit}
          onToggleHabitDate={onToggleHabitDate}
          currentDate={currentDate}
        />
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-zinc-400">
            page {currentPage} of {totalPages}{" "}
          </span>

          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >Next</Button>
        </div>
      )}
    </div>
  );
};

function HabitItem({ habit, onDeleteHabit, onToggleHabitDate,currentDate }) {
  const calculateStreak=()=>{
  if(habit.completedDates.length===0) return 0

  const sortedDates=[...habit.completedDates].sort((a,b)=>new Date(b)-new Date(a))
  let streak=1
  let currentDate=new Date(sortedDates[0])
  for(let i=1;i<sortedDates.length;i++)
  {
    const previousDate=new Date(currentDate)
    previousDate.setDate(previousDate.getDate() -1)

    const previousDateString=format(previousDate,"yyyy-MM-dd")

    if (sortedDates[i]!==previousDateString){
      break
    }
    streak++
    currentDate=new Date(sortedDates[i])
  }
  return streak
  }
  const visibleDates = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  });
  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",

      background: "rgba(200, 200, 200, 0.55)",
      customClass: {
        popup: "small-alert",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteHabit(habit.id);
      }
    });
  };

  return (
    <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm p-4 flex flex-col gap-3 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <span className="font-medium text-white">{habit.name}</span>
          <span className="text-sm text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
            {" "}
            🔥 {calculateStreak()}
          </span>
        </div>
        <Button
          className="text-xs px-3 py-1.5"
          variant="danger"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {visibleDates.map((date) => {
          const dateString = format(date, "yyyy-MM-dd");
          const isCompleted = habit.completedDates.includes(dateString);
          return (
            <Button
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg text-xs transition-all ${
                isCompleted ? "bg-green-500 hover:bg-green-600 text-white" : ""
              }`}
              key={date.toISOString()}
              disabled={isBefore(startOfDay(date),startOfDay(new Date()))||isFuture(date)}
              onClick={() => onToggleHabitDate(habit.id, dateString)}
            >
              <span className="font-medium">{format(date, "EEE")}</span>
              <span>{format(date, "d")}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
