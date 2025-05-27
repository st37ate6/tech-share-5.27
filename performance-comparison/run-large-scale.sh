#!/bin/bash

echo "=== 大规模编译器性能测试 ==="
echo "测试三种语言在模拟编译器场景下的性能表现"
echo ""

# 确保在正确的目录
cd "$(dirname "$0")"

# 检查依赖
if ! command -v node &> /dev/null; then
    echo "错误: 需要安装 Node.js"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "错误: 需要安装 npx"
    exit 1
fi

if ! command -v go &> /dev/null; then
    echo "错误: 需要安装 Go"
    exit 1
fi

# 运行 JavaScript 版本
echo "🟨 运行 JavaScript 大规模测试..."
echo "----------------------------------------"
node src/large-scale-test.js
echo ""

# 运行 TypeScript 版本
echo "🟦 运行 TypeScript 大规模测试..."
echo "----------------------------------------"
npx ts-node src/large-scale-test.ts
echo ""

# 运行 Go 版本
echo "🟩 运行 Go 大规模测试..."
echo "----------------------------------------"
go run large-scale-test.go
echo ""

echo "=== 测试完成 ==="
echo ""
echo "📊 性能对比总结:"
echo "• JavaScript: 单线程处理，使用 Promise 模拟并发"
echo "• TypeScript: 与 JavaScript 相似，但有类型检查开销"
echo "• Go: 真正的并发处理，使用 Goroutines"
echo ""
echo "🔍 关键观察点:"
echo "• 内存使用效率"
echo "• 并发处理能力"
echo "• 大规模数据处理性能"
echo "• 垃圾回收效率" 