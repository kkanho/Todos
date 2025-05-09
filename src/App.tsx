import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid'
import { Drawer } from 'vaul';
import Separator from "./components/Separator";
import Todo from "./components/Todo";
import { TodoItem } from "./common/type";
import { Button, buttonVariants } from "./components/Button";

type Tabs = "todos" | "routine" | "archive"

function App() {
    const todoInputRef = useRef<HTMLInputElement>(null)
    const [todos, setTodos] = useState<TodoItem[]>([])
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [tab, setTab] = useState<Tabs>("todos")
    const [isOpen, setIsOpen] = useState(false)

    // Load todos from localStorage on initial load
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

    return (
        <div className="h-[100dvh] flex flex-col">
            <a 
              href="https://github.com/kkanho/Todos" 
              className={`${buttonVariants({ variant: "outline", size: "icon" })} absolute top-2 right-2 hover:bg-slate-100`}
              title="^_^"
              target="_blank"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github-icon lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <div className="container mx-auto sm:m-auto max-h-[100dvh] sm:max-w-xl border p-4 rounded-md shadow-md">
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
                          
                            <Button
                              type="submit"
                              aria-label="Add todo"
                              onClick={handleAddTodo}
                              size={"icon"}
                              className="inline-flex items-center justify-center whitespace-nowrap hover:opacity-70"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                                    <path d="m22 2-7 20-4-9-9-4Z" />
                                    <path d="M22 2 11 13" />
                                </svg>
                            </Button>
                          : tab === "routine"?
                            <Drawer.Root open={isOpen} onOpenChange={setIsOpen} dismissible>
                              <Drawer.Trigger onClick={() => setIsOpen(true)} className={`${buttonVariants({ variant: "default", size: "icon" })} inline-flex items-center justify-center whitespace-nowrap hover:opacity-70`}>
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
                                    <Button
                                      type="button"
                                      onClick={() => handleAddRoutine("daily")}
                                      className="flex-1 overflow-auto hover:bg-green-400"
                                    >
                                      Daily
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => handleAddRoutine("weekly")}
                                      className="flex-1 overflow-auto hover:bg-green-400"
                                    >
                                      Weekly
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => handleAddRoutine("monthly")}
                                      className="flex-1 overflow-auto hover:bg-green-400"
                                    >
                                      Monthly
                                    </Button>
                                  </div>
                                </Drawer.Content>
                              </Drawer.Portal>
                            </Drawer.Root>
                          : <></>
                        }
                    </div>
                    <div className="h-screen flex flex-col sm:h-full overflow-auto">
                      {
                        tab === "todos" ?
                          todos.filter((todo) => !todo.archive).map((todo) => (
                            <Todo todo={todo} 
                              handleRemoveTodo={handleRemoveTodo} 
                              handleDone={handleDone} 
                              daysToMilliseconds={daysToMilliseconds}
                            />
                          )) 
                        : tab === "routine"?
                          (() => {
                            const dailyTodos:TodoItem[] = []
                            const weeklyTodos:TodoItem[] = []
                            const monthlyTodos:TodoItem[] = []

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
                                      <Separator tab="daily" />
                                      {dailyTodos.map((todo) => (
                                        <Todo todo={todo} 
                                          handleRemoveTodo={handleRemoveTodo} 
                                          handleDone={handleDone} 
                                          daysToMilliseconds={daysToMilliseconds}
                                        />
                                      ))}
                                    </div>: <></>
                                }
                                {
                                  weeklyTodos.length != 0? 
                                    <div>
                                      <Separator tab="weekly" />
                                      {weeklyTodos.map((todo) => (
                                        <Todo todo={todo} 
                                          handleRemoveTodo={handleRemoveTodo} 
                                          handleDone={handleDone} 
                                          daysToMilliseconds={daysToMilliseconds}
                                        />
                                      ))}
                                    </div>: <></>
                                }
                                {
                                  monthlyTodos.length != 0? 
                                    <div>
                                      <Separator tab="monthly" />
                                      {monthlyTodos.map((todo) => (
                                        <Todo todo={todo} 
                                          handleRemoveTodo={handleRemoveTodo} 
                                          handleDone={handleDone} 
                                          daysToMilliseconds={daysToMilliseconds}
                                        />
                                      ))}
                                    </div>: <></>
                                }
                              </>
                            )
                          })()
                        : tab === "archive"?
                          todos.filter((todo) => todo.archive).length != 0?
                            todos.filter((todo) => todo.archive).map((todo) => (
                              <Todo todo={todo} 
                                handleRemoveTodo={handleRemoveTodo} 
                                handleDone={handleDone} 
                                daysToMilliseconds={daysToMilliseconds}
                              />
                            ))
                          : <div className="flex justify-center items-center h-full text-lg text-gray-400">No todos</div>
                        : <></>
                      }
                    </div>
                    <div className="flex mt-4 border rounded-lg">
                      {
                        ["todos", "routine", "archive"].map((tabName) => (
                          <Button
                            key={tabName}
                            type="button"
                            onClick={() => setTab(tabName as Tabs)}
                            className={`flex-1 border-solid border-r-2 last:border-none hover:opacity-80
                              ${tab === tabName ? "bg-green-400" : ""}`}
                          >
                            {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                          </Button>
                        ))
                      }
                    </div>

                </div>
            </div>
        </div>
    );
}

export default App;
