import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid'

type Todo = {
  id: string
  value: string
  done: boolean
}

function App() {
    const [todo, setTodo] = useState<Todo["value"]>("")
    const [todos, setTodos] = useState<Todo[]>([])
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
      const stored = localStorage.getItem('Todos');
      if (stored) {
        setTodos(JSON.parse(stored));
      }
      setIsInitialLoad(false)
    }, [])

    useEffect(() => {
      if (!isInitialLoad){
        localStorage.setItem('Todos', JSON.stringify(todos))
      }
    }, [todos, isInitialLoad])

    const handleAddTodo = () => {
      setTodos((prev) => [...prev, {id: uuidv4(), value: todo, done: false}])
      setTodo("")
    }

    const handleRemoveTodo = (id: string): void => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    }

    const handleDone = (id: string): void => {
      setTodos((prev) => (
        prev.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      ))
    }

    return (
        <div className="h-[100dvh] flex flex-col">
            <div className="mx-auto sm:m-auto container border p-4 max-w-xl rounded-md shadow-md">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md border bg-inherit px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={todo}
                            onChange={e => setTodo(e.target.value)}
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
                    {
                      todos.map((todo) => (
                        <div key={todo.id} className={`grid grid-cols-12 gap-2 w-full ${todo.done? "bg-green-400 rounded" :"" }`}>
                          <div className={`todo col-span-11 px-3 py-2 overflow-auto cursor-pointer ${todo.done? "line-through": ""}`} onClick={() => handleDone(todo.id)}>
                            {todo.value}
                          </div>
                          <div className="remove col-span-1 m-auto">
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
    );
}

export default App;
