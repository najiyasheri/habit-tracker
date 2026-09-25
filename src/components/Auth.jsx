import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Eye, EyeOff } from "lucide-react";
export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validateForm() {
    const cleanEmail = email.trim();

    // Check email
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      return "Please enter your email address.";
    }

    if (!emailPattern.test(cleanEmail)) {
      return "Please enter a valid email address.";
    }

    // Check password
    if (!password) {
      return "Please enter your password.";
    }

    if (!isLogin) {
      if (password.length < 8) {
        return "Password must be at least 8 characters long.";
      }

      if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
      }

      if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
      }

      if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
      }

      if (!confirmPassword) {
        return "Please confirm your password.";
      }

      if (password !== confirmPassword) {
        return "Passwords do not match.";
      }
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        setMessage("Login successful!");
        setMessageType("success");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        if (data.session) {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) throw signOutError;
        }

        setIsLogin(true);
        setMessage("Account created! Please log in.");
        setMessageType("success");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      const errorMessage = error.message?.toLowerCase() || "";

      if (
        errorMessage.includes("invalid login credentials") ||
        errorMessage.includes("invalid credentials")
      ) {
        setMessage("Incorrect email or password. Please try again.");
      } else if (
        errorMessage.includes("user already registered") ||
        errorMessage.includes("already been registered")
      ) {
        setMessage("An account with this email already exists. Please log in.");
      } else if (errorMessage.includes("email not confirmed")) {
        setMessage("Please confirm your email before logging in.");
      } else if (errorMessage.includes("password")) {
        setMessage(error.message);
      } else {
        setMessage(error.message || "Something went wrong. Please try again.");
      }

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin((current) => !current);
    setMessage("");
    setMessageType("");
    setPassword("");
    setConfirmPassword("");
  }

  const inputClass =
    "mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 caret-gray-900 outline-none focus:border-[#c7a365] focus:ring-2 focus:ring-[#c7a365]/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[url('/backgroundHabitTracker.jpg')] bg-cover bg-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-sm"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          {isLogin
            ? "Log in to see your personal habits."
            : "Sign up to start tracking your habits."}
        </p>

        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />

        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative mb-4">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? "Enter your password" : "Create a password"}
            className={`${inputClass} mb-0 pr-16`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {!isLogin && (
          <>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <div className="relative mb-4">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`${inputClass} mb-0 pr-16`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="-mt-2 mb-4 text-xs text-gray-500">
              Use at least 8 characters, including uppercase, lowercase, and a
              number.
            </p>
          </>
        )}

        {message && (
          <p
            role="alert"
            className={`mb-4 rounded-lg p-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-400 hover:bg-blue-500 px-4 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-semibold text-blue-400 underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    </main>
  );
}
