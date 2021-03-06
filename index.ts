type callbackType = (eventName: string) => void
let isProcessWatchingStarted = false
const callbackList: Array<callbackType> = []
type TOptions = {
    withExit: boolean
    eventName: 'exit' | 'SIGINT' | 'SIGUSR1' | 'SIGUSR2' | 'uncaughtException'
}
const exitHandler = async (
    { withExit = false, eventName }: TOptions,
    error
) => {
    if (!eventName) return
    error = error.toString() === '0' ? '0 (sucess)' : error
    console.log(
        `%c❗ Event '${eventName}' : `,
        'color: #ff6860',
        'with process exit:',
        withExit,
        error,
        `❗`
    )
    if (eventName === 'uncaughtException') {
        console.error(error)
        return
    }
    if (eventName === 'exit') {
        return
    }
    console.log('error:', error, eventName)
    await Promise.all(callbackList.map(callback => callback(eventName)))
    if (withExit) {
        // setTimeout(process.exit, 10000)
        process.exit()
    }
}

type TPtrops = {
    exit?: {
        withExit: boolean
    }
    SIGINT?: {
        withExit: boolean
    }
    SIGUSR1?: {
        withExit: boolean
    }
    SIGUSR2?: {
        withExit: boolean
    }
    uncaughtException?: {
        withExit: boolean
    }
}
export const startProcessDeathWatching = (props: TPtrops = {}) => {
    process.stdin.resume()
    const defaultEventsOptions = {
        // do something when app is closing
        exit: {
            withExit: true,
        },
        // catches ctrl+c event
        SIGINT: {
            withExit: true,
        },
        //  catches "kill pid" (for example: nodemon restart)
        SIGUSR1: {
            withExit: true,
        },
        SIGUSR2: {
            withExit: true,
        },
        // catches uncaught exceptions
        // отлавливает exceptions и не дает завершиться процессу
        uncaughtException: {
            withExit: true,
        },
    }
    const eventsOptions = Object.assign(defaultEventsOptions, props)

    for (const eventEntry of Object.entries(eventsOptions)) {
        const [eventName, eventOptions]: any = eventEntry
        const { withExit } = eventOptions
        process.on(eventName, exitHandler.bind(null, { eventName, withExit }))
    }

    isProcessWatchingStarted = true
}

export const watchProcessDeath = (callback: callbackType) => {
    if (!isProcessWatchingStarted) startProcessDeathWatching()
    callbackList.push(callback)
}

// process.kill(process.pid, 'SIGUSR2')
// process.kill(process.ppid, 'SIGUSR2')
