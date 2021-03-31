
let isMount = true
let workInprogressHook = null

const fiber = {
    stateNode: App,
    memorizedState: null
}
function useState(initialState) {
    let hook
    if(isMount) {
        hook = {
            memorizedState: initialState,
            next: null,
            queue: {
                pending: null
            }
        }

        if(!fiber.memorizedState) {
            fiber.memorizedState = hook
        }else {
            workInprogressHook.next = hook
        }
        workInprogressHook = hook
    }else {
        hook = workInprogressHook
        workInprogressHook = workInprogressHook.next
    }

    let baseState = hook.memorizedState
    if(hook.queue.pending) {
        let firstUpdate = hook.queue.pending.next
        do {
            const action = firstUpdate.action
            baseState = action(baseState)
            firstUpdate = firstUpdate.next
        }while(firstUpdate !== hook.queue.pending.next)
        hook.queue.pending = null
    }
    hook.memorizedState = baseState
    return [base, dispatchAction.bind(null, hook.queue)]
}

function dispatchAction(queue, action) {
    const update = {
        action,
        next: null
    }

    if(queue.pending === null) {
        update.next = update
    }else {
        update.next = queue.pending.next
        queue.pending.next = update
    }
    queue.pending = update

    schedule()
}

function schedule() {
    workInprogressHook = fiber.memorizedState
    const app = fiber.stateNode()
    isMount = false
    return app
}


function App() {
    const [num, setUpdate] = useState(0)

    return {
        onClick() {
            upDateNum(num => num + 1)
        }
    }
}