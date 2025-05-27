package main

import (
	"fmt"
	"math"
	"sync"
	"time"
)

func isPrime(n int) bool {
	if n <= 1 {
		return false
	}
	if n <= 3 {
		return true
	}
	// 优化：排除偶数（除了2）
	if n%2 == 0 {
		return false
	}
	// 只需要检查到平方根
	sqrt := int(math.Sqrt(float64(n)))
	for i := 3; i <= sqrt; i += 2 {
		if n%i == 0 {
			return false
		}
	}
	return true
}

func findPrimesInRange(start, end int, wg *sync.WaitGroup, results chan<- int) {
	defer wg.Done()
	for i := start; i <= end; i++ {
		if isPrime(i) {
			results <- i
		}
	}
}

func main() {
	startTime := time.Now()
	
	const (
		rangeStart = 1
		rangeEnd   = 50000000 // 一百万
		numWorkers = 10      // 使用10个goroutine并行计算
	)
	
	// 创建通道和等待组
	results := make(chan int, 1000)
	var wg sync.WaitGroup
	
	// 计算每个worker处理的范围
	rangeSize := (rangeEnd - rangeStart + 1) / numWorkers
	
	// 启动worker
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		start := rangeStart + i*rangeSize
		end := start + rangeSize - 1
		if i == numWorkers-1 {
			end = rangeEnd // 确保最后一个worker处理到rangeEnd
		}
		go findPrimesInRange(start, end, &wg, results)
	}
	
	// 创建一个goroutine来关闭results通道
	go func() {
		wg.Wait()
		close(results)
	}()
	
	// 收集结果
	var primes []int
	for prime := range results {
		primes = append(primes, prime)
	}
	
	// 对结果进行排序（可选）
	// sort.Ints(primes)
	
	// 打印结果
	fmt.Printf("Found %d prime numbers\n", len(primes))
	if len(primes) >= 5 {
		fmt.Printf("First 5 primes: %v\n", primes[:5])
		fmt.Printf("Last 5 primes: %v\n", primes[len(primes)-5:])
	}
	
	duration := time.Since(startTime)
	fmt.Printf("Go CPU Test took: %v\n", duration)
} 