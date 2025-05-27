package main

import (
	"fmt"
	"runtime"
	"sort"
	"time"
)

// Person 结构体
type Person struct {
	ID       int
	Name     string
	Email    string
	Age      int
	Address  string
	Phone    string
	Company  string
	Position string
	Salary   int
	JoinDate time.Time
}

// MemoryTester 结构体
type MemoryTester struct {
	count  int
	people []Person
}

// NewMemoryTester 创建新的内存测试器
func NewMemoryTester(count int) *MemoryTester {
	return &MemoryTester{
		count:  count,
		people: make([]Person, 0, count),
	}
}

// getMemoryUsage 获取当前内存使用量（MB）
func (mt *MemoryTester) getMemoryUsage() float64 {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return float64(m.Alloc) / 1024 / 1024
}

// createPerson 创建一个人员对象
func (mt *MemoryTester) createPerson(id int) Person {
	return Person{
		ID:       id,
		Name:     fmt.Sprintf("Person_%d", id),
		Email:    fmt.Sprintf("person%d@example.com", id),
		Age:      20 + (id % 50),
		Address:  fmt.Sprintf("Address %d, Street %d, City %d", id, id%100, id%10),
		Phone:    fmt.Sprintf("+1-555-%07d", id),
		Company:  fmt.Sprintf("Company_%d", id%1000),
		Position: fmt.Sprintf("Position_%d", id%50),
		Salary:   30000 + (id % 100000),
		JoinDate: time.Date(2020+(id%4), time.Month((id%12)+1), (id%28)+1, 0, 0, 0, 0, time.UTC),
	}
}

// runTest 运行内存测试
func (mt *MemoryTester) runTest() {
	fmt.Println("=== Go 内存测试 ===")
	fmt.Printf("测试规模: %s 条记录\n", formatNumber(mt.count))
	fmt.Println()

	initialMemory := mt.getMemoryUsage()
	fmt.Printf("初始内存使用: %.2f MB\n", initialMemory)

	startTime := time.Now()

	// 创建大量对象
	fmt.Println("开始创建对象...")
	for i := 1; i <= mt.count; i++ {
		mt.people = append(mt.people, mt.createPerson(i))

		if i%100000 == 0 {
			currentMemory := mt.getMemoryUsage()
			fmt.Printf("已创建 %s 条记录，当前内存: %.2f MB\n", formatNumber(i), currentMemory)
		}
	}

	afterCreationMemory := mt.getMemoryUsage()
	creationTime := time.Since(startTime)

	fmt.Println()
	fmt.Println("=== 创建阶段结果 ===")
	fmt.Printf("创建时间: %d ms\n", creationTime.Milliseconds())
	fmt.Printf("创建后内存: %.2f MB\n", afterCreationMemory)
	fmt.Printf("内存增长: %.2f MB\n", afterCreationMemory-initialMemory)
	fmt.Printf("每条记录平均内存: %.2f bytes\n", (afterCreationMemory-initialMemory)*1024*1024/float64(mt.count))

	// 执行一些操作来测试内存使用
	fmt.Println()
	fmt.Println("执行数据操作...")
	operationStartTime := time.Now()

	// 查找操作
	highSalaryCount := 0
	for _, person := range mt.people {
		if person.Salary > 80000 {
			highSalaryCount++
		}
	}
	fmt.Printf("高薪人员数量: %d\n", highSalaryCount)

	// 排序操作（创建副本以避免修改原数组）
	sortedPeople := make([]Person, len(mt.people))
	copy(sortedPeople, mt.people)
	sort.Slice(sortedPeople, func(i, j int) bool {
		return sortedPeople[i].Age < sortedPeople[j].Age
	})
	fmt.Printf("按年龄排序完成，最年轻: %d岁，最年长: %d岁\n", 
		sortedPeople[0].Age, sortedPeople[len(sortedPeople)-1].Age)

	// 聚合操作
	totalSalary := 0
	for _, person := range mt.people {
		totalSalary += person.Salary
	}
	avgSalary := float64(totalSalary) / float64(len(mt.people))
	fmt.Printf("平均薪资: $%.2f\n", avgSalary)

	operationTime := time.Since(operationStartTime)
	finalMemory := mt.getMemoryUsage()

	fmt.Println()
	fmt.Println("=== 最终结果 ===")
	fmt.Printf("操作时间: %d ms\n", operationTime.Milliseconds())
	fmt.Printf("最终内存: %.2f MB\n", finalMemory)
	fmt.Printf("总内存增长: %.2f MB\n", finalMemory-initialMemory)
	fmt.Printf("总执行时间: %d ms\n", time.Since(startTime).Milliseconds())

	// 强制垃圾回收
	fmt.Println()
	fmt.Println("执行垃圾回收...")
	runtime.GC()
	afterGCMemory := mt.getMemoryUsage()
	fmt.Printf("垃圾回收后内存: %.2f MB\n", afterGCMemory)
	fmt.Printf("回收的内存: %.2f MB\n", finalMemory-afterGCMemory)
}

// formatNumber 格式化数字，添加千位分隔符
func formatNumber(n int) string {
	str := fmt.Sprintf("%d", n)
	if len(str) <= 3 {
		return str
	}
	
	result := ""
	for i, char := range str {
		if i > 0 && (len(str)-i)%3 == 0 {
			result += ","
		}
		result += string(char)
	}
	return result
}

func main() {
	recordCount := 1000000 // 100万条记录
	tester := NewMemoryTester(recordCount)
	tester.runTest()
} 