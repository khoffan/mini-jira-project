export function slugGenerator({ name, prefix }: { name: string; prefix?: string }): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    if (prefix) {
        return `${prefix}-${cleanName}-${randomSuffix}`
    }
    return `${cleanName}-${randomSuffix}`
}
