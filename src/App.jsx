import { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
function App() {
  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem("habits");
    if (!savedHabits) return [];

    return JSON.parse(savedHabits).map((habit) => ({
      ...habit,
      completedDates: habit.completedDates || [],
    }));
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);
  const addHabit = (name) => {
    const newHabit = {
      id: Date.now(),
      name: name,
      completedDates: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  };
  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((habits) => habits.id !== id));
  };
  const toggleHabitDate = (habitId, date) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;

        const completedDates = habit.completedDates.includes(date)
          ? habit.completedDates.filter((d) => d !== date)
          : [...habit.completedDates, date];

        return {
          ...habit,
          completedDates,
        };
      }),
    );
  };
  const goToPreviousWeek = () => {
    setCurrentDate((prev) => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 7);
      return date;
    });
  };
  const goToNextWeek = () => {
    setCurrentDate((next) => {
      const date = new Date(next);
      date.setDate(date.getDate() + 7);
      return date;
    });
  };
  return (
    <div className="min-h-screen bg-[url('/backgroundHabitTracker.jpg')] bg-cover bg-center bg-fixed">
      <div className="max-w-2xl mx-auto p-4 flex flex-col gap-5">
        {" "}
        <Header
          onPreviousWeek={goToPreviousWeek}
          goToNextWeek={goToNextWeek}
          currentDate={currentDate}
          habits={habits}
        />{" "}
        <HabitForm onAddHabit={addHabit} />{" "}
        <Dashboard habits={habits} currentDate={currentDate} />
        <HabitList
          habits={habits}
          onDeleteHabit={deleteHabit}
          onToggleHabitDate={toggleHabitDate}
          currentDate={currentDate}
        />{" "}
      </div>
    </div>
  );
}
export default App;
