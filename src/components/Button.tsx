import { ButtonHTMLAttributes } from 'react'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
    "text-sm font-medium ring-offset-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-none",
                outline: "border rounded-md"
            },
            size: {
                default: "h-10 px-4 py-2",
                icon: "h-10 w-10 px-2 py-2"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    }
)

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = ({className, size, variant, ...props}: ButtonProps) => {
    return (
        <button {...props} className={cn(buttonVariants({ className, size, variant}))} />
    )
}

export { Button, buttonVariants }