interface Person {
    id: number;
    name: string;
    email: string;
    age: number;
    address: string;
    phone: string;
    company: string;
    position: string;
    salary: number;
    joinDate: Date;
}

class MemoryTester {
    private people: Person[] = [];
    
    constructor(private count: number) {}
    
    private getMemoryUsage(): number {
        const used = process.memoryUsage();
        return Math.round(used.heapUsed / 1024 / 1024 * 100) / 100; // MB
    }
    
    private createPerson(id: number): Person {
        return {
            id: id,
            name: `Person_${id}`,
            email: `person${id}@example.com`,
            age: 20 + (id % 50),
            address: `Address ${id}, Street ${id % 100}, City ${id % 10}`,
            phone: `+1-555-${String(id).padStart(7, '0')}`,
            company: `Company_${id % 1000}`,
            position: `Position_${id % 50}`,
            salary: 30000 + (id % 100000),
            joinDate: new Date(2020 + (id % 4), (id % 12), (id % 28) + 1)
        };
    }
    
    public runTest(): void {
        console.log('=== TypeScript 内存测试 ===');
        console.log(`测试规模: ${this.count.toLocaleString()} 条记录`);
        console.log();
        
        const initialMemory = this.getMemoryUsage();
        console.log(`初始内存使用: ${initialMemory} MB`);
        
        const startTime = Date.now();
        
        // 创建大量对象
        console.log('开始创建对象...');
        for (let i = 1; i <= this.count; i++) {
            this.people.push(this.createPerson(i));
            
            if (i % 100000 === 0) {
                const currentMemory = this.getMemoryUsage();
                console.log(`已创建 ${i.toLocaleString()} 条记录，当前内存: ${currentMemory} MB`);
            }
        }
        
        const afterCreationMemory = this.getMemoryUsage();
        const creationTime = Date.now() - startTime;
        
        console.log();
        console.log('=== 创建阶段结果 ===');
        console.log(`创建时间: ${creationTime} ms`);
        console.log(`创建后内存: ${afterCreationMemory} MB`);
        console.log(`内存增长: ${afterCreationMemory - initialMemory} MB`);
        console.log(`每条记录平均内存: ${((afterCreationMemory - initialMemory) * 1024 * 1024 / this.count).toFixed(2)} bytes`);
        
        // 执行一些操作来测试内存使用
        console.log();
        console.log('执行数据操作...');
        const operationStartTime = Date.now();
        
        // 查找操作
        const highSalaryPeople = this.people.filter((person: Person) => person.salary > 80000);
        console.log(`高薪人员数量: ${highSalaryPeople.length}`);
        
        // 排序操作
        const sortedByAge = [...this.people].sort((a: Person, b: Person) => a.age - b.age);
        console.log(`按年龄排序完成，最年轻: ${sortedByAge[0].age}岁，最年长: ${sortedByAge[sortedByAge.length-1].age}岁`);
        
        // 聚合操作
        const totalSalary = this.people.reduce((sum: number, person: Person) => sum + person.salary, 0);
        const avgSalary = totalSalary / this.people.length;
        console.log(`平均薪资: $${avgSalary.toFixed(2)}`);
        
        const operationTime = Date.now() - operationStartTime;
        const finalMemory = this.getMemoryUsage();
        
        console.log();
        console.log('=== 最终结果 ===');
        console.log(`操作时间: ${operationTime} ms`);
        console.log(`最终内存: ${finalMemory} MB`);
        console.log(`总内存增长: ${finalMemory - initialMemory} MB`);
        console.log(`总执行时间: ${Date.now() - startTime} ms`);
        
        // 强制垃圾回收（如果可用）
        if (global.gc) {
            console.log();
            console.log('执行垃圾回收...');
            global.gc();
            const afterGCMemory = this.getMemoryUsage();
            console.log(`垃圾回收后内存: ${afterGCMemory} MB`);
            console.log(`回收的内存: ${finalMemory - afterGCMemory} MB`);
        }
    }
}

// 运行测试
const recordCount = 1000000; // 100万条记录
const tester = new MemoryTester(recordCount);
tester.runTest(); 