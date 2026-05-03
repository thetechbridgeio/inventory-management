import { SalesItem } from "../types/sale-entry-form.types"

export const sortByDateDesc = (items: SalesItem[]) => {
    return [...items].sort((a, b) => {
        const dateA = new Date(a.dateOfIssue).getTime()
        const dateB = new Date(b.dateOfIssue).getTime()
        return dateB - dateA // Descending order (newest first)
    })
}