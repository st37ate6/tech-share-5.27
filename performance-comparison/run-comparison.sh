#!/bin/bash

echo "=== JavaScript vs TypeScript vs Go 性能对比实验 ==="
echo ""

# 检查依赖
echo "检查依赖..."
if ! command -v node &> /dev/null; then
    echo "错误: 需要安装 Node.js"
    exit 1
fi

if ! command -v go &> /dev/null; then
    echo "错误: 需要安装 Go"
    exit 1
fi

if ! command -v tsc &> /dev/null; then
    echo "安装 TypeScript..."
    npm install -g typescript
fi

# 安装项目依赖
echo "安装项目依赖..."
npm install

# 编译 TypeScript
echo "编译 TypeScript..."
npm run build

echo ""
echo "开始性能测试..."
echo ""

# 运行 JavaScript 测试
echo "运行 JavaScript 测试..."
echo "================================"
node src/javascript-test.js

echo ""
echo ""

# 运行 TypeScript 测试
echo "运行 TypeScript 测试..."
echo "================================"
npm run test

echo ""
echo ""

# 运行 Go 测试
echo "运行 Go 测试..."
echo "================================"
go run go-test.go

echo ""
echo "=== 对比完成 ==="
echo ""
echo "性能总结："
echo "1. JavaScript: 动态类型，JIT 编译优化"
echo "2. TypeScript: 静态类型检查，编译为 JavaScript"
echo "3. Go: 静态类型，AOT 编译，原生机器码"
echo ""
echo "请查看上面的输出结果进行详细性能对比"