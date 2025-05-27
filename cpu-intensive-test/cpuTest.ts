function isPrime(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  
  // 优化：排除偶数（除了2）
  if (n % 2 === 0) return false;
  
  // 只需要检查到平方根
  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
      if (n % i === 0) return false;
  }
  return true;
}

function findPrimesInRange(start: number, end: number): number[] {
  const primes: number[] = [];
  for (let i = start; i <= end; i++) {
      if (isPrime(i)) {
          primes.push(i);
      }
  }
  return primes;
}

function runTest() {
  console.time('TypeScript CPU Test');
  
  const RANGE_START = 1;
  const RANGE_END = 50000000;  // 一百万
  
  const primes = findPrimesInRange(RANGE_START, RANGE_END);
  console.log(`Found ${primes.length} prime numbers`);
  console.log(`First 5 primes: ${primes.slice(0, 5).join(', ')}`);
  console.log(`Last 5 primes: ${primes.slice(-5).join(', ')}`);
  
  console.timeEnd('TypeScript CPU Test');
}

// 运行测试
runTest(); 