import { format, startOfWeek, endOfWeek } from "date-fns";
export const Dashboard = ({ habits, currentDate }) => {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekStartString = format(weekStart, "yyyy-MM-dd");
  const weekEndString = format(weekEnd, "yyyy-MM-dd");

  const weeklyCompletions = habits.reduce((total, habit) => {
    const count = habit.completedDates.filter(
      (date) => date >= weekStartString && date <= weekEndString,
    ).length;

    return total + count;
  }, 0);
  const completedToday = habits.filter((habit) =>
    habit.completedDates.includes(today),
  ).length;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-3">
        <p className="text-sm text-zinc-400">Total Habits</p>
        <p className="text-2xl font-bold text-white">{habits.length}</p>
      </div>
      <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-3">
        <p className="text-sm text-zinc-400">Completed Today</p>
        <p className="text-2xl font-bold text-white">
          {completedToday}/{habits.length}
        </p>
      </div>

      <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-3">
        <p className="text-sm text-zinc-400">This Week</p>
        <p className="text-2xl font-bold text-white">{weeklyCompletions}</p>
      </div>
    </div>
  );
};
