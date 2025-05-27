// JavaScript 值類型結構體測試

// 定義一個"結構體"（實際上是對象）
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// 測試函數：驗證對象引用特性
function testObjectReference() {
    console.log('=== JavaScript 對象引用測試 ===');
    
    // 創建一個"結構體"實例
    const point1 = new Point(1, 2);
    
    // 賦值給另一個變量（創建引用）
    const point2 = point1;
    
    // 修改 point2
    point2.x = 10;
    
    // 檢查 point1 是否也被修改
    console.log('修改 point2 後：');
    console.log('point1:', point1); // 會被修改，因為是引用
    console.log('point2:', point2);
    console.log('point1 === point2:', point1 === point2); // true，同一個對象
}

// 測試函數：嘗試模擬值類型行為
function testValueTypeCopy() {
    console.log('\n=== JavaScript 值類型複製模擬測試 ===');
    
    // 創建一個"結構體"實例
    const point1 = new Point(1, 2);
    
    // 通過複製屬性創建新對象
    const point2 = new Point(point1.x, point1.y);
    
    // 修改 point2
    point2.x = 10;
    
    // 檢查 point1 是否被修改
    console.log('修改 point2 後：');
    console.log('point1:', point1); // 不會被修改，因為是獨立對象
    console.log('point2:', point2);
    console.log('point1 === point2:', point1 === point2); // false，不同對象
}

// 測試函數：數組中的對象引用
function testArrayOfObjects() {
    console.log('\n=== JavaScript 數組中的對象引用測試 ===');
    
    // 創建包含多個點的數組
    const points = [
        new Point(1, 1),
        new Point(2, 2),
        new Point(3, 3)
    ];
    
    // 獲取第一個點的引用
    const firstPoint = points[0];
    
    // 修改引用的點
    firstPoint.x = 10;
    
    // 檢查數組中的原始對象是否被修改
    console.log('修改 firstPoint 後：');
    console.log('數組中的第一個點：', points[0]); // 會被修改
    console.log('firstPoint：', firstPoint);
}

// 運行所有測試
testObjectReference();
testValueTypeCopy();
testArrayOfObjects(); 