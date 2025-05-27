package main

import "fmt"

// 定義一個結構體
type Point struct {
    X int
    Y int
}

func main() {
    fmt.Println("=== Go 值類型結構體測試 ===")
    
    // 測試值類型賦值
    point1 := Point{X: 1, Y: 2}
    point2 := point1 // 創建副本，而不是引用
    
    // 修改 point2
    point2.X = 10
    
    fmt.Println("\n修改 point2 後：")
    fmt.Printf("point1: %+v\n", point1) // 不會被修改
    fmt.Printf("point2: %+v\n", point2)
    
    // 測試指針引用
    fmt.Println("\n=== Go 指針引用測試 ===")
    
    point3 := &Point{X: 1, Y: 2}
    point4 := point3 // 共享同一個指針
    
    point4.X = 10
    
    fmt.Println("\n修改 point4 後：")
    fmt.Printf("point3: %+v\n", *point3) // 會被修改
    fmt.Printf("point4: %+v\n", *point4)
    
    // 測試數組中的結構體
    fmt.Println("\n=== Go 數組中的結構體測試 ===")
    
    points := []Point{
        {X: 1, Y: 1},
        {X: 2, Y: 2},
        {X: 3, Y: 3},
    }
    
    firstPoint := points[0] // 創建副本
    firstPoint.X = 10
    
    fmt.Println("\n修改 firstPoint 後：")
    fmt.Printf("數組中的第一個點：%+v\n", points[0]) // 不會被修改
    fmt.Printf("firstPoint：%+v\n", firstPoint)
} 