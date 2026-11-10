export function rewordEnabled(): boolean
export function reword(question: unknown, text: unknown): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }>
