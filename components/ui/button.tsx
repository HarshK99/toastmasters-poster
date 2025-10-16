import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

export default function Button({ children, onClick, type = "button", disabled, className = "" }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 ${disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:bg-blue-700"} bg-blue-700 text-white ${className}`}
    >
      {children}
    </button>
  );
}
