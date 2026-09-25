import { useEffect, useState } from "react";
import { Button } from "./components/Button";
import { HabitForm } from "./components/HabitForm";
import { HabitList } from "./components/HabitList";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Routes, Route } from "react-router-dom";
import { Insights } from "./pages/Insights";
import { Auth } from "./components/Auth";
import Swal from "sweetalert2";
import { supabase } from "./supabaseClient";
import { LogOut } from "lucide-react";
function App() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const user = session?.user;

  // Check the current login and listen for login/logout changes
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        console.error("Error checking session:", error);
      }

      setSession(data.session);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load only this signed-in user's habits
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    const getHabits = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!mounted) return;

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

    return () => {
      mounted = false;
    };
  }, [user?.id, authLoading]);

  const addHabit = async (name) => {
    if (!user) return;

    const normalize = (text) => text.toLowerCase().replace(/\s+/g, "");
    const habitName = name.trim();

    if (!/[a-zA-Z0-9]/.test(habitName)) {
      Swal.fire({
        title: "Invalid Habit!",
        text: "Please enter a valid habit name",
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1)",
        customClass: { popup: "small-alert" },
      });
      return;
    }

    const habitExists = habits.some(
      (habit) => normalize(habit.name) === normalize(habitName),
    );

    if (habitExists) {
      Swal.fire({
        title: "Already Added!",
        text: "This habit is already on your list",
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1)",
        customClass: { popup: "small-alert" },
      });
      return;
    }

    const { data, error } = await supabase
      .from("habits")
      .insert({
        name: habitName,
        completed_dates: [],
        user_id: user.id,
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
    if (!user) return;

    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting habit:", error);
      return;
    }

    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const editHabit = async (id, newName) => {
    if (!user) return;

    const normalize = (text) => text.toLowerCase().replace(/\s+/g, "");
    const habitName = newName.trim();

    if (!/[a-zA-Z0-9]/.test(habitName)) {
      Swal.fire({
        title: "Invalid Habit!",
        text: "Please enter a habit name.",
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1)",
        customClass: { popup: "small-alert" },
      });
      return;
    }

    const habitExists = habits.some(
      (habit) =>
        habit.id !== id && normalize(habit.name) === normalize(habitName),
    );

    if (habitExists) {
      Swal.fire({
        title: "Already Added!",
        text: "This habit is already on your list",
        confirmButtonText: "Okay 💕",
        confirmButtonColor: "#3b82f6",
        background: "rgba(250, 250, 250, 1)",
        customClass: { popup: "small-alert" },
      });
      return;
    }

    const { error } = await supabase
      .from("habits")
      .update({ name: habitName })
      .eq("id", id)
      .eq("user_id", user.id);

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
    if (!user) return;

    const habit = habits.find((habit) => habit.id === habitId);
    if (!habit) return;

    const completedDates = habit.completedDates.includes(date)
      ? habit.completedDates.filter((d) => d !== date)
      : [...habit.completedDates, date];

    const { error } = await supabase
      .from("habits")
      .update({ completed_dates: completedDates })
      .eq("id", habitId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating habit:", error);
      return;
    }

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, completedDates } : habit,
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
    setCurrentDate((prev) => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 7);
      return date;
    });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking your account...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

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
              <div className="flex justify-end">
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2  text-sm font-medium text-red-50 shadow-sm transition-all duration-200  hover:text-red-600 hover:shadow-md active:scale-95"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>

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
