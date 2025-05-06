import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid'
import { Drawer } from 'vaul';

type Todo = {
  id: string
  value: string
  done: boolean
  created_time: number
  finish_time?: number
  archive?: boolean
  routine?: "daily" | "weekly" | "monthly"
}

type Tabs = "todos" | "routine" | "archive"

function App() {
    const todoInputRef = useRef<HTMLInputElement>(null)
    const [todos, setTodos] = useState<Todo[]>([])
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [tab, setTab] = useState<Tabs>("todos")
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
      const stored = localStorage.getItem('Todos')
      if (stored) {
        setTodos(JSON.parse(stored))
      }      

      setIsInitialLoad(false)
    }, [])

    // Save to localStorage when todos change
    useEffect(() => {
      if (!isInitialLoad){
        localStorage.setItem('Todos', JSON.stringify(todos))
      }
    }, [todos, isInitialLoad])


    // Handle Archive
    // Update the todos for every 1mins. 
    useEffect(() => {
      const interval = setInterval(() => {
        const anHourAgo = +new Date() - 1000 * 60 * 60 // 1 hour
        const oneDayAgo = +new Date() - 1000 * 60 * 60 * 24 // 1 day
        const weekAgo = +new Date() - 1000 * 60 * 60 * 24 * 7 // 1 week
        const monthAgo = +new Date() - 1000 * 60 * 60 * 24 * 30 // 1 month

        // If not routine and done and finished in an hour ago or
        // If not routine and not done and is 7 days from the created time, put to archive
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            (!todo.routine && todo.done && todo.finish_time && todo.finish_time < anHourAgo) ||
            (!todo.routine && !todo.done && todo.created_time < weekAgo) ? 
              { ...todo, archive: true } // archive
            : todo
          )
        )
        
        // For routine, if the created_time is more than 1 day for daily, 7 days for weekly, and 30 days for monthly, update the created_time to now
        setTodos((prevTodos) => // update created_time accordingly
          prevTodos.map((todo) => {
            if (todo.routine === "daily" && todo.created_time < oneDayAgo) {
              return { ...todo, created_time: +new Date(), done: false }
            } else if (todo.routine === "weekly" && todo.created_time < weekAgo) {
              return { ...todo, created_time: +new Date(), done: false }
            } else if (todo.routine === "monthly" && todo.created_time < monthAgo) {
              return { ...todo, created_time: +new Date(), done: false }
            } else {
              return todo
            }
          })
        )

      }, 1000 * 60) // 1 mins

      return () => clearInterval(interval)
    }, [])
    

    const handleAddTodo = (): void => {
      if (todoInputRef.current == null || todoInputRef.current.value == "") return
      const timestamp = +new Date()

      const newTodo = {
        id: uuidv4(),
        value: todoInputRef.current.value,
        done: false,
        created_time: timestamp,
        finish_time: undefined,
        archive: false,
      }

      setTodos((prev) => [newTodo, ...prev])
      todoInputRef.current.value = ""
    }

    const handleAddRoutine = (routine: "daily" | "weekly" | "monthly"): void => {
      setIsOpen(false) // Close the drawer
      if (todoInputRef.current == null || todoInputRef.current.value == "") return
      const timestamp = +new Date()

      const newTodo = {
        id: uuidv4(),
        value: todoInputRef.current.value,
        done: false,
        created_time: timestamp,
        finish_time: undefined,
        archive: false,
        routine: routine,
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
          todo.id === id ? 
            { ...todo, done: !todo.done, finish_time: todo.done? undefined: timestamp } 
          : todo
        )
      ))
    }

    const daysToMilliseconds = (days: number): number => {
      return days * 24 * 60 * 60 * 1000
    }

    const Separator = (tab: string): JSX.Element => {
      return (
        <div className="separator text-gray-400 flex gap-1 align-middle translate-y-2">
          <div className="h-[1px] w-full bg-gray-400 left-1/2 self-center"></div>
            {tab}
          <div className="h-[1px] w-full bg-gray-400 left-1/2 self-center"></div>
        </div>
      )
    }

    const Todos = (todo: Todo): JSX.Element => {
      return (
        <div key={todo.id} className={`flex gap-2 w-full mt-4 rounded ${todo.done? "bg-green-400" :
          (+new Date() - todo.created_time > daysToMilliseconds(3))? "bg-red-400":
          (+new Date() - todo.created_time > daysToMilliseconds(2))? "bg-yellow-400": "" }`}>
          <div 
            className={`todo flex-1 px-3 py-2 overflow-auto cursor-pointer ${todo.done? "line-through": ""}`} 
            onClick={() => handleDone(todo.id)}
            title={
              todo.finish_time ? 
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

    return (
        <div className="h-[100dvh] flex flex-col">
            <div className="mx-auto sm:m-auto container max-h-[100dvh] border p-4 max-w-xl rounded-md shadow-md">
                <div className="flex flex-col h-full">
                    <div className="flex gap-2 mt-4">
                        {
                          <input
                            type="text"
                            className={`flex h-10 w-full rounded-md border bg-inherit px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${tab === "archive"? "hidden" : ""}`}
                            ref={todoInputRef}
                            placeholder={
                              tab === "todos"? "Add a todo" 
                              : tab === "routine"? "Add a routine"
                              : ""
                            }
                          />
                        }
                        {
                          tab === "todos"? 
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
                          : tab === "routine"?
                            <Drawer.Root open={isOpen} onOpenChange={setIsOpen} dismissible>
                              <Drawer.Trigger onClick={() => setIsOpen(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                                  <path d="m22 2-7 20-4-9-9-4Z" />
                                  <path d="M22 2 11 13" />
                                </svg>
                              </Drawer.Trigger>
                              <Drawer.Portal>
                                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                                <Drawer.Content className="bg-gray-100 h-fit fixed bottom-0 left-0 right-0 outline-none">
                                  <Drawer.Title />
                                  <div className="flex flex-col gap-4 p-4 bg-white">
                                    <Drawer.Handle />
                                    <button
                                      type="button"
                                      onClick={() => handleAddRoutine("daily")}
                                      className="flex-1 h-10 text-sm font-medium ring-offset-background transition-colors last:border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                                        disabled:pointer-events-none disabled:opacity-50 px-3 py-2 overflow-auto cursor-pointer hover:bg-green-400"
                                    >
                                      Daily
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddRoutine("weekly")}
                                      className="flex-1 h-10 text-sm font-medium ring-offset-background transition-colors last:border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                                        disabled:pointer-events-none disabled:opacity-50 px-3 py-2 overflow-auto cursor-pointer hover:bg-green-400"
                                    >
                                      Weekly
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddRoutine("monthly")}
                                      className="flex-1 h-10 text-sm font-medium ring-offset-background transition-colors last:border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                                        disabled:pointer-events-none disabled:opacity-50 px-3 py-2 overflow-auto cursor-pointer hover:bg-green-400"
                                    >
                                      Monthly
                                    </button>
                                  </div>
                                </Drawer.Content>
                              </Drawer.Portal>
                            </Drawer.Root>
                          : <></>
                        }
                    </div>
                    <div className="flex flex-col h-full overflow-auto">
                      {
                        tab === "todos" ?
                          todos.filter((todo) => !todo.archive).map((todo) => (
                            Todos(todo)
                          )) 
                        : tab === "routine"?
                          (() => {
                            const dailyTodos:Todo[] = []
                            const weeklyTodos:Todo[] = []
                            const monthlyTodos:Todo[] = []

                            todos.forEach((todo) => {
                              if (todo.routine === "daily") dailyTodos.push(todo)
                              else if (todo.routine === "weekly") weeklyTodos.push(todo)
                              else if (todo.routine === "monthly") monthlyTodos.push(todo)
                            })

                            return (
                              <>
                                {
                                  dailyTodos.length != 0? 
                                    <div>
                                      {Separator("daily")}
                                      {dailyTodos.map((todo) => Todos(todo))}
                                    </div>: <></>
                                }
                                {
                                  weeklyTodos.length != 0? 
                                    <div>
                                      {Separator("weekly")}
                                      {weeklyTodos.map((todo) => Todos(todo))}
                                    </div>: <></>
                                }
                                {
                                  monthlyTodos.length != 0? 
                                    <div>
                                      {Separator("monthly")}
                                      {monthlyTodos.map((todo) => Todos(todo))}
                                    </div>: <></>
                                }
                              </>
                            )
                          })()
                        : tab === "archive"?
                          todos.filter((todo) => todo.archive).length != 0?
                            todos.filter((todo) => todo.archive).map((todo) => (
                              Todos(todo)
                            ))
                          : <div className="flex justify-center items-center h-full text-lg text-gray-400">No todos</div>
                        : <></>
                      }
                    </div>
                    <div className="flex mt-4 border rounded-lg">
                      {
                        ["todos", "routine", "archive"].map((tabName) => (
                          <button
                            key={tabName}
                            type="button"
                            onClick={() => setTab(tabName as Tabs)}
                            className={`flex-1 h-10 text-sm font-medium ring-offset-background transition-colors border-solid border-r-2 last:border-none
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                              disabled:pointer-events-none disabled:opacity-50 
                              hover:opacity-70
                              ${tab === tabName ? "bg-green-400" : ""}`}
                          >
                            {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                          </button>
                        ))
                      }
                    </div>

                </div>
            </div>
        </div>
    );
}

export default App;
