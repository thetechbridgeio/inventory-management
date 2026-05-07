type WithDate = {
  dateOfIssue: string | Date
}

export const sortByDateDesc = <T extends WithDate>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.dateOfIssue).getTime()
    const dateB = new Date(b.dateOfIssue).getTime()
    return dateB - dateA
  })
}