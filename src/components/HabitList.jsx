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
  onEditHabit,
  onToggleHabitDate,
  currentDate,
}) => {
  const habitPerPages = 2;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(habits.length / habitPerPages);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * habitPerPages;

  const visibleHabits = habits.slice(startIndex, startIndex + habitPerPages);

  if (habits.length === 0) {
    return (
      <p className="text-center text-zinc-500 py-12">
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
          onEditHabit={onEditHabit}
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
            Page {currentPage} of {totalPages}
          </span>

          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

function HabitItem({
  habit,
  onDeleteHabit,
  onEditHabit,
  onToggleHabitDate,
  currentDate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const [showCelebration, setShowCelebration] = useState(false);

  // =========================
  // STREAK
  // =========================

  const calculateStreak = () => {
    if (habit.completedDates.length === 0) {
      return 0;
    }

    const sortedDates = [...habit.completedDates].sort(
      (a, b) => new Date(b) - new Date(a),
    );

    let streak = 1;

    let currentStreakDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const previousDate = new Date(currentStreakDate);

      previousDate.setDate(previousDate.getDate() - 1);

      const previousDateString = format(previousDate, "yyyy-MM-dd");

      if (sortedDates[i] !== previousDateString) {
        break;
      }

      streak++;

      currentStreakDate = new Date(sortedDates[i]);
    }

    return streak;
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = () => {
    if (editName.trim() === "") {
      return;
    }

    onEditHabit(habit.id, editName.trim());

    setIsEditing(false);
  };

  // =========================
  // CELEBRATION
  // =========================

  const celebrate = () => {
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 1800);
  };

  // =========================
  // WEEK DATES
  // =========================

  const visibleDates = eachDayOfInterval({
    start: startOfWeek(currentDate, {
      weekStartsOn: 1,
    }),
    end: endOfWeek(currentDate, {
      weekStartsOn: 1,
    }),
  });

  const todayString = format(new Date(), "yyyy-MM-dd");

  const isTodayCompleted = habit.completedDates.includes(todayString);

  // =========================
  // DELETE
  // =========================

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
      background: "rgba(250, 250, 250, 1)",
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
    <>
      {/* ==================================
          CELEBRATION OVERLAY
      ================================== */}

      {showCelebration && (
        <div className="celebration-overlay">
          {/* Center Message */}
          <div className="celebration-message">
            <div className="celebration-check">✓</div>

            <h2>Completed</h2>

            <p>Keep the streak going.</p>
          </div>

          {/* Confetti */}
          {Array.from({ length: 55 }).map((_, index) => (
            <span
              key={index}
              className="confetti-piece"
              style={{
                "--x": `${Math.random() * 100}%`,
                "--delay": `${Math.random() * 0.25}s`,
                "--rotation": `${Math.random() * 720}deg`,
                "--i": index,
              }}
            />
          ))}
        </div>
      )}

      {/* ==================================
          HABIT CARD
      ================================== */}

      <div className="relative rounded-xl bg-zinc-800/70 backdrop-blur-sm p-4 flex flex-col gap-3 border border-white/10">
        {/* HABIT HEADER */}

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3 items-center min-w-0">
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="min-w-0 flex-1 rounded-lg bg-zinc-700 px-3 py-1.5 text-white outline-none border border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500"
                autoFocus
              />
            ) : (
              <span className="font-medium text-white">{habit.name}</span>
            )}

            <span className="text-sm text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
              🔥 {calculateStreak()}
            </span>
          </div>

          {/* EDIT / DELETE */}

          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  disabled={editName.trim() === ""}
                  title="Save"
                  aria-label="Save habit"
                  className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-30"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setEditName(habit.name);
                    setIsEditing(false);
                  }}
                  title="Cancel"
                  aria-label="Cancel editing"
                  className="p-2 rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit habit"
                  aria-label="Edit habit"
                  className="p-2 rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                  </svg>
                </button>

                <button
                  onClick={handleDelete}
                  title="Delete habit"
                  aria-label="Delete habit"
                  className="p-2 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5M14 11v5" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* INSTRUCTION */}

        <p className="text-xs text-zinc-300">
          {isTodayCompleted
            ? "Great job! See you tomorrow "
            : "Done today? Tap the date "}
        </p>

        {/* WEEK DATES */}

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {visibleDates.map((date) => {
            const dateString = format(date, "yyyy-MM-dd");

            const isCompleted = habit.completedDates.includes(dateString);

            const isToday = dateString === todayString;

            return (
              <Button
                key={date.toISOString()}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg text-xs transition-all ${
                  isBefore(startOfDay(date), startOfDay(new Date())) ||
                  isFuture(date)
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  isCompleted
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : isToday
                      ? "bg-blue-400 hover:bg-blue-500 text-white"
                      : ""
                }`}
                disabled={
                  isBefore(startOfDay(date), startOfDay(new Date())) ||
                  isFuture(date)
                }
                onClick={() => {
                  onToggleHabitDate(habit.id, dateString);

                  // Celebration only when
                  // completing today's habit
                  if (isToday && !isCompleted) {
                    celebrate();
                  }
                }}
              >
                <span className="font-medium">{format(date, "EEE")}</span>

                <span>{format(date, "d")}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
