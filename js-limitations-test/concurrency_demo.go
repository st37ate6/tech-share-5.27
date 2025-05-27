package main

import (
	"fmt"
	"sync"
	"sync/atomic"
	"time"
)

// 定义一个复杂的数据结构
type ComplexData struct {
	ID       int
	Name     string
	Values   []int
	Metadata map[string]interface{}
	mu       sync.RWMutex // 内置锁保护数据
}

// 为 ComplexData 添加方法
func (cd *ComplexData) UpdateValue(index int, value int) {
	cd.mu.Lock()
	defer cd.mu.Unlock()
	if index < len(cd.Values) {
		cd.Values[index] = value
	}
}

func (cd *ComplexData) GetValue(index int) int {
	cd.mu.RLock()
	defer cd.mu.RUnlock()
	if index < len(cd.Values) {
		return cd.Values[index]
	}
	return 0
}

func (cd *ComplexData) AddMetadata(key string, value interface{}) {
	cd.mu.Lock()
	defer cd.mu.Unlock()
	cd.Metadata[key] = value
}

func main() {
	fmt.Println("=== Go 并发能力演示 ===\n")

	// 测试1：共享复杂数据结构
	testComplexDataSharing()

	// 测试2：大量 goroutine 并发
	testMassiveConcurrency()

	// 测试3：原子操作性能
	testAtomicOperations()

	// 测试4：通道通信
	testChannelCommunication()
}

// 测试1：共享复杂数据结构
func testComplexDataSharing() {
	fmt.Println("=== 测试1：共享复杂数据结构 ===")

	// 创建一个复杂的共享数据结构
	sharedData := &ComplexData{
		ID:       1,
		Name:     "共享数据",
		Values:   make([]int, 10),
		Metadata: make(map[string]interface{}),
	}

	// 初始化数据
	for i := 0; i < 10; i++ {
		sharedData.Values[i] = i * 10
	}

	fmt.Printf("初始数据：%+v\n", sharedData.Values)

	var wg sync.WaitGroup
	workerCount := 5

	// 启动多个 goroutine 同时修改共享数据
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			// 每个 worker 修改不同的数据
			for j := 0; j < 10; j++ {
				sharedData.UpdateValue(j, workerID*100+j)
				sharedData.AddMetadata(fmt.Sprintf("worker_%d_key_%d", workerID, j), 
					fmt.Sprintf("value_%d", workerID*10+j))
			}

			fmt.Printf("Worker %d 完成数据修改\n", workerID)
		}(i)
	}

	wg.Wait()

	fmt.Printf("最终数据：%+v\n", sharedData.Values)
	fmt.Printf("元数据数量：%d\n", len(sharedData.Metadata))
	fmt.Println("✓ Go 可以安全地在多个 goroutine 间共享复杂数据结构！\n")
}

// 测试2：大量 goroutine 并发
func testMassiveConcurrency() {
	fmt.Println("=== 测试2：大量 goroutine 并发 ===")

	start := time.Now()
	var counter int64
	var wg sync.WaitGroup

	// 创建大量 goroutine
	goroutineCount := 10000
	operationsPerGoroutine := 1000

	fmt.Printf("创建 %d 个 goroutine，每个执行 %d 次操作\n", 
		goroutineCount, operationsPerGoroutine)

	for i := 0; i < goroutineCount; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()

			// 每个 goroutine 执行多次原子操作
			for j := 0; j < operationsPerGoroutine; j++ {
				atomic.AddInt64(&counter, 1)
			}

			// 模拟一些计算工作
			sum := 0
			for k := 0; k < 100; k++ {
				sum += k
			}
		}(i)
	}

	wg.Wait()
	duration := time.Since(start)

	expectedValue := int64(goroutineCount * operationsPerGoroutine)
	fmt.Printf("最终计数值：%d\n", counter)
	fmt.Printf("预期值：%d\n", expectedValue)
	fmt.Printf("是否一致：%t\n", counter == expectedValue)
	fmt.Printf("执行时间：%v\n", duration)
	fmt.Printf("✓ Go 轻松处理 %d 个并发 goroutine！\n\n", goroutineCount)
}

// 测试3：原子操作性能
func testAtomicOperations() {
	fmt.Println("=== 测试3：原子操作性能 ===")

	var atomicCounter int64
	var mutexCounter int64
	var mu sync.Mutex

	operationCount := 1000000
	workerCount := 10

	// 测试原子操作
	start := time.Now()
	var wg1 sync.WaitGroup

	for i := 0; i < workerCount; i++ {
		wg1.Add(1)
		go func() {
			defer wg1.Done()
			for j := 0; j < operationCount/workerCount; j++ {
				atomic.AddInt64(&atomicCounter, 1)
			}
		}()
	}

	wg1.Wait()
	atomicDuration := time.Since(start)

	// 测试互斥锁操作
	start = time.Now()
	var wg2 sync.WaitGroup

	for i := 0; i < workerCount; i++ {
		wg2.Add(1)
		go func() {
			defer wg2.Done()
			for j := 0; j < operationCount/workerCount; j++ {
				mu.Lock()
				mutexCounter++
				mu.Unlock()
			}
		}()
	}

	wg2.Wait()
	mutexDuration := time.Since(start)

	fmt.Printf("原子操作结果：%d，耗时：%v\n", atomicCounter, atomicDuration)
	fmt.Printf("互斥锁操作结果：%d，耗时：%v\n", mutexCounter, mutexDuration)
	fmt.Printf("原子操作比互斥锁快：%.2fx\n", 
		float64(mutexDuration)/float64(atomicDuration))
	fmt.Println("✓ Go 提供了多种高效的并发同步原语！\n")
}

// 测试4：通道通信
func testChannelCommunication() {
	fmt.Println("=== 测试4：通道通信 ===")

	// 创建不同类型的通道
	dataChannel := make(chan int, 100)
	resultChannel := make(chan string, 10)
	doneChannel := make(chan bool)

	// 生产者 goroutine
	go func() {
		fmt.Println("生产者开始生产数据...")
		for i := 1; i <= 50; i++ {
			dataChannel <- i * i // 发送平方数
		}
		close(dataChannel)
		fmt.Println("生产者完成")
	}()

	// 多个消费者 goroutine
	var wg sync.WaitGroup
	consumerCount := 3

	for i := 0; i < consumerCount; i++ {
		wg.Add(1)
		go func(consumerID int) {
			defer wg.Done()
			processedCount := 0

			for data := range dataChannel {
				// 模拟处理数据
				time.Sleep(time.Millisecond * 1)
				processedCount++

				if data%100 == 0 { // 每处理100的倍数时报告
					resultChannel <- fmt.Sprintf("消费者%d处理了数据%d", consumerID, data)
				}
			}

			resultChannel <- fmt.Sprintf("消费者%d总共处理了%d个数据", consumerID, processedCount)
		}(i)
	}

	// 结果收集器
	go func() {
		wg.Wait()
		close(resultChannel)
		doneChannel <- true
	}()

	// 收集并打印结果
	fmt.Println("处理结果：")
	for result := range resultChannel {
		fmt.Printf("  %s\n", result)
	}

	<-doneChannel
	fmt.Println("✓ Go 的通道提供了优雅的并发通信机制！\n")
}

// 额外演示：展示 Go 相比 JavaScript 的优势
func init() {
	fmt.Println("=== Go 并发优势总结 ===")
	fmt.Println("1. 真正的共享内存：可以安全地在 goroutine 间共享任何数据结构")
	fmt.Println("2. 轻量级 goroutine：可以轻松创建数万个并发单元")
	fmt.Println("3. 丰富的同步原语：mutex、atomic、channel 等")
	fmt.Println("4. 零拷贝通信：通过指针直接访问共享数据")
	fmt.Println("5. 高效的调度器：M:N 调度模型，充分利用多核")
	fmt.Println("6. 内置并发支持：语言级别的并发原语")
	fmt.Println()
} 