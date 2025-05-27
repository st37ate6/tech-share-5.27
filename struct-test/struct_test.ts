// TypeScript 值類型結構體測試

// 定義一個結構體（使用 TypeScript 的類型系統）
class Point {
    constructor(
        public x: number,
        public y: number
    ) {}

    // 添加一個複製方法來模擬值類型行為
    clone(): Point {
        return new Point(this.x, this.y);
    }
}

// 定義一個不可變的結構體
interface ImmutablePoint {
    readonly x: number;
    readonly y: number;
}

// 測試函數：驗證對象引用特性
function testObjectReference(): void {
    console.log('=== TypeScript 對象引用測試 ===');
    
    // 創建一個結構體實例
    const point1 = new Point(1, 2);
    
    // 賦值給另一個變量（仍然是引用）
    const point2: Point = point1;
    
    // 修改 point2
    point2.x = 10;
    
    // 檢查 point1 是否也被修改
    console.log('修改 point2 後：');
    console.log('point1:', point1); // 會被修改，因為是引用
    console.log('point2:', point2);
    console.log('point1 === point2:', point1 === point2); // true，同一個對象
}

// 測試函數：使用 readonly 和 clone
function testImmutableAndClone(): void {
    console.log('\n=== TypeScript 不可變和克隆測試 ===');
    
    // 創建一個結構體實例
    const point1 = new Point(1, 2);
    
    // 使用 clone 方法創建副本
    const point2 = point1.clone();
    
    // 修改 point2
    point2.x = 10;
    
    // 創建不可變對象
    const immutablePoint: ImmutablePoint = {
        x: 1,
        y: 2
    };
    
    // 以下代碼會導致編譯錯誤
    // immutablePoint.x = 10; // Error: Cannot assign to 'x' because it is a read-only property
    
    console.log('修改 point2 後：');
    console.log('point1:', point1); // 不會被修改，因為使用了 clone
    console.log('point2:', point2);
    console.log('point1 === point2:', point1 === point2); // false，不同對象
    console.log('immutablePoint:', immutablePoint);
}

// 測試函數：泛型數組中的對象引用
function testGenericArray(): void {
    console.log('\n=== TypeScript 泛型數組測試 ===');
    
    // 創建類型安全的數組
    const points: Array<Point> = [
        new Point(1, 1),
        new Point(2, 2),
        new Point(3, 3)
    ];
    
    // 獲取第一個點的引用
    const firstPoint = points[0];
    
    // 創建第一個點的副本
    const firstPointCopy = points[0].clone();
    
    // 修改引用和副本
    firstPoint.x = 10;
    firstPointCopy.x = 20;
    
    console.log('修改後：');
    console.log('數組中的第一個點：', points[0]); // 會被修改
    console.log('firstPoint：', firstPoint);
    console.log('firstPointCopy：', firstPointCopy); // 獨立的副本
}

// 測試函數：使用 TypeScript 的高級類型特性
function testAdvancedTypes(): void {
    console.log('\n=== TypeScript 高級類型特性測試 ===');
    
    // 使用類型交集
    type NamedPoint = Point & { name: string };
    
    // 創建一個具名點
    const namedPoint: NamedPoint = Object.assign(new Point(1, 2), { name: 'A' });
    
    // 使用類型聯合
    type PointOrNull = Point | null;
    
    // 空值處理
    const maybePoint: PointOrNull = Math.random() > 0.5 ? new Point(1, 2) : null;
    
    console.log('具名點：', namedPoint);
    console.log('可能為空的點：', maybePoint);
}

// 運行所有測試
testObjectReference();
testImmutableAndClone();
testGenericArray();
testAdvancedTypes(); 