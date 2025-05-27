package main

import (
	"fmt"
	"math/rand"
	"runtime"
	"sync"
	"time"
)

// NodeKind 枚举
type NodeKind int

const (
	FunctionDeclaration NodeKind = iota + 1
	VariableDeclaration
	CallExpression
	BinaryExpression
	Identifier
)

// ASTNode 结构体
type ASTNode struct {
	Kind     NodeKind
	Name     string
	Children []*ASTNode
	Parent   *ASTNode
}

// Symbol 结构体
type Symbol struct {
	Name  string
	Type  string
	Scope int
}

// SymbolTable 结构体
type SymbolTable struct {
	symbols map[string]*Symbol
	parent  *SymbolTable
}

// TypeChecker 结构体
type TypeChecker struct {
	symbolTable *SymbolTable
	mu          sync.RWMutex // 用于并发安全
}

// NewTypeChecker 创建新的类型检查器
func NewTypeChecker() *TypeChecker {
	return &TypeChecker{
		symbolTable: &SymbolTable{
			symbols: make(map[string]*Symbol),
		},
	}
}

// 1. AST 节点遍历测试
func (tc *TypeChecker) visitNode(node *ASTNode) int {
	count := 1

	switch node.Kind {
	case FunctionDeclaration:
		tc.checkFunctionDeclaration(node)
	case VariableDeclaration:
		tc.checkVariableDeclaration(node)
	case CallExpression:
		tc.checkCallExpression(node)
	default:
		// 其他节点类型
	}

	// 递归处理子节点
	for _, child := range node.Children {
		count += tc.visitNode(child)
	}

	return count
}

func (tc *TypeChecker) checkFunctionDeclaration(node *ASTNode) {
	// 模拟函数声明检查
	for i := 0; i < 100; i++ {
		_ = fmt.Sprintf("%s%d", node.Name, i)
	}
}

func (tc *TypeChecker) checkVariableDeclaration(node *ASTNode) {
	// 模拟变量声明检查
	for i := 0; i < 50; i++ {
		_ = fmt.Sprintf("%s%d", node.Name, i)
	}
}

func (tc *TypeChecker) checkCallExpression(node *ASTNode) {
	// 模拟函数调用检查
	for i := 0; i < 75; i++ {
		_ = fmt.Sprintf("%s%d", node.Name, i)
	}
}

// 2. 符号表查找测试
func (tc *TypeChecker) resolveSymbol(name string) *Symbol {
	tc.mu.RLock()
	defer tc.mu.RUnlock()

	current := tc.symbolTable
	for current != nil {
		if symbol, exists := current.symbols[name]; exists {
			return symbol
		}
		current = current.parent
	}
	return nil
}

func (tc *TypeChecker) addSymbol(name, symbolType string, scope int) {
	tc.mu.Lock()
	defer tc.mu.Unlock()

	tc.symbolTable.symbols[name] = &Symbol{
		Name:  name,
		Type:  symbolType,
		Scope: scope,
	}
}

// 3. 并发处理测试
func (tc *TypeChecker) processFilesConcurrent(files []*ASTNode) int {
	var wg sync.WaitGroup
	var totalNodes int64
	var mu sync.Mutex

	// 使用 goroutine 并发处理
	semaphore := make(chan struct{}, runtime.NumCPU())

	for _, file := range files {
		wg.Add(1)
		go func(f *ASTNode) {
			defer wg.Done()
			semaphore <- struct{}{} // 获取信号量
			defer func() { <-semaphore }()

			count := tc.visitNode(f)

			mu.Lock()
			totalNodes += int64(count)
			mu.Unlock()
		}(file)
	}

	wg.Wait()
	return int(totalNodes)
}

// 单线程处理（用于对比）
func (tc *TypeChecker) processFiles(files []*ASTNode) int {
	totalNodes := 0
	for _, file := range files {
		totalNodes += tc.visitNode(file)
	}
	return totalNodes
}

// 生成测试数据
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

func generateSymbols(count int) []*Symbol {
	symbols := make([]*Symbol, count)
	for i := 0; i < count; i++ {
		symbolType := "variable"
		if i%2 == 0 {
			symbolType = "function"
		}
		symbols[i] = &Symbol{
			Name:  fmt.Sprintf("symbol_%d", i),
			Type:  symbolType,
			Scope: i / 100,
		}
	}
	return symbols
}

// 内存使用统计
func getMemStats() (float64, float64) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	return float64(m.Alloc) / 1024 / 1024, float64(m.Sys) / 1024 / 1024
}

// 性能测试
func runPerformanceTest() {
	fmt.Println("=== Go 性能测试 ===\n")

	checker := NewTypeChecker()

	// 1. AST 遍历测试
	fmt.Println("1. AST 节点遍历测试")
	ast := generateAST(6, 4) // 深度6，每层4个子节点

	astStart := time.Now()
	nodeCount := checker.visitNode(ast)
	astTime := time.Since(astStart)

	fmt.Printf("   处理节点数: %d\n", nodeCount)
	fmt.Printf("   耗时: %.2f ms\n\n", float64(astTime.Nanoseconds())/1000000)

	// 2. 符号表测试
	fmt.Println("2. 符号表查找测试")
	symbols := generateSymbols(10000)

	// 添加符号到符号表
	for _, symbol := range symbols {
		checker.addSymbol(symbol.Name, symbol.Type, symbol.Scope)
	}

	symbolStart := time.Now()
	foundCount := 0
	for i := 0; i < 50000; i++ {
		symbolName := fmt.Sprintf("symbol_%d", i%10000)
		if checker.resolveSymbol(symbolName) != nil {
			foundCount++
		}
	}
	symbolTime := time.Since(symbolStart)

	fmt.Printf("   查找次数: 50000\n")
	fmt.Printf("   找到符号: %d\n", foundCount)
	fmt.Printf("   耗时: %.2f ms\n\n", float64(symbolTime.Nanoseconds())/1000000)

	// 3. 批量文件处理测试（单线程）
	fmt.Println("3. 批量文件处理测试（单线程）")
	files := make([]*ASTNode, 10)
	for i := 0; i < 10; i++ {
		files[i] = generateAST(5, 3)
	}

	batchStart := time.Now()
	totalNodes := checker.processFiles(files)
	batchTime := time.Since(batchStart)

	fmt.Printf("   处理文件数: %d\n", len(files))
	fmt.Printf("   总节点数: %d\n", totalNodes)
	fmt.Printf("   耗时: %.2f ms\n\n", float64(batchTime.Nanoseconds())/1000000)

	// 4. 并发处理测试
	fmt.Println("4. 批量文件处理测试（并发）")
	concurrentStart := time.Now()
	totalNodesConcurrent := checker.processFilesConcurrent(files)
	concurrentTime := time.Since(concurrentStart)

	fmt.Printf("   处理文件数: %d\n", len(files))
	fmt.Printf("   总节点数: %d\n", totalNodesConcurrent)
	fmt.Printf("   耗时: %.2f ms\n", float64(concurrentTime.Nanoseconds())/1000000)
	fmt.Printf("   并发提升: %.2fx\n\n", float64(batchTime.Nanoseconds())/float64(concurrentTime.Nanoseconds()))

	// 5. 内存使用测试
	fmt.Println("5. 内存使用测试")
	allocBefore, _ := getMemStats()

	// 创建大量对象
	objects := make([]*ASTNode, 100000)
	for i := 0; i < 100000; i++ {
		objects[i] = &ASTNode{
			Kind:     Identifier,
			Name:     fmt.Sprintf("obj_%d", i),
			Children: make([]*ASTNode, 0),
		}
	}

	runtime.GC() // 强制垃圾回收
	allocAfter, _ := getMemStats()

	fmt.Printf("   创建对象数: 100000\n")
	fmt.Printf("   堆内存增长: %.2f MB\n\n", allocAfter-allocBefore)

	// 总结
	fmt.Println("=== 总结 ===")
	fmt.Printf("AST 遍历: %.2f ms\n", float64(astTime.Nanoseconds())/1000000)
	fmt.Printf("符号查找: %.2f ms\n", float64(symbolTime.Nanoseconds())/1000000)
	fmt.Printf("批量处理（单线程）: %.2f ms\n", float64(batchTime.Nanoseconds())/1000000)
	fmt.Printf("批量处理（并发）: %.2f ms\n", float64(concurrentTime.Nanoseconds())/1000000)
	fmt.Printf("内存使用: %.2f MB\n", allocAfter-allocBefore)
}

func main() {
	// 设置随机种子
	rand.Seed(time.Now().UnixNano())

	// 运行性能测试
	runPerformanceTest()
}