import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link" | "royal";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {

        // Royal Logic: Slightly rounded (not pill, not square), generous spacing, uppercase
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-[0.1em] uppercase";

        const variants = {
            default: "bg-gold text-charcoal hover:bg-[#8f7244] hover:text-white shadow-sm", // Gold Primary
            royal: "bg-gold text-charcoal hover:bg-[#8f7244] hover:text-white shadow-soft", // Alias
            outline: "border border-gold/40 text-charcoal hover:bg-gold hover:text-white bg-transparent", // Elegant Outline
            ghost: "hover:bg-gold/10 text-charcoal hover:text-gold",
            link: "text-gold underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-11 px-6 py-2",
            sm: "h-9 rounded-sm px-4 text-xs",
            lg: "h-14 px-10 text-base", // Grand buttons for Hero
            icon: "h-10 w-10",
        };

        const combinedClassName = cn(
            baseStyles,
            variants[variant as keyof typeof variants] || variants.default,
            sizes[size as keyof typeof sizes] || sizes.default,
            className
        );

        return (
            <button
                className={combinedClassName}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
