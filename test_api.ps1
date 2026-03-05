# 测试项目管理 API

Write-Host "=== 测试项目管理 API ===" -ForegroundColor Green

# 1. 创建测试项目
Write-Host "`n1. 创建测试项目..." -ForegroundColor Yellow
$createData = @{
    name = "测试项目"
    type = "table"
    link_type = "url"
    link = "https://www.baidu.com"
    description = "这是一个测试项目"
    sort_order = 1
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:23370/api/projects" `
    -Method POST `
    -ContentType "application/json" `
    -Body $createData

Write-Host "创建成功! 项目ID: $($response.data.id)" -ForegroundColor Green
$projectId = $response.data.id

# 2. 获取项目列表
Write-Host "`n2. 获取项目列表..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:23370/api/projects?type=all"
Write-Host "项目总数: $($response.data.total)" -ForegroundColor Green
Write-Host "项目列表: $($response.data.list | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan

# 3. 获取项目详情
Write-Host "`n3. 获取项目详情..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:23370/api/projects/$projectId"
Write-Host "项目名称: $($response.data.name)" -ForegroundColor Green
Write-Host "项目类型: $($response.data.type)" -ForegroundColor Green

# 4. 更新项目
Write-Host "`n4. 更新项目..." -ForegroundColor Yellow
$updateData = @{
    name = "测试项目(已更新)"
    type = "table"
    link_type = "url"
    link = "https://www.google.com"
    description = "这是一个更新后的测试项目"
    sort_order = 1
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:23370/api/projects/$projectId" `
    -Method PUT `
    -ContentType "application/json" `
    -Body $updateData

Write-Host "更新成功! 新名称: $($response.data.name)" -ForegroundColor Green

# 5. 搜索项目
Write-Host "`n5. 搜索项目..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:23370/api/projects/search?keyword=测试"
Write-Host "搜索结果数: $($response.data.total)" -ForegroundColor Green

# 6. 删除项目
Write-Host "`n6. 删除项目..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:23370/api/projects/$projectId" `
    -Method DELETE

Write-Host "删除成功!" -ForegroundColor Green

# 7. 验证删除
Write-Host "`n7. 验证删除..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:23370/api/projects?type=all"
Write-Host "剩余项目数: $($response.data.total)" -ForegroundColor Green

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green
