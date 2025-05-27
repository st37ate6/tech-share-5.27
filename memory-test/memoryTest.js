var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var MemoryTester = /** @class */ (function () {
    function MemoryTester(count) {
        this.count = count;
        this.people = [];
    }
    MemoryTester.prototype.getMemoryUsage = function () {
        var used = process.memoryUsage();
        return Math.round(used.heapUsed / 1024 / 1024 * 100) / 100; // MB
    };
    MemoryTester.prototype.createPerson = function (id) {
        return {
            id: id,
            name: "Person_".concat(id),
            email: "person".concat(id, "@example.com"),
            age: 20 + (id % 50),
            address: "Address ".concat(id, ", Street ").concat(id % 100, ", City ").concat(id % 10),
            phone: "+1-555-".concat(String(id).padStart(7, '0')),
            company: "Company_".concat(id % 1000),
            position: "Position_".concat(id % 50),
            salary: 30000 + (id % 100000),
            joinDate: new Date(2020 + (id % 4), (id % 12), (id % 28) + 1)
        };
    };
    MemoryTester.prototype.runTest = function () {
        console.log('=== TypeScript 内存测试 ===');
        console.log("\u6D4B\u8BD5\u89C4\u6A21: ".concat(this.count.toLocaleString(), " \u6761\u8BB0\u5F55"));
        console.log();
        var initialMemory = this.getMemoryUsage();
        console.log("\u521D\u59CB\u5185\u5B58\u4F7F\u7528: ".concat(initialMemory, " MB"));
        var startTime = Date.now();
        // 创建大量对象
        console.log('开始创建对象...');
        for (var i = 1; i <= this.count; i++) {
            this.people.push(this.createPerson(i));
            if (i % 100000 === 0) {
                var currentMemory = this.getMemoryUsage();
                console.log("\u5DF2\u521B\u5EFA ".concat(i.toLocaleString(), " \u6761\u8BB0\u5F55\uFF0C\u5F53\u524D\u5185\u5B58: ").concat(currentMemory, " MB"));
            }
        }
        var afterCreationMemory = this.getMemoryUsage();
        var creationTime = Date.now() - startTime;
        console.log();
        console.log('=== 创建阶段结果 ===');
        console.log("\u521B\u5EFA\u65F6\u95F4: ".concat(creationTime, " ms"));
        console.log("\u521B\u5EFA\u540E\u5185\u5B58: ".concat(afterCreationMemory, " MB"));
        console.log("\u5185\u5B58\u589E\u957F: ".concat(afterCreationMemory - initialMemory, " MB"));
        console.log("\u6BCF\u6761\u8BB0\u5F55\u5E73\u5747\u5185\u5B58: ".concat(((afterCreationMemory - initialMemory) * 1024 * 1024 / this.count).toFixed(2), " bytes"));
        // 执行一些操作来测试内存使用
        console.log();
        console.log('执行数据操作...');
        var operationStartTime = Date.now();
        // 查找操作
        var highSalaryPeople = this.people.filter(function (person) { return person.salary > 80000; });
        console.log("\u9AD8\u85AA\u4EBA\u5458\u6570\u91CF: ".concat(highSalaryPeople.length));
        // 排序操作
        var sortedByAge = __spreadArray([], this.people, true).sort(function (a, b) { return a.age - b.age; });
        console.log("\u6309\u5E74\u9F84\u6392\u5E8F\u5B8C\u6210\uFF0C\u6700\u5E74\u8F7B: ".concat(sortedByAge[0].age, "\u5C81\uFF0C\u6700\u5E74\u957F: ").concat(sortedByAge[sortedByAge.length - 1].age, "\u5C81"));
        // 聚合操作
        var totalSalary = this.people.reduce(function (sum, person) { return sum + person.salary; }, 0);
        var avgSalary = totalSalary / this.people.length;
        console.log("\u5E73\u5747\u85AA\u8D44: $".concat(avgSalary.toFixed(2)));
        var operationTime = Date.now() - operationStartTime;
        var finalMemory = this.getMemoryUsage();
        console.log();
        console.log('=== 最终结果 ===');
        console.log("\u64CD\u4F5C\u65F6\u95F4: ".concat(operationTime, " ms"));
        console.log("\u6700\u7EC8\u5185\u5B58: ".concat(finalMemory, " MB"));
        console.log("\u603B\u5185\u5B58\u589E\u957F: ".concat(finalMemory - initialMemory, " MB"));
        console.log("\u603B\u6267\u884C\u65F6\u95F4: ".concat(Date.now() - startTime, " ms"));
        // 强制垃圾回收（如果可用）
        if (global.gc) {
            console.log();
            console.log('执行垃圾回收...');
            global.gc();
            var afterGCMemory = this.getMemoryUsage();
            console.log("\u5783\u573E\u56DE\u6536\u540E\u5185\u5B58: ".concat(afterGCMemory, " MB"));
            console.log("\u56DE\u6536\u7684\u5185\u5B58: ".concat(finalMemory - afterGCMemory, " MB"));
        }
    };
    return MemoryTester;
}());
// 运行测试
var recordCount = 1000000; // 100万条记录
var tester = new MemoryTester(recordCount);
tester.runTest();
