import React from 'react'
import { TodoItem } from '../common/type'
import { formatDistanceToNow } from "date-fns";

interface TodoProps extends Omit<React.HTMLProps<HTMLDivElement>, "todo"> {
    todo: TodoItem
    handleRemoveTodo: (id: string) => void
    handleDone: (id: string) => void
    daysToMilliseconds: (days: number) => number
}

const Todo = ({todo, handleRemoveTodo, handleDone, daysToMilliseconds, ...props}: TodoProps) => {
    
    return (
        <div key={todo.id} className={`flex gap-2 w-full mt-4 rounded ${todo.done? "bg-green-400" :
            (+new Date() - todo.created_time > daysToMilliseconds(3))? "bg-red-400":
            (+new Date() - todo.created_time > daysToMilliseconds(2))? "bg-yellow-400": "" }`}
            {...props}
        >
            <div 
                className={`todo flex-1 px-3 py-2 overflow-auto cursor-pointer ${todo.done? "line-through": ""}`} 
                onClick={() => handleDone(todo.id)}
                title={todo.finish_time ? 
                    `Finished at ${new Date(todo.finish_time).toLocaleString()}`
                    : `Created at ${formatDistanceToNow(todo.created_time)}`
                }
            >
                {todo.value}
            </div>
            <div className="remove m-auto">
                <button
                    type="button"
                    aria-label="Remove todo"
                    onClick={() => handleRemoveTodo(todo.id)}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-none bg-inherit hover:opacity-70 h-10 w-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus rotate-45 hover:rotate-[315deg] hover:text-red-600 duration-1000"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
            </div>
        </div>
    )
}

export default Todo