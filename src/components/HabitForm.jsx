import { useState } from "react";
import { Button } from "./Button";

export const HabitForm = ({onAddHabit}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() === "") return;
    onAddHabit(name.trim())
    setName('')
    
  };
  return (
    <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-lg bg-zinc-800/70 backdrop-blur-sm px-4 py-2 outline-none border border-white/10 focus-visible:ring-2 focus-visible:ring-yellow-200"
        placeholder="New habit.."
      />
      <Button disabled={name.trim() === ""}>Add Habit</Button>
    </form>
  );
};
