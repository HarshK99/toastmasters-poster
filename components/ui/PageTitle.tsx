import React from "react";

interface PageTitleProps {
  title: string;
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, className = "" }) => {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
    </div>
  );
};

export default PageTitle;