import React from "react";

const Card = ({
  children,
  className = "",
  padding = true,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md
        ${padding ? "p-6" : ""}
        ${hover ? "transition-transform hover:scale-[1.02]" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;