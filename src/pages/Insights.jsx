import { Link } from "react-router-dom";
import { format, subDays } from "date-fns";

export const Insights = ({ habits = [] }) => {
  const calculateStreak = (habit) => {
    if (habit.completedDates.length === 0) return 0;

    const sortedDates = [...habit.completedDates].sort(
      (a, b) => new Date(b) - new Date(a),
    );

    let streak = 1;
    let currentDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const previousDate = new Date(currentDate);

      previousDate.setDate(previousDate.getDate() - 1);

      const previousDateString = format(previousDate, "yyyy-MM-dd");

      if (sortedDates[i] !== previousDateString) {
        break;
      }

      streak++;
      currentDate = new Date(sortedDates[i]);
    }

    return streak;
  };

  const bestStreak = Math.max(
    0,
    ...habits.map((habit) => calculateStreak(habit)),
  );

  const today = new Date();

  const last30Days = Array.from({ length: 30 }, (_, index) => {
    const date = subDays(today, 29 - index);
    const dateString = format(date, "yyyy-MM-dd");

    const completions = habits.reduce(
      (total, habit) =>
        total + (habit.completedDates.includes(dateString) ? 1 : 0),
      0,
    );

    return {
      date,
      dateString,
      completions,
    };
  });

  const last30DaysCompletions = habits.reduce((total, habit) => {
    return (
      total +
      habit.completedDates.filter((date) => {
        const completedDate = new Date(date);

        const daysAgo = (today - completedDate) / (1000 * 60 * 60 * 24);

        return daysAgo >= 0 && daysAgo < 30;
      }).length
    );
  }, 0);

  const totalPossible = habits.length * 30;

  const consistency =
    totalPossible > 0
      ? Math.round((last30DaysCompletions / totalPossible) * 100)
      : 0;

  const hasStarted = habits.some((habit) => habit.completedDates.length > 0);

  const reached7Days = bestStreak >= 7;
  const reached14Days = bestStreak >= 14;
  const reached30Days = bestStreak >= 30;

  const habitProgress = habits.map((habit) => {
    const completions = last30Days.filter((day) =>
      habit.completedDates.includes(day.dateString),
    ).length;

    const percentage = Math.round((completions / 30) * 100);

    return {
      ...habit,
      completions,
      percentage,
    };
  });

  const totalCompletions = habits.reduce(
    (total, habit) => total + habit.completedDates.length,
    0,
  );

  return (
    <div className="min-h-screen bg-[url('/backgroundHabitTracker.jpg')] bg-cover bg-center bg-fixed">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header */}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
              Your Insights
            </h1>

            <p className="text-zinc-300 mt-1">Your habit journey at a glance</p>
          </div>

          <Link
            to="/"
            className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Tracker
          </Link>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Habits */}

          <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-sm text-zinc-400">Total Habits</p>

            <p className="text-4xl font-bold text-white mt-2">
              {habits.length}
            </p>

            <p className="text-xs text-zinc-400 mt-1">habits you're building</p>
          </div>

          {/* Total Completions */}

          <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-sm text-zinc-400">Total Completions</p>

            <p className="text-4xl font-bold text-white mt-2">
              {totalCompletions}
            </p>

            <p className="text-xs text-zinc-400 mt-1">little wins so far</p>
          </div>

          {/* Best Streak */}

          <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-sm text-zinc-400">Best Streak</p>

            <p className="text-4xl font-bold text-white mt-2">{bestStreak}</p>

            <p className="text-xs text-zinc-400 mt-1">days in a row</p>
          </div>

          {/* Consistency */}

          <div className="rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-sm text-zinc-400">Consistency</p>

            <p className="text-4xl font-bold text-white mt-2">{consistency}%</p>

            <p className="text-xs text-zinc-400 mt-1">of your last 30 days</p>
          </div>
        </div>

        {/* Activity + Habit Progress */}

        {/* Activity + Habit Progress */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3 items-start">
          {/* 30-Day Activity */}

          <div className="h-[300px] rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-5">
            <h2 className="text-xl font-bold text-white">30-Day Activity</h2>

            <p className="text-sm text-zinc-400 mt-1">
              Your completion activity over the last 30 days.
            </p>

            <div className="mt-6 grid grid-cols-10 gap-3">
              {last30Days.map((day) => (
                <div key={day.dateString} className="relative group">
                  <div
                    className={`h-10 rounded-md transition-all duration-200 ${
                      day.completions === 0
                        ? "bg-zinc-700/60"
                        : day.completions === 1
                          ? "bg-green-400/60"
                          : day.completions === 2
                            ? "bg-green-500/70"
                            : "bg-green-600"
                    }`}
                  />

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg z-50 pointer-events-none">
                    {format(day.date, "MMM d")} — {day.completions} completed
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habit Progress */}

          <div className="h-[300px] rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-5">
            <h2 className="text-xl font-bold text-white">Habit Progress</h2>

            <p className="text-sm text-zinc-400 mt-1">
              Your completion rate over the last 30 days.
            </p>

            {/* Scroll only the habits */}

            <div className="mt-5 max-h-[200px] overflow-y-auto pr-3 space-y-5 scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent">
              {habitProgress.map((habit) => (
                <div key={habit.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-200">{habit.name}</span>

                    <span className="text-sm font-medium text-zinc-400">
                      {habit.percentage}%
                    </span>
                  </div>

                  <div className="h-2.5 rounded-full bg-zinc-700/70 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${habit.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Habit Journey */}

        <div className="flex justify-center mt-3">
          <div className="w-full lg:w-3/3 rounded-xl bg-zinc-800/70 backdrop-blur-sm border border-white/10 p-5">
            <h2 className="text-xl font-bold text-white">Habit Journey</h2>

            <p className="text-sm text-zinc-400 mt-1">
              Your milestones and progress will appear here.
            </p>

            <div className="flex items-center justify-between mt-6 text-sm">
              <span className={hasStarted ? "text-green-400" : "text-zinc-500"}>
                🥚 Started
              </span>

              <span
                className={reached7Days ? "text-orange-400" : "text-zinc-500"}
              >
                🐣 7 Days
              </span>

              <span
                className={reached14Days ? "text-yellow-400" : "text-zinc-500"}
              >
                🐥 14 Days
              </span>

              <span
                className={reached30Days ? "text-blue-400" : "text-zinc-500"}
              >
                🐔 30 Days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
