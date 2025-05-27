// TypeScript 大规模性能测试

// 基础类型定义
enum LargeTestNodeKind {
  FunctionDeclaration = 1,
  VariableDeclaration = 2,
  CallExpression = 3,
  BinaryExpression = 4,
  Identifier = 5
}

class LargeTestASTNode {
  kind: LargeTestNodeKind;
  name: string;
  children: LargeTestASTNode[];
  parent: LargeTestASTNode | undefined;

  constructor(kind: LargeTestNodeKind, name: string) {
    this.kind = kind;
    this.name = name;
    this.children = [];
    this.parent = undefined;
  }
}

class TSSymbol {
  name: string;
  type: string;
  scope: number;

  constructor(name: string, type: string, scope: number) {
    this.name = name;
    this.type = type;
    this.scope = scope;
  }
}

// 生成 AST 的函数
function generateAST(depth: number, breadth: number): LargeTestASTNode {
  const kinds: LargeTestNodeKind[] = [
    LargeTestNodeKind.FunctionDeclaration,
    LargeTestNodeKind.VariableDeclaration,
    LargeTestNodeKind.CallExpression,
    LargeTestNodeKind.BinaryExpression,
    LargeTestNodeKind.Identifier,
  ];

  const node = new LargeTestASTNode(
    kinds[Math.floor(Math.random() * kinds.length)],
    `node_${Math.floor(Math.random() * 1000000)}`
  );

  if (depth > 0) {
    for (let i = 0; i < breadth; i++) {
      const child = generateAST(depth - 1, breadth);
      child.parent = node;
      node.children.push(child);
    }
  }

  return node;
}

// 模拟大型项目的数据结构
class LargeProject {
  files: SourceFile[];
  globalSymbols: GlobalSymbolTable;
  dependencies: Map<string, string[]>;

  constructor() {
    this.files = [];
    this.globalSymbols = new GlobalSymbolTable();
    this.dependencies = new Map();
  }
}

class SourceFile {
  path: string;
  content: number[];
  ast: LargeTestASTNode;
  symbols: TSSymbol[];
  size: number;

  constructor(path: string, size: number) {
    this.path = path;
    this.content = new Array(size).fill(0); // 模拟文件内容
    this.ast = generateAST(6, 3); // 减少 AST 深度以提高速度
    this.symbols = [];
    this.size = size;
  }
}

class GlobalSymbolTable {
  private symbols: Map<string, TSSymbol>;
  private types: Map<string, TypeInfo>;

  constructor() {
    this.symbols = new Map();
    this.types = new Map();
  }

  addSymbol(symbol: TSSymbol): void {
    this.symbols.set(symbol.name, symbol);
  }

  getSymbol(name: string): TSSymbol | undefined {
    return this.symbols.get(name);
  }

  addType(typeInfo: TypeInfo): void {
    this.types.set(typeInfo.name, typeInfo);
  }

  getType(name: string): TypeInfo | undefined {
    return this.types.get(name);
  }

  get typesIterator(): IterableIterator<[string, TypeInfo]> {
    return this.types.entries();
  }
}

class TypeInfo {
  name: string;
  properties: Map<string, string>;
  methods: string[];

  constructor(name: string) {
    this.name = name;
    this.properties = new Map();
    this.methods = [];
  }
}

// 创建大型项目模拟
function createLargeProject(fileCount: number): LargeProject {
  process.stdout.write('正在创建项目结构...');
  const project = new LargeProject();

  // 创建大量文件
  for (let i = 0; i < fileCount; i++) {
    // 显示进度
    if (i % 50 === 0 || i === fileCount - 1) {
      const progress = ((i + 1) / fileCount * 100).toFixed(1);
      process.stdout.write(`\r正在创建项目结构... ${progress}% (${i + 1}/${fileCount})`);
    }

    const file = new SourceFile(`src/file_${i}.ts`, 10000); // 10KB 每个文件

    // 填充符号
    for (let j = 0; j < 50; j++) {
      const symbol = new TSSymbol(
        `symbol_${i}_${j}`,
        'function',
        Math.floor(j / 10)
      );
      file.symbols.push(symbol);

      // 添加到全局符号表
      project.globalSymbols.addSymbol(symbol);
    }

    // 添加类型信息
    const typeInfo = new TypeInfo(`Type_${i}`);

    for (let k = 0; k < 10; k++) {
      typeInfo.properties.set(`prop_${k}`, 'string');
      typeInfo.methods.push(`method_${k}`);
    }

    project.globalSymbols.addType(typeInfo);
    project.files.push(file);
  }

  console.log('\n项目创建完成！');
  return project;
}

// 单线程处理
function processProjectSingleThread(project: LargeProject): number {
  const start = process.hrtime.bigint();
  const total = project.files.length;

  for (let i = 0; i < project.files.length; i++) {
    if (i % 20 === 0 || i === total - 1) {
      const progress = ((i + 1) / total * 100).toFixed(1);
      process.stdout.write(`\r  单线程处理进度: ${progress}% (${i + 1}/${total})`);
    }
    processFile(project.files[i], project.globalSymbols);
  }
  console.log('');

  const end = process.hrtime.bigint();
  return Number(end - start) / 1000000; // 转换为毫秒
}

// 模拟并发处理（TypeScript 单线程，使用 Promise 模拟）
async function processProjectConcurrent(project: LargeProject): Promise<number> {
  const start = process.hrtime.bigint();
  const total = project.files.length;
  let processed = 0;

  // 启动进度监控
  const progressInterval = setInterval(() => {
    const progress = (processed / total * 100).toFixed(1);
    process.stdout.write(`\r  模拟并发处理进度: ${progress}% (${processed}/${total})`);
  }, 100);

  // 分批处理文件（模拟并发）
  const batchSize = Math.max(1, Math.floor(total / 10));
  const batches: SourceFile[][] = [];

  for (let i = 0; i < project.files.length; i += batchSize) {
    const batch = project.files.slice(i, i + batchSize);
    batches.push(batch);
  }

  // 处理每个批次
  for (const batch of batches) {
    const promises = batch.map((file: SourceFile) => {
      return new Promise<void>(resolve => {
        // 使用 setImmediate 模拟异步处理
        setImmediate(() => {
          processFile(file, project.globalSymbols);
          processed++;
          resolve();
        });
      });
    });

    await Promise.all(promises);
  }

  clearInterval(progressInterval);
  console.log('');

  const end = process.hrtime.bigint();
  return Number(end - start) / 1000000; // 转换为毫秒
}

// 高并发处理（使用 Worker Threads 模拟，这里简化为更小的批次）
async function processProjectHighConcurrency(project: LargeProject): Promise<number> {
  const start = process.hrtime.bigint();
  const total = project.files.length;
  let processed = 0;

  // 启动进度监控
  const progressInterval = setInterval(() => {
    const progress = (processed / total * 100).toFixed(1);
    process.stdout.write(`\r  高并发模拟处理进度: ${progress}% (${processed}/${total})`);
  }, 100);

  // 更小的批次，模拟更高的并发
  const batchSize = Math.max(1, Math.floor(total / 20));
  const batches: SourceFile[][] = [];

  for (let i = 0; i < project.files.length; i += batchSize) {
    const batch = project.files.slice(i, i + batchSize);
    batches.push(batch);
  }

  // 处理每个批次
  for (const batch of batches) {
    const promises = batch.map((file: SourceFile) => {
      return new Promise<void>(resolve => {
        setImmediate(() => {
          // 更复杂的处理
          processFileWithDependencies(file, project.globalSymbols, project.dependencies);
          processed++;
          resolve();
        });
      });
    });

    await Promise.all(promises);
  }

  clearInterval(progressInterval);
  console.log('');

  const end = process.hrtime.bigint();
  return Number(end - start) / 1000000; // 转换为毫秒
}

// 模拟文件处理
function processFile(file: SourceFile, globalSymbols: GlobalSymbolTable): void {
  // 模拟 AST 遍历
  const nodeCount = visitNodeComplex(file.ast);

  // 模拟符号解析
  for (const symbol of file.symbols) {
    resolveSymbolWithGlobal(symbol.name, globalSymbols);
  }

  // 模拟类型检查
  for (let i = 0; i < Math.floor(nodeCount / 10); i++) {
    performTypeCheck(globalSymbols);
  }
}

// 带依赖关系的文件处理
function processFileWithDependencies(
  file: SourceFile, 
  globalSymbols: GlobalSymbolTable, 
  dependencies: Map<string, string[]>
): void {
  // 基本处理
  processFile(file, globalSymbols);

  // 处理依赖关系
  if (dependencies.has(file.path)) {
    const deps = dependencies.get(file.path)!;
    for (const dep of deps) {
      // 模拟依赖解析
      resolveSymbolWithGlobal(dep, globalSymbols);
    }
  }

  // 模拟增量编译检查
  checkIncrementalChanges(file, globalSymbols);
}

// 复杂的 AST 遍历
function visitNodeComplex(node: LargeTestASTNode | undefined): number {
  if (!node) {
    return 0;
  }

  let count = 1;

  // 减少模拟操作以提高速度
  for (let i = 0; i < 50; i++) {
    const temp = `op_${node.name}_${i}`;
  }

  // 递归处理子节点
  for (const child of node.children) {
    count += visitNodeComplex(child);
  }

  return count;
}

// 全局符号解析
function resolveSymbolWithGlobal(name: string, globalSymbols: GlobalSymbolTable): TSSymbol | undefined {
  return globalSymbols.getSymbol(name);
}

// 类型检查
function performTypeCheck(globalSymbols: GlobalSymbolTable): void {
  // 简化类型推导
  let count = 0;
  for (const [, typeInfo] of globalSymbols.typesIterator) {
    for (const [,] of typeInfo.properties) {
      count++;
      if (count > 5) { // 限制处理数量
        return;
      }
    }
  }
}

// 增量编译检查
function checkIncrementalChanges(file: SourceFile, globalSymbols: GlobalSymbolTable): void {
  // 简化增量编译逻辑
  for (let i = 0; i < 10; i++) {
    const symbolName = `inc_${i}`;
    resolveSymbolWithGlobal(symbolName, globalSymbols);
  }
}

// 内存使用统计
interface MemStats {
  heapUsed: number;
  heapTotal: number;
}

function getMemStats(): MemStats {
  const memUsage = process.memoryUsage();
  return {
    heapUsed: memUsage.heapUsed / 1024 / 1024,
    heapTotal: memUsage.heapTotal / 1024 / 1024
  };
}

// 主函数
async function main(): Promise<void> {
  console.log('=== 大规模 TypeScript 测试 ===\n');

  // 调整测试规模，使其更合理
  const fileCounts: number[] = [50, 200, 500];

  for (const fileCount of fileCounts) {
    console.log(`测试项目规模: ${fileCount} 个文件`);
    console.log('----------------------------------------');

    // 创建项目
    const project = createLargeProject(fileCount);

    const memBefore = getMemStats();

    // 单线程测试
    console.log('单线程处理...');
    const singleTime = processProjectSingleThread(project);

    // 模拟并发测试
    console.log('模拟并发处理...');
    const concurrentTime = await processProjectConcurrent(project);

    // 高并发测试
    console.log('高并发模拟处理...');
    const highConcurrentTime = await processProjectHighConcurrency(project);

    const memAfter = getMemStats();

    // 结果
    console.log('\n结果:');
    console.log(`  单线程耗时: ${singleTime.toFixed(2)} ms`);
    console.log(`  模拟并发耗时: ${concurrentTime.toFixed(2)} ms`);
    console.log(`  高并发模拟耗时: ${highConcurrentTime.toFixed(2)} ms`);
    console.log(`  模拟并发提升: ${(singleTime / concurrentTime).toFixed(2)}x`);
    console.log(`  高并发模拟提升: ${(singleTime / highConcurrentTime).toFixed(2)}x`);
    console.log(`  内存使用: ${(memAfter.heapUsed - memBefore.heapUsed).toFixed(2)} MB`);
    console.log(`  CPU 核心数: ${require('os').cpus().length}\n`);
  }
}

// 运行测试
main().catch(console.error); 