function sum(a, b) {
    return a + b;
}
sum(1, '2'); // ❌ 編譯錯誤：Argument of type 'string' is not assignable to parameter of type 'number'
sum(1);          // ❌ 編譯錯誤：Expected 2 arguments, but got 1
sum(true, {});   // ❌ 編譯錯誤：Argument of type 'boolean' is not assignable to parameter of type 'number'
// 正確的使用方式
console.log(sum(1, 2), sum(1), sum(true, {})); // ✅ 輸出：3 
