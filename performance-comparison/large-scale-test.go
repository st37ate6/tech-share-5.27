package main

import (
	"fmt"
	"math/rand"
	"runtime"
	"sync"
	"sync/atomic"
	"time"
)

// 基础类型定义
type NodeKind int

const (
	FunctionDeclaration NodeKind = iota + 1
	VariableDeclaration
	CallExpression
	BinaryExpression
	Identifier
)

type ASTNode struct {
	Kind     NodeKind
	Name     string
	Children []*ASTNode
	Parent   *ASTNode
}

type Symbol struct {
	Name  string
	Type  string
	Scope int
}

// 生成 AST 的函数
func generateAST(depth, breadth int) *ASTNode {
	kinds := []NodeKind{
		FunctionDeclaration,
		VariableDeclaration,
		CallExpression,
		BinaryExpression,
		Identifier,
	}

	node := &ASTNode{
		Kind:     kinds[rand.Intn(len(kinds))],
		Name:     fmt.Sprintf("node_%d", rand.Int()),
		Children: make([]*ASTNode, 0),
	}

	if depth > 0 {
		for i := 0; i < breadth; i++ {
			child := generateAST(depth-1, breadth)
			child.Parent = node
			node.Children = append(node.Children, child)
		}
	}

	return node
}

// 模拟大型项目的数据结构
type LargeProject struct {
	Files         []*SourceFile
	GlobalSymbols *GlobalSymbolTable
	Dependencies  map[string][]string
}

type SourceFile struct {
	Path    string
	Content []byte
	AST     *ASTNode
	Symbols []*Symbol
	Size    int
}

type GlobalSymbolTable struct {
	mu      sync.RWMutex
	symbols map[string]*Symbol
	types   map[string]*TypeInfo
}

type TypeInfo struct {
	Name       string
	Properties map[string]string
	Methods    []string
}

// 创建大型项目模拟
func createLargeProject(fileCount int) *LargeProject {
	fmt.Printf("正在创建项目结构...")
	project := &LargeProject{
		Files:         make([]*SourceFile, fileCount),
		GlobalSymbols: &GlobalSymbolTable{
			symbols: make(map[string]*Symbol),
			types:   make(map[string]*TypeInfo),
		},
		Dependencies: make(map[string][]string),
	}

	// 创建大量文件
	for i := 0; i < fileCount; i++ {
		// 显示进度
		if i%50 == 0 || i == fileCount-1 {
			progress := float64(i+1) / float64(fileCount) * 100
			fmt.Printf("\r正在创建项目结构... %.1f%% (%d/%d)", progress, i+1, fileCount)
		}
		
		file := &SourceFile{
			Path:    fmt.Sprintf("src/file_%d.ts", i),
			Content: make([]byte, 10000), // 10KB 每个文件
			AST:     generateAST(6, 3),   // 减少 AST 深度以提高速度
			Symbols: make([]*Symbol, 50), // 减少符号数量
			Size:    10000,
		}

		// 填充符号
		for j := 0; j < 50; j++ {
			symbol := &Symbol{
				Name:  fmt.Sprintf("symbol_%d_%d", i, j),
				Type:  "function",
				Scope: j / 10,
			}
			file.Symbols[j] = symbol
			
			// 添加到全局符号表
			project.GlobalSymbols.symbols[symbol.Name] = symbol
		}

		// 添加类型信息
		typeInfo := &TypeInfo{
			Name:       fmt.Sprintf("Type_%d", i),
			Properties: make(map[string]string),
			Methods:    make([]string, 10), // 减少方法数量
		}
		
		for k := 0; k < 10; k++ {
			typeInfo.Properties[fmt.Sprintf("prop_%d", k)] = "string"
			typeInfo.Methods[k] = fmt.Sprintf("method_%d", k)
		}
		
		project.GlobalSymbols.types[typeInfo.Name] = typeInfo
		project.Files[i] = file
	}
	
	fmt.Printf("\n项目创建完成！\n")
	return project
}

// 单线程处理
func processProjectSingleThread(project *LargeProject) time.Duration {
	start := time.Now()
	total := len(project.Files)
	
	for i, file := range project.Files {
		if i%20 == 0 || i == total-1 {
			progress := float64(i+1) / float64(total) * 100
			fmt.Printf("\r  单线程处理进度: %.1f%% (%d/%d)", progress, i+1, total)
		}
		processFile(file, project.GlobalSymbols)
	}
	fmt.Printf("\n")
	
	return time.Since(start)
}

// 并发处理
func processProjectConcurrent(project *LargeProject) time.Duration {
	start := time.Now()
	total := len(project.Files)
	processed := int64(0)
	
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, runtime.NumCPU())
	
	// 启动进度监控
	done := make(chan bool)
	go func() {
		ticker := time.NewTicker(100 * time.Millisecond)
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				current := processed
				progress := float64(current) / float64(total) * 100
				fmt.Printf("\r  并发处理进度: %.1f%% (%d/%d)", progress, current, total)
			case <-done:
				return
			}
		}
	}()
	
	for _, file := range project.Files {
		wg.Add(1)
		go func(f *SourceFile) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()
			
			processFile(f, project.GlobalSymbols)
			atomic.AddInt64(&processed, 1)
		}(file)
	}
	
	wg.Wait()
	done <- true
	fmt.Printf("\n")
	
	return time.Since(start)
}

// 高并发处理（模拟真实编译器）
func processProjectHighConcurrency(project *LargeProject) time.Duration {
	start := time.Now()
	total := len(project.Files)
	processed := int64(0)
	
	var wg sync.WaitGroup
	// 使用更多的 goroutine
	semaphore := make(chan struct{}, runtime.NumCPU()*4)
	
	// 启动进度监控
	done := make(chan bool)
	go func() {
		ticker := time.NewTicker(100 * time.Millisecond)
		defer ticker.Stop()
		
		for {
			select {
			case <-ticker.C:
				current := processed
				progress := float64(current) / float64(total) * 100
				fmt.Printf("\r  高并发处理进度: %.1f%% (%d/%d)", progress, current, total)
			case <-done:
				return
			}
		}
	}()
	
	for _, file := range project.Files {
		wg.Add(1)
		go func(f *SourceFile) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()
			
			// 更复杂的处理
			processFileWithDependencies(f, project.GlobalSymbols, project.Dependencies)
			atomic.AddInt64(&processed, 1)
		}(file)
	}
	
	wg.Wait()
	done <- true
	fmt.Printf("\n")
	
	return time.Since(start)
}

// 模拟文件处理
func processFile(file *SourceFile, globalSymbols *GlobalSymbolTable) {
	// 模拟 AST 遍历
	nodeCount := visitNodeComplex(file.AST)
	
	// 模拟符号解析
	for _, symbol := range file.Symbols {
		resolveSymbolWithGlobal(symbol.Name, globalSymbols)
	}
	
	// 模拟类型检查
	for i := 0; i < nodeCount/10; i++ {
		performTypeCheck(globalSymbols)
	}
}

// 带依赖关系的文件处理
func processFileWithDependencies(file *SourceFile, globalSymbols *GlobalSymbolTable, deps map[string][]string) {
	// 基本处理
	processFile(file, globalSymbols)
	
	// 处理依赖关系
	if dependencies, exists := deps[file.Path]; exists {
		for _, dep := range dependencies {
			// 模拟依赖解析
			resolveSymbolWithGlobal(dep, globalSymbols)
		}
	}
	
	// 模拟增量编译检查
	checkIncrementalChanges(file, globalSymbols)
}

// 复杂的 AST 遍历
func visitNodeComplex(node *ASTNode) int {
	if node == nil {
		return 0
	}
	
	count := 1
	
	// 减少模拟操作以提高速度
	for i := 0; i < 50; i++ {
		_ = fmt.Sprintf("op_%s_%d", node.Name, i)
	}
	
	// 递归处理子节点
	for _, child := range node.Children {
		count += visitNodeComplex(child)
	}
	
	return count
}

// 全局符号解析
func resolveSymbolWithGlobal(name string, globalSymbols *GlobalSymbolTable) *Symbol {
	globalSymbols.mu.RLock()
	defer globalSymbols.mu.RUnlock()
	
	if symbol, exists := globalSymbols.symbols[name]; exists {
		return symbol
	}
	
	return nil
}

// 类型检查
func performTypeCheck(globalSymbols *GlobalSymbolTable) {
	globalSymbols.mu.RLock()
	defer globalSymbols.mu.RUnlock()
	
	// 简化类型推导
	count := 0
	for _, typeInfo := range globalSymbols.types {
		for range typeInfo.Properties {
			count++
			if count > 5 { // 限制处理数量
				return
			}
		}
	}
}

// 增量编译检查
func checkIncrementalChanges(file *SourceFile, globalSymbols *GlobalSymbolTable) {
	// 简化增量编译逻辑
	for i := 0; i < 10; i++ {
		symbolName := fmt.Sprintf("inc_%d", i)
		resolveSymbolWithGlobal(symbolName, globalSymbols)
	}
}

// 内存使用统计
func getMemStats() (float64, float64) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return float64(m.Alloc) / 1024 / 1024, float64(m.Sys) / 1024 / 1024
}

func main() {
	fmt.Println("=== 大规模 Go 并发测试 ===\n")
	
	// 调整测试规模，使其更合理
	fileCounts := []int{50, 200, 500}
	
	for _, fileCount := range fileCounts {
		fmt.Printf("测试项目规模: %d 个文件\n", fileCount)
		fmt.Println("----------------------------------------")
		
		// 创建项目
		project := createLargeProject(fileCount)
		
		allocBefore, _ := getMemStats()
		
		// 单线程测试
		fmt.Println("单线程处理...")
		singleTime := processProjectSingleThread(project)
		
		// 并发测试
		fmt.Println("并发处理...")
		concurrentTime := processProjectConcurrent(project)
		
		// 高并发测试
		fmt.Println("高并发处理...")
		highConcurrentTime := processProjectHighConcurrency(project)
		
		allocAfter, _ := getMemStats()
		
		// 结果
		fmt.Printf("\n结果:\n")
		fmt.Printf("  单线程耗时: %.2f ms\n", float64(singleTime.Nanoseconds())/1000000)
		fmt.Printf("  并发耗时: %.2f ms\n", float64(concurrentTime.Nanoseconds())/1000000)
		fmt.Printf("  高并发耗时: %.2f ms\n", float64(highConcurrentTime.Nanoseconds())/1000000)
		fmt.Printf("  并发提升: %.2fx\n", float64(singleTime.Nanoseconds())/float64(concurrentTime.Nanoseconds()))
		fmt.Printf("  高并发提升: %.2fx\n", float64(singleTime.Nanoseconds())/float64(highConcurrentTime.Nanoseconds()))
		fmt.Printf("  内存使用: %.2f MB\n", allocAfter-allocBefore)
		fmt.Printf("  CPU 核心数: %d\n\n", runtime.NumCPU())
	}

} 