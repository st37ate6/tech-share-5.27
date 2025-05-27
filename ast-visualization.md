# AST（抽象语法树）可视化示例

## 简单表达式的 AST

### 源代码：`2 + 3 * 4`

**数学优先级**：乘法优先于加法，所以实际计算顺序是 `2 + (3 * 4)`

**AST 结构**：

```
        BinaryExpression (+)
       /                    \
      /                      \
   Literal(2)         BinaryExpression (*)
                     /                    \
                    /                      \
                Literal(3)              Literal(4)
```

**详细的 AST 节点**：

```json
{
  "type": "BinaryExpression",
  "operator": "+",
  "left": {
    "type": "Literal",
    "value": 2
  },
  "right": {
    "type": "BinaryExpression", 
    "operator": "*",
    "left": {
      "type": "Literal",
      "value": 3
    },
    "right": {
      "type": "Literal", 
      "value": 4
    }
  }
}
```

## 函数声明的 AST

### TypeScript 源代码：

```typescript
function add(a: number, b: number): number {
    return a + b;
}
```

### 完整的 AST 可视化：

```
                    FunctionDeclaration
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   Identifier         ParameterList      ReturnType
    "add"                  │             "number"
                           │
                    ┌──────┼──────┐
                    │             │
               Parameter     Parameter
                    │             │
            ┌───────┼───────┐     │
            │               │     │
       Identifier    TypeAnnotation │
        "a"          "number"       │
                                    │
                            ┌───────┼───────┐
                            │               │
                       Identifier    TypeAnnotation
                        "b"          "number"
                                            │
                                            │
                                    BlockStatement
                                            │
                                    ReturnStatement
                                            │
                                   BinaryExpression
                                            │
                                    ┌───────┼───────┐
                                    │       │       │
                               Identifier "+" Identifier
                                "a"           "b"
```

## 复杂代码的 AST

### 源代码：

```typescript
class Calculator {
    private result: number = 0;
  
    add(value: number): Calculator {
        this.result += value;
        return this;
    }
}
```

### AST 结构（简化）：

```
                        ClassDeclaration
                              │
                    ┌─────────┼─────────┐
                    │         │         │
               Identifier     │    ClassBody
              "Calculator"    │         │
                              │         │
                              │    ┌────┼────┐
                              │    │         │
                              │ PropertyDeclaration MethodDefinition
                              │    │         │
                              │    │    ┌────┼────┐
                              │    │    │         │
                              │    │ Identifier  │
                              │    │ "result"    │
                              │    │             │
                              │ TypeAnnotation   │
                              │  "number"        │
                              │                  │
                              │            FunctionExpression
                              │                  │
                              │            ┌─────┼─────┐
                              │            │           │
                              │       ParameterList BlockStatement
                              │            │           │
                              │       Parameter       │
                              │            │           │
                              │    ┌───────┼───────┐   │
                              │    │               │   │
                              │ Identifier  TypeAnnotation │
                              │  "value"     "number"      │
                              │                            │
                              │                    ┌───────┼───────┐
                              │                    │               │
                              │            ExpressionStatement ReturnStatement
                              │                    │               │
                              │            AssignmentExpression    │
                              │                    │               │
                              │            ┌───────┼───────┐       │
                              │            │               │       │
                              │    MemberExpression BinaryExpression │
                              │            │               │       │
                              │    ┌───────┼───────┐       │   ThisExpression
                              │    │               │       │
                              │ ThisExpression Identifier  │
                              │                "result"    │
                              │                            │
                              │                    ┌───────┼───────┐
                              │                    │       │       │
                              │            MemberExpression "+=" Identifier
                              │                    │               "value"
                              │            ┌───────┼───────┐
                              │            │               │
                              │    ThisExpression   Identifier
                              │                    "result"
```

## AST 在不同编译阶段的变化

### 原始 TypeScript AST

```typescript
// 源代码
let x: number = 5;
```

```
VariableDeclaration
├── kind: "let"
├── declarations: [
│   VariableDeclarator
│   ├── id: Identifier("x")
│   ├── typeAnnotation: TypeAnnotation("number")
│   └── init: Literal(5)
│ ]
```

### 类型检查后的 AST（添加类型信息）

```
VariableDeclaration
├── kind: "let"
├── declarations: [
│   VariableDeclarator
│   ├── id: Identifier("x")
│   │   └── resolvedType: NumberType
│   ├── typeAnnotation: TypeAnnotation("number")
│   │   └── resolvedType: NumberType
│   └── init: Literal(5)
│       └── resolvedType: NumberLiteralType(5)
│ ]
```

### 转换为 JavaScript AST（移除类型信息）

```
VariableDeclaration
├── kind: "let"
├── declarations: [
│   VariableDeclarator
│   ├── id: Identifier("x")
│   └── init: Literal(5)
│ ]
```

## AST 遍历模式

### 深度优先遍历（DFS）

```typescript
function visitNode(node: ASTNode): void {
    // 1. 处理当前节点
    console.log(`访问节点: ${node.type}`);
  
    // 2. 递归访问子节点
    for (const child of node.children) {
        visitNode(child);
    }
  
    // 3. 后处理（可选）
    console.log(`完成节点: ${node.type}`);
}
```

**遍历顺序示例**（对于 `2 + 3 * 4`）：

```
1. 访问节点: BinaryExpression (+)
2. 访问节点: Literal (2)
3. 完成节点: Literal (2)
4. 访问节点: BinaryExpression (*)
5. 访问节点: Literal (3)
6. 完成节点: Literal (3)
7. 访问节点: Literal (4)
8. 完成节点: Literal (4)
9. 完成节点: BinaryExpression (*)
10. 完成节点: BinaryExpression (+)
```

### 广度优先遍历（BFS）

```typescript
function visitNodesBFS(root: ASTNode): void {
    const queue = [root];
  
    while (queue.length > 0) {
        const node = queue.shift()!;
        console.log(`访问节点: ${node.type}`);
    
        // 将子节点加入队列
        queue.push(...node.children);
    }
}
```

**遍历顺序示例**（对于 `2 + 3 * 4`）：

```
1. 访问节点: BinaryExpression (+)
2. 访问节点: Literal (2)
3. 访问节点: BinaryExpression (*)
4. 访问节点: Literal (3)
5. 访问节点: Literal (4)
```

## AST 优化示例

### 常量折叠优化

**优化前的 AST**：

```
BinaryExpression (+)
├── Literal(2)
└── BinaryExpression (*)
    ├── Literal(3)
    └── Literal(4)
```

**优化后的 AST**：

```
Literal(14)  // 2 + (3 * 4) = 14
```

### 死代码消除

**优化前**：

```typescript
function test() {
    const x = 5;
    if (false) {
        console.log("never executed");
    }
    return x;
}
```

**优化前的 AST**：

```
FunctionDeclaration
└── BlockStatement
    ├── VariableDeclaration (x = 5)
    ├── IfStatement
    │   ├── condition: Literal(false)
    │   └── consequent: BlockStatement
    │       └── ExpressionStatement
    │           └── CallExpression (console.log)
    └── ReturnStatement
        └── Identifier(x)
```

**优化后的 AST**：

```
FunctionDeclaration
└── BlockStatement
    ├── VariableDeclaration (x = 5)
    └── ReturnStatement
        └── Identifier(x)
```

## TypeScript vs Go AST 对比

### 相同的逻辑：变量声明和赋值

**TypeScript**：

```typescript
const result: number = calculate(a, b);
```

**Go**：

```go
result := calculate(a, b)
```

### TypeScript AST：

```json
{
  "type": "VariableDeclaration",
  "kind": "const",
  "declarations": [{
    "type": "VariableDeclarator",
    "id": {
      "type": "Identifier", 
      "name": "result",
      "typeAnnotation": {
        "type": "TypeAnnotation",
        "typeAnnotation": {
          "type": "NumberTypeAnnotation"
        }
      }
    },
    "init": {
      "type": "CallExpression",
      "callee": {"type": "Identifier", "name": "calculate"},
      "arguments": [
        {"type": "Identifier", "name": "a"},
        {"type": "Identifier", "name": "b"}
      ]
    }
  }]
}
```

### Go AST：

```go
&ast.AssignStmt{
    Lhs: []ast.Expr{
        &ast.Ident{Name: "result"}
    },
    Tok: token.DEFINE, // :=
    Rhs: []ast.Expr{
        &ast.CallExpr{
            Fun: &ast.Ident{Name: "calculate"},
            Args: []ast.Expr{
                &ast.Ident{Name: "a"},
                &ast.Ident{Name: "b"},
            },
        },
    },
}
```

### 关键差异：

1. **类型信息**：

   - TypeScript：显式类型注解在 AST 中
   - Go：类型推断，AST 中不包含显式类型
2. **内存布局**：

   - TypeScript：JavaScript 对象，引用类型
   - Go：结构体，值类型和指针混合
3. **处理效率**：

   - TypeScript：动态属性访问
   - Go：编译时确定的结构体字段访问

## 总结

AST 是编译器的核心数据结构，它：

1. **抽象了语法细节**，保留了程序的逻辑结构
2. **支持各种分析和优化**，是编译器功能的基础
3. **在不同语言中有不同的设计**，影响编译器性能
4. **是现代开发工具的基础**，支持代码分析、重构、格式化等功能
