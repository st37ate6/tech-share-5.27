"use strict";
// TypeScript 性能测试
var NodeKind;
(function (NodeKind) {
    NodeKind[NodeKind["FunctionDeclaration"] = 1] = "FunctionDeclaration";
    NodeKind[NodeKind["VariableDeclaration"] = 2] = "VariableDeclaration";
    NodeKind[NodeKind["CallExpression"] = 3] = "CallExpression";
    NodeKind[NodeKind["BinaryExpression"] = 4] = "BinaryExpression";
    NodeKind[NodeKind["Identifier"] = 5] = "Identifier";
})(NodeKind || (NodeKind = {}));
class TypeChecker {
    constructor() {
        this.symbolTable = { symbols: {} };
    }
    // 1. AST 节点遍历测试
    visitNode(node) {
        let count = 1;
        switch (node.kind) {
            case NodeKind.FunctionDeclaration:
                this.checkFunctionDeclaration(node);
                break;
            case NodeKind.VariableDeclaration:
                this.checkVariableDeclaration(node);
                break;
            case NodeKind.CallExpression:
                this.checkCallExpression(node);
                break;
            default:
                break;
        }
        // 递归处理子节点
        for (const child of node.children) {
            count += this.visitNode(child);
        }
        return count;
    }
    checkFunctionDeclaration(node) {
        // 模拟函数声明检查
        for (let i = 0; i < 100; i++) {
            const temp = node.name + i.toString();
        }
    }
    checkVariableDeclaration(node) {
        // 模拟变量声明检查
        for (let i = 0; i < 50; i++) {
            const temp = node.name + i.toString();
        }
    }
    checkCallExpression(node) {
        // 模拟函数调用检查
        for (let i = 0; i < 75; i++) {
            const temp = node.name + i.toString();
        }
    }
    // 2. 符号表查找测试
    resolveSymbol(name) {
        let current = this.symbolTable;
        while (current) {
            if (name in current.symbols) {
                return current.symbols[name];
            }
            current = current.parent;
        }
        return undefined;
    }
    addSymbol(name, type, scope) {
        this.symbolTable.symbols[name] = { name, type, scope };
    }
    // 3. 批量处理测试（模拟单线程）
    processFiles(files) {
        let totalNodes = 0;
        for (const file of files) {
            totalNodes += this.visitNode(file);
        }
        return totalNodes;
    }
}
// 生成测试数据
function generateAST(depth, breadth) {
    const kinds = [
        NodeKind.FunctionDeclaration,
        NodeKind.VariableDeclaration,
        NodeKind.CallExpression,
        NodeKind.BinaryExpression,
        NodeKind.Identifier
    ];
    const node = {
        kind: kinds[Math.floor(Math.random() * kinds.length)],
        name: `node_${Math.random().toString(36).substr(2, 9)}`,
        children: []
    };
    if (depth > 0) {
        for (let i = 0; i < breadth; i++) {
            const child = generateAST(depth - 1, breadth);
            child.parent = node;
            node.children.push(child);
        }
    }
    return node;
}
function generateSymbols(count) {
    const symbols = [];
    for (let i = 0; i < count; i++) {
        symbols.push({
            name: `symbol_${i}`,
            type: i % 2 === 0 ? 'function' : 'variable',
            scope: Math.floor(i / 100)
        });
    }
    return symbols;
}
// 性能测试
function runPerformanceTest() {
    console.log('=== TypeScript 性能测试 ===\n');
    const checker = new TypeChecker();
    // 1. AST 遍历测试
    console.log('1. AST 节点遍历测试');
    const ast = generateAST(6, 4); // 深度6，每层4个子节点
    const astStart = process.hrtime.bigint();
    const nodeCount = checker.visitNode(ast);
    const astEnd = process.hrtime.bigint();
    const astTime = Number(astEnd - astStart) / 1000000; // 转换为毫秒
    console.log(`   处理节点数: ${nodeCount}`);
    console.log(`   耗时: ${astTime.toFixed(2)} ms\n`);
    // 2. 符号表测试
    console.log('2. 符号表查找测试');
    const symbols = generateSymbols(10000);
    // 添加符号到符号表
    for (const symbol of symbols) {
        checker.addSymbol(symbol.name, symbol.type, symbol.scope);
    }
    const symbolStart = process.hrtime.bigint();
    let foundCount = 0;
    for (let i = 0; i < 50000; i++) {
        const symbolName = `symbol_${i % 10000}`;
        if (checker.resolveSymbol(symbolName)) {
            foundCount++;
        }
    }
    const symbolEnd = process.hrtime.bigint();
    const symbolTime = Number(symbolEnd - symbolStart) / 1000000;
    console.log(`   查找次数: 50000`);
    console.log(`   找到符号: ${foundCount}`);
    console.log(`   耗时: ${symbolTime.toFixed(2)} ms\n`);
    // 3. 批量文件处理测试
    console.log('3. 批量文件处理测试（单线程）');
    const files = [];
    for (let i = 0; i < 10; i++) {
        files.push(generateAST(5, 3));
    }
    const batchStart = process.hrtime.bigint();
    const totalNodes = checker.processFiles(files);
    const batchEnd = process.hrtime.bigint();
    const batchTime = Number(batchEnd - batchStart) / 1000000;
    console.log(`   处理文件数: ${files.length}`);
    console.log(`   总节点数: ${totalNodes}`);
    console.log(`   耗时: ${batchTime.toFixed(2)} ms\n`);
    // 4. 内存使用测试
    console.log('4. 内存使用测试');
    const memStart = process.memoryUsage();
    // 创建大量对象
    const objects = [];
    for (let i = 0; i < 100000; i++) {
        objects.push({
            kind: NodeKind.Identifier,
            name: `obj_${i}`,
            children: []
        });
    }
    const memEnd = process.memoryUsage();
    console.log(`   创建对象数: 100000`);
    console.log(`   堆内存增长: ${((memEnd.heapUsed - memStart.heapUsed) / 1024 / 1024).toFixed(2)} MB\n`);
    // 总结
    console.log('=== 总结 ===');
    console.log(`AST 遍历: ${astTime.toFixed(2)} ms`);
    console.log(`符号查找: ${symbolTime.toFixed(2)} ms`);
    console.log(`批量处理: ${batchTime.toFixed(2)} ms`);
    console.log(`内存使用: ${((memEnd.heapUsed - memStart.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
}
// 运行测试
runPerformanceTest();
