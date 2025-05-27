function sum(a, b) {
  return a + b;
}

console.log(sum(1, '2'));     // "12" —— 隱式類型轉換，邏輯錯誤
console.log(sum(1));          // NaN —— b 是 undefined
console.log(sum(true, {}));   // "[object Object]true" —— 崩潰邏輯

// 正確的使用方式
console.log(sum(1, 2));       // 3 —— 符合預期 