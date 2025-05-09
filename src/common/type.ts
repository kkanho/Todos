export type TodoItem = {
    id: string
    value: string
    done: boolean
    created_time: number
    finish_time?: number
    archive?: boolean
    routine?: "daily" | "weekly" | "monthly"
}