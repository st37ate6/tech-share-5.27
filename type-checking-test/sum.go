package main

import (
	"fmt"
	"strconv"
)

// 定义一个结构体来演示类型安全
type Calculator struct {
	name string
}

// 严格的类型检查 - 只接受整数
func (c Calculator) addIntegers(a, b int) int {
	fmt.Printf("[%s] 整数相加: %d + %d = %d\n", c.name, a, b, a+b)
	return a + b
}

// 严格的类型检查 - 只接受浮点数
func (c Calculator) addFloats(a, b float64) float64 {
	fmt.Printf("[%s] 浮点数相加: %.2f + %.2f = %.2f\n", c.name, a, b, a+b)
	return a + b
}

// 字符串转换函数 - 显式类型转换
func (c Calculator) addStrings(a, b string) (int, error) {
	numA, errA := strconv.Atoi(a)
	if errA != nil {
		return 0, fmt.Errorf("无法将 '%s' 转换为整数: %v", a, errA)
	}
	
	numB, errB := strconv.Atoi(b)
	if errB != nil {
		return 0, fmt.Errorf("无法将 '%s' 转换为整数: %v", b, errB)
	}
	
	result := numA + numB
	fmt.Printf("[%s] 字符串转换后相加: '%s' + '%s' = %d\n", c.name, a, b, result)
	return result, nil
}

// 泛型函数示例 (Go 1.18+)
func addGeneric[T int | float64](a, b T) T {
	return a + b
}

func main() {
	fmt.Println("=== Go 语言类型检查示例 ===")
	fmt.Println("特点: 强类型系统，编译时严格检查，不允许隐式类型转换")
	fmt.Println()

	calc := Calculator{name: "Go计算器"}

	// 1. 正确的类型使用
	fmt.Println("1. 正确的类型使用:")
	calc.addIntegers(10, 20)
	calc.addFloats(3.14, 2.86)
	fmt.Println()

	// 2. 字符串转换 - 需要显式处理
	fmt.Println("2. 字符串转换 (需要显式处理):")
	result, err := calc.addStrings("15", "25")
	if err != nil {
		fmt.Printf("错误: %v\n", err)
	} else {
		fmt.Printf("转换成功，结果: %d\n", result)
	}

	// 尝试转换无效字符串
	_, err = calc.addStrings("abc", "25")
	if err != nil {
		fmt.Printf("预期错误: %v\n", err)
	}
	fmt.Println()

	// 3. 泛型示例
	fmt.Println("3. 泛型函数示例:")
	fmt.Printf("泛型整数相加: %d\n", addGeneric(100, 200))
	fmt.Printf("泛型浮点数相加: %.2f\n", addGeneric(1.5, 2.5))
	fmt.Println()

	// 4. 类型安全演示
	fmt.Println("4. 类型安全特性:")
	fmt.Println("✓ 编译时类型检查")
	fmt.Println("✓ 不允许隐式类型转换")
	fmt.Println("✓ 强制错误处理")
	fmt.Println("✓ 内存安全")
	
	// 以下代码如果取消注释会导致编译错误:
	// calc.addIntegers(10, 3.14)        // 错误: 不能将float64传给int参数
	// calc.addIntegers("10", "20")      // 错误: 不能将string传给int参数
	// var x int = "hello"               // 错误: 类型不匹配
	
	fmt.Println()
	fmt.Println("注意: Go 的强类型系统在编译时就能发现类型错误，")
	fmt.Println("提供了最高级别的类型安全保证。")
} 