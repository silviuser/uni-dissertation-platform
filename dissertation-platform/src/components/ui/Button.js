import React from 'react';

const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const cls = `btn ${variant} ${className}`.trim();
  return <button className={cls} {...props}>{children}</button>;
};

export default Button;
