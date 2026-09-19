import { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Routes, Route } from "react-router-dom";
import { Insights } from "./pages/Insights";
import Swal from "sweetalert2";
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
  setHabits((prev) => {
    const normalize = (text) => text.toLowerCase().replace(/\s+/g, "");

    const habitName = name.trim();

    // Prevent emoji/symbol-only habit names
    if (!/[a-zA-Z0-9]/.test(habitName)) {
      Swal.fire({
        title: "Invalid Habit!",
        text: "Please enter a valid habit name",
        icon: undefined,
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1)",
        customClass: {
          popup: "small-alert",
        },
      });

      return prev;
    }

    const habitExists = prev.some(
      (habit) => normalize(habit.name) === normalize(habitName),
    );

    if (habitExists) {
      Swal.fire({
        title: "Already Added!",
        text: "This habit is already on your list",
        icon: undefined,
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1)",
        customClass: {
          popup: "small-alert",
        },
      });

      return prev;
    }

    const newHabit = {
      id: Date.now(),
      name: habitName,
      completedDates: [],
    };

    return [...prev, newHabit];
  });
};
  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((habits) => habits.id !== id));
  };
const editHabit = (id, newName) => {
  setHabits((prev) => {
    const normalize = (text) => text.toLowerCase().replace(/\s+/g, "");
     const habitName = name.trim();

     // Prevent emoji/symbol-only habits
     if (!/[a-zA-Z0-9]/.test(habitName)) {
       Swal.fire({
         title: "Invalid Habit!",
         text: "Please enter a habit name.",
         icon: undefined,
         confirmButtonText: "Okay 💕",
         confirmButtonColor: "#3b82f6",
         background: "rgba(59, 130, 246, 0.45)",
         customClass: {
           popup: "small-alert",
         },
       });

       return prev;
     }


    const habitExists = prev.some(
      (habit) =>
        habit.id !== id && normalize(habit.name) === normalize(newName),
    );

    if (habitExists) {
      Swal.fire({
        title: "Already Added!",
        text: "This habit is already on your list",
        icon: undefined,
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1.55)",
        customClass: {
          popup: "small-alert",
        },
      });

      return prev;
    }

    return prev.map((habit) =>
      habit.id === id ? { ...habit, name: newName.trim() } : habit,
    );
  });
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
    <Routes>
      <Route
        path="/"
        element={
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
                onEditHabit={editHabit}
                onToggleHabitDate={toggleHabitDate}
                currentDate={currentDate}
              />{" "}
            </div>
          </div>
        }
      />

      <Route path="/insights" element={<Insights habits={habits} />} />
    </Routes>
  );
}
export default App;
