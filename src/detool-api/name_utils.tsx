
// converts camelCase and snake_case to "Human readable"
export function humanize_label(str: string): string {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^./, (str) => str.toUpperCase());
}

