import { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Routes, Route } from "react-router-dom";
import { Insights } from "./pages/Insights";
import Swal from "sweetalert2";
import { supabase } from "./supabaseClient";

function App() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load habits from Supabase
  useEffect(() => {
    const getHabits = async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching habits:", error);
        setLoading(false);
        return;
      }

      const formattedHabits = data.map((habit) => ({
        id: habit.id,
        name: habit.name,
        completedDates: habit.completed_dates || [],
      }));

      setHabits(formattedHabits);
      setLoading(false);
    };

    getHabits();
  }, []);

  const addHabit = async (name) => {
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

      return;
    }

    // Check for duplicate
    const habitExists = habits.some(
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

      return;
    }

    const { data, error } = await supabase
      .from("habits")
      .insert({
        name: habitName,
        completed_dates: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding habit:", error);
      return;
    }

    const newHabit = {
      id: data.id,
      name: data.name,
      completedDates: data.completed_dates || [],
    };

    setHabits((prev) => [...prev, newHabit]);
  };

  const deleteHabit = async (id) => {
    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) {
      console.error("Error deleting habit:", error);
      return;
    }

    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const editHabit = async (id, newName) => {
    const normalize = (text) => text.toLowerCase().replace(/\s+/g, "");

    const habitName = newName.trim();

    // Prevent emoji/symbol-only habit names
    if (!/[a-zA-Z0-9]/.test(habitName)) {
      Swal.fire({
        title: "Invalid Habit!",
        text: "Please enter a habit name.",
        icon: undefined,
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1)",
        customClass: {
          popup: "small-alert",
        },
      });

      return;
    }

    // Prevent duplicate habits
    const habitExists = habits.some(
      (habit) =>
        habit.id !== id && normalize(habit.name) === normalize(habitName),
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

      return;
    }

    const { error } = await supabase
      .from("habits")
      .update({ name: habitName })
      .eq("id", id);

    if (error) {
      console.error("Error editing habit:", error);
      return;
    }

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, name: habitName } : habit,
      ),
    );
  };

  const toggleHabitDate = async (habitId, date) => {
    const habit = habits.find((habit) => habit.id === habitId);

    if (!habit) return;

    const completedDates = habit.completedDates.includes(date)
      ? habit.completedDates.filter((d) => d !== date)
      : [...habit.completedDates, date];

    const { error } = await supabase
      .from("habits")
      .update({
        completed_dates: completedDates,
      })
      .eq("id", habitId);

    if (error) {
      console.error("Error updating habit:", error);
      return;
    }

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completedDates,
            }
          : habit,
      ),
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
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading habits...</p>
    </div>
  );
}
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-[url('/backgroundHabitTracker.jpg')] bg-cover bg-center">
            <div className="max-w-2xl mx-auto p-4 flex flex-col gap-5">
              <Header
                onPreviousWeek={goToPreviousWeek}
                goToNextWeek={goToNextWeek}
                currentDate={currentDate}
                habits={habits}
              />

              <HabitForm onAddHabit={addHabit} />

              <Dashboard habits={habits} currentDate={currentDate} />

              <HabitList
                habits={habits}
                onDeleteHabit={deleteHabit}
                onEditHabit={editHabit}
                onToggleHabitDate={toggleHabitDate}
                currentDate={currentDate}
              />
            </div>
          </div>
        }
      />

      <Route path="/insights" element={<Insights habits={habits} />} />
    </Routes>
  );
}

export default App;
