interface RateLimitOptions {
    interval: number // en ms
    uniqueTokenPerInterval: number // Max utilisateurs suivis
}

export function rateLimit(options: RateLimitOptions) {
    const tokenCache = new Map()
    let lastCleanup = Date.now()

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now()

                // Nettoyage périodique (toutes les 'interval' ms)
                if (now - lastCleanup > options.interval) {
                    tokenCache.clear()
                    lastCleanup = now
                }

                const tokenCount = tokenCache.get(token) || [0]
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount)
                }
                tokenCount[0] += 1

                const currentUsage = tokenCount[0]
                const isRateLimited = currentUsage >= limit

                if (isRateLimited) {
                    reject(new Error('Rate limit exceeded'))
                } else {
                    resolve()
                }
            }),
    }
}
