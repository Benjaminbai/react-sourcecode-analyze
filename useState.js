
// 设置一个变量标记是否是第一次更新
let isMount = true
// 函数组件中可能会同时存在多个usestate，声明一个变量用来标记
let workInprogressHook = null

// react中每个组件都有对应的fiber
const fiber = {
    // 这个属性就代表组件
    stateNode: App,
    // 用来保存数据
    memorizedState: null
}

// 接收一个初始值
function useState(initialState) {
    let hook
    // 如果是第一次更新
    if(isMount) {
        hook = {
            memorizedState: initialState,
            // 是一个链表
            next: null,
            // 这是可能会多次更新，需要一个队列保存
            queue: {
                pending: null
            }
        }
        // 如果没有数据保存
        if(!fiber.memorizedState) {
            // 给fiber的memorized赋值
            fiber.memorizedState = hook
        }else {
            // hook赋值给下一个节点
            workInprogressHook.next = hook
        }
        // hook赋值给当前节点
        workInprogressHook = hook
    }else {
        // 如果不是第一次更新，把当前节点给hook
        hook = workInprogressHook
        // 把下一个节点，给当前节点
        workInprogressHook = workInprogressHook.next
    }

    // 取出hook.memorizedState
    let baseState = hook.memorizedState
    // 如果触发更新
    if(hook.queue.pending) {
        // 把下一次取出
        let firstUpdate = hook.queue.pending.next
        // 一直循环，除非下一次节点，不等于下一的节点
        do {
            const action = firstUpdate.action
            // 调用方法，赋值给base
            baseState = action(baseState)
            // 链表的下一步
            firstUpdate = firstUpdate.next
        }while(firstUpdate !== hook.queue.pending.next)

        hook.queue.pending = null
    }
    // 结果给memorized
    hook.memorizedState = baseState
    // 返回usestate的结果
    return [baseState, dispatchAction.bind(null, hook.queue)]
}

// 更新函数， 接收两个参数
function dispatchAction(queue, action) {
    // 也是一个链表
    const update = {
        action,
        next: null
    }

    // 环状链表
    if(queue.pending === null) {
        // u0 -> u0 -> u0
        update.next = update
    }else {
        // u1 -> u0 -> u1
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

// 模拟一个函数组件
function App() {
    // useState 接收返回两个参数，值和一个更新函数
    const [num, updateNum] = useState(0)
    const [num1, updateNum1] = useState(0)

    console.log('ismount', isMount)
    console.log('num', num)
    console.log('num1', num1)
    
    // 模拟的事件
    return {
        // 触发，模拟更新
        onClick() {
            updateNum(num => num+1)
        },
        onFocus() {
            updateNum1(num => num+10)
        },
    }
}

// 挂在window上，方便调用
window.app = schedule()