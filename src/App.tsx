import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid'

type Todo = {
  id: string
  value: string
  done: boolean
  start_time: number
  finish_time: number | undefined
}

function App() {
    const todoInputRef = useRef<HTMLInputElement>(null)
    const [todos, setTodos] = useState<Todo[]>([])
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
      const stored = localStorage.getItem('Todos')
      if (stored) {
        setTodos(JSON.parse(stored))
      }
      setIsInitialLoad(false)
    }, [])

    useEffect(() => {
      if (!isInitialLoad){
        localStorage.setItem('Todos', JSON.stringify(todos))
      }
    }, [todos, isInitialLoad])

    const handleAddTodo = () => {
      if (todoInputRef.current == null || todoInputRef.current.value == "") return
      const timestamp = +new Date()

      const newTodo = {
        id: uuidv4(),
        value: todoInputRef.current.value,
        done: false,
        start_time: timestamp,
        finish_time: undefined
      }

      setTodos((prev) => [newTodo, ...prev])
      todoInputRef.current.value = ""
    }

    const handleRemoveTodo = (id: string): void => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    }

    const handleDone = (id: string): void => {
      const timestamp = +new Date()

      setTodos((prev) => (
        prev.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done, finish_time: timestamp } : todo
        )
      ))
    }

    const daysToMilliseconds = (days: number):number => {
      return days * 24 * 60 * 60 * 1000
    }

    return (
        <div className="h-[100dvh] flex flex-col">
            <div className="mx-auto sm:m-auto container max-h-[100dvh] border p-4 max-w-xl rounded-md shadow-md">
                <div className="flex flex-col h-full">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border bg-inherit px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            ref={todoInputRef}
                            placeholder="Add a todo"
                        />
                        <button
                            type="submit"
                            aria-label="Add todo"
                            onClick={handleAddTodo}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-none bg-inherit hover:opacity-70 h-10 w-10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-col h-full overflow-auto">
                      {
                        todos.map((todo) => (
                          <div key={todo.id} className={`flex gap-2 w-full mt-4 rounded ${todo.done? "bg-green-400" :
                              (+new Date() - todo.start_time > daysToMilliseconds(3))? "bg-red-400":
                              (+new Date() - todo.start_time > daysToMilliseconds(2))? "bg-yellow-400": "" }`}>
                            <div className={`todo flex-1 px-3 py-2 overflow-auto cursor-pointer ${todo.done? "line-through": ""}`} onClick={() => handleDone(todo.id)}>
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
                        ))
                      }
                    </div>

                </div>
            </div>
        </div>
    );
}

export default App;
