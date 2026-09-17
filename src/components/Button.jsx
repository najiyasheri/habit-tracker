
export const Button = ({
  children,
  disabled = false,
  variant = "default",
  className = "",
  onClick
}) => {
  const buttonStyle =
  
    variant === "danger"
      ? "bg-red-500 hover:bg-red-700 text-white"
      : "bg-blue-400 hover:bg-blue-500";
  return (
    <div>
      <button
      onClick={onClick}
        disabled={disabled}
        className={`${buttonStyle} ${className} transition-colors rounded-lg px-4 py-2 outline-none disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {children}
      </button>
    </div>
  );
};