import type React from "react";

export const Button = ({
  onClick,
  children,
  disabled = false,
  variant = 'primary'
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) => {
  const baseClasses = "w-full px-4 py-3 text-lg font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    secondary: "bg-slate-600 hover:bg-slate-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};