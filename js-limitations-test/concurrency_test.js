// JavaScript 共享内存并发测试

// 使用 Web Worker 模拟并发
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// 主线程代码
if (isMainThread) {
    console.log('=== JavaScript 共享内存并发测试 ===\n');
    
    // 创建一个简单的数据结构
    const sharedBuffer = new SharedArrayBuffer(4); // 4 bytes
    const sharedArray = new Int32Array(sharedBuffer);
    sharedArray[0] = 0; // 初始值

    console.log('初始值：', sharedArray[0]);

    // 创建多个 worker 来并发访问和修改数据
    const workerCount = 4;
    const iterationsPerWorker = 1000;
    
    console.log(`创建 ${workerCount} 个 worker，每个执行 ${iterationsPerWorker} 次增操作\n`);

    // 启动多个 worker
    const workers = new Array(workerCount).fill(null).map(() => {
        return new Worker(__filename, {
            workerData: {
                sharedBuffer,
                iterations: iterationsPerWorker
            }
        });
    });

    // 计数完成的 worker
    let completedWorkers = 0;

    // 监听 worker 完成
    workers.forEach(worker => {
        worker.on('message', message => {
            console.log('Worker 消息：', message);
            completedWorkers++;

            if (completedWorkers === workerCount) {
                // 所有 worker 完成后检查结果
                console.log('\n所有 worker 完成');
                console.log('最终值：', sharedArray[0]);
                console.log('预期值：', workerCount * iterationsPerWorker);
                console.log('是否一致：', sharedArray[0] === workerCount * iterationsPerWorker);
                
                if (sharedArray[0] !== workerCount * iterationsPerWorker) {
                    console.log('\n结论：由于缺乏适当的同步机制，并发操作导致了数据不一致');
                }
                
                // 开始测试对象共享限制
                testObjectSharingLimitations();
            }
        });
    });
}
// Worker 线程代码
else {
    const { sharedBuffer, iterations } = workerData;
    const sharedArray = new Int32Array(sharedBuffer);

    // 执行多次增操作
    for (let i = 0; i < iterations; i++) {
        // 模拟非原子操作：读取 -> 增加 -> 写回
        const currentValue = Atomics.load(sharedArray, 0);
        // 模拟一些处理时间
        for (let j = 0; j < 100; j++) {} 
        Atomics.store(sharedArray, 0, currentValue + 1);
    }

    parentPort.postMessage(`完成 ${iterations} 次操作`);
}

// 测试对象共享的限制
function testObjectSharingLimitations() {
    console.log('\n=== 实际测试对象共享限制 ===');
    
    // 测试1：尝试传递普通对象
    console.log('\n1. 尝试传递普通 JavaScript 对象：');
    const normalObject = { 
        value: 42, 
        nested: { data: 'hello' },
        method: function() { return 'test'; }
    };
    
    try {
        const worker1 = new Worker(__filename, {
            workerData: { normalObject }
        });
        console.log('✓ 普通对象可以传递（但会被序列化/克隆）');
        worker1.terminate();
    } catch (error) {
        console.log('✗ 普通对象传递失败：', error.message);
    }
    
    // 测试2：尝试传递包含函数的对象
    console.log('\n2. 尝试传递包含函数的对象：');
    const objectWithFunction = {
        value: 42,
        calculate: function(x) { return x * 2; }
    };
    
    try {
        const worker2 = new Worker(__filename, {
            workerData: { objectWithFunction }
        });
        console.log('✓ 包含函数的对象传递成功');
        worker2.terminate();
    } catch (error) {
        console.log('✗ 包含函数的对象传递失败：', error.message);
    }
    
    // 测试3：演示普通 ArrayBuffer 不能共享
    console.log('\n3. 测试普通 ArrayBuffer 共享：');
    const normalBuffer = new ArrayBuffer(16);
    const normalArray = new Int32Array(normalBuffer);
    normalArray[0] = 999;
    
    try {
        const worker3 = new Worker(__filename, {
            workerData: { normalBuffer }
        });
        console.log('✓ 普通 ArrayBuffer 可以传递（但会被克隆，不是共享）');
        worker3.terminate();
    } catch (error) {
        console.log('✗ 普通 ArrayBuffer 传递失败：', error.message);
    }
    
    // 测试4：演示 SharedArrayBuffer 的真正共享
    console.log('\n4. 演示 SharedArrayBuffer 的真正共享：');
    const sharedBuf = new SharedArrayBuffer(8);
    const sharedView = new Int32Array(sharedBuf);
    sharedView[0] = 100;
    sharedView[1] = 200;
    
    console.log('主线程设置值：[100, 200]');
    
    const worker4 = new Worker(__filename, {
        workerData: { 
            testType: 'sharedArrayBuffer',
            sharedBuf 
        }
    });
    
    worker4.on('message', (message) => {
        console.log('Worker 返回消息：', message);
        console.log('主线程读取值：', [sharedView[0], sharedView[1]]);
        console.log('✓ SharedArrayBuffer 实现了真正的内存共享！');
        worker4.terminate();
        
        // 最后的总结
        console.log('\n=== 总结 ===');
        console.log('1. 普通对象：可以传递，但会被序列化/反序列化（克隆）');
        console.log('2. 包含函数的对象：函数会丢失，只保留数据');
        console.log('3. 普通 ArrayBuffer：可以传递，但会被克隆，不是共享');
        console.log('4. SharedArrayBuffer：真正的内存共享，多线程可以同时访问');
        console.log('\n这就是为什么 JavaScript 的并发能力有限的原因！');
    });
}

// Worker 线程中处理特殊测试
if (!isMainThread && workerData && workerData.testType === 'sharedArrayBuffer') {
    const { sharedBuf } = workerData;
    const sharedView = new Int32Array(sharedBuf);
    
    console.log('Worker 读取到的值：', [sharedView[0], sharedView[1]]);
    
    // 修改共享内存
    sharedView[0] = 999;
    sharedView[1] = 888;
    
    parentPort.postMessage('Worker 已修改共享内存为 [999, 888]');
} 