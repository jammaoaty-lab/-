import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isGlow?: boolean;
}

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isGlow = false,
  className = '',
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'primary-button text-white',
    secondary: 'bg-white text-[#0F56E8]',
    outline: 'bg-white border border-[#36B0FF] text-[#0F56E8]',
    text: 'bg-transparent text-[#0F56E8]'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    xl: 'px-10 py-5 text-xl rounded-[28px]'
  };

  const glowClass = isGlow ? 'glow-effect' : '';

  return (
    <button
      className={`
        font-semibold transition-all duration-200 ease-out
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${glowClass}
        active:scale-[0.97]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
