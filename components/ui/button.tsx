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
      className={`px-4 py-2 rounded text-sm font-medium transition ${disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow"} bg-blue-600 text-white ${className}`}
    >
      {children}
    </button>
  );
}
