// Package core 提供应用程序的核心初始化和服务功能
package core

import (
	"go_wails_project_manager/api"
	"go_wails_project_manager/config"
	"go_wails_project_manager/database"
	"go_wails_project_manager/logger"
	"go_wails_project_manager/server"
	"go_wails_project_manager/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// AppCore 应用程序核心结构
type AppCore struct {
	Server          *server.Server
	Log             *logrus.Logger
	BackupScheduler *services.BackupScheduler
	IsRunning       bool
}

// NewAppCore 创建新的应用核心实例
func NewAppCore() (*AppCore, error) {
	// 初始化配置
	if err := config.LoadConfig(); err != nil {
		return nil, err
	}

	// 初始化日志
	logger.Init()
	log := logger.GetLogger()

	return &AppCore{
		Log: log,
	}, nil
}

// InitDatabases 初始化数据库连接和迁移表结构
func (a *AppCore) InitDatabases() error {
	// 初始化主数据库
	a.Log.Info("正在初始化数据库...")
	if err := database.Init(); err != nil {
		a.Log.Errorf("数据库初始化失败: %v", err)
		return err
	}
	a.Log.Info("数据库初始化成功")

	// 数据库迁移已在database.Init()中处理
	a.Log.Info("数据库迁移完成")

	// 初始化备份服务
	if err := a.InitBackupService(); err != nil {
		a.Log.Errorf("备份服务初始化失败: %v", err)
		return err
	}

	// 初始化文件服务
	if err := a.InitFileServices(); err != nil {
		a.Log.Errorf("文件服务初始化失败: %v", err)
		return err
	}

	return nil
}

// InitBackupService 初始化备份服务
func (a *AppCore) InitBackupService() error {
	a.Log.Info("正在初始化备份服务...")

	// 加载备份配置
	backupConfig, cosConfig := config.LoadBackupConfig()

	// 获取数据库连接
	db, err := database.GetDB()
	if err != nil {
		return err
	}

	// 创建备份调度器
	a.BackupScheduler = services.NewBackupScheduler(backupConfig, cosConfig, db)

	// 设置全局备份调度器
	services.SetGlobalBackupScheduler(a.BackupScheduler)

	// 启动备份调度器
	if err := a.BackupScheduler.Start(); err != nil {
		return err
	}

	a.Log.Info("备份服务初始化成功")
	return nil
}

// InitFileServices 初始化文件服务
func (a *AppCore) InitFileServices() error {
	a.Log.Info("正在初始化文件服务...")

	if err := services.InitFileServices(); err != nil {
		return err
	}

	a.Log.Info("文件服务初始化成功")
	return nil
}

// StartServer 启动HTTP服务器
func (a *AppCore) StartServer() error {
	// 创建并启动 Gin 服务器
	a.Log.Info("正在初始化 HTTP 服务器...")
	a.Server = server.NewServer(config.AppConfig.ServerPort)

	// 添加自定义路由
	a.Server.AddRoutes(func(router *gin.Engine) {
		// 注册所有 API 路由
		api.RegisterRoutes(router, a.Log)
	})

	err := a.Server.Start()
	if err != nil {
		a.Log.Errorf("无法启动 HTTP 服务器: %v", err)
		return err
	}

	a.IsRunning = true
	a.Log.Infof("HTTP 服务器已启动在端口 %d", config.AppConfig.ServerPort)
	a.Log.Infof("API文档可通过 %s:%d/api/docs 访问", config.GetAPIDocsBaseURL(), config.AppConfig.ServerPort)

	return nil
}

// StopServer 停止HTTP服务器
func (a *AppCore) StopServer() error {
	if a.IsRunning && a.Server != nil {
		a.Log.Info("正在关闭 HTTP 服务器...")
		if err := a.Server.Stop(); err != nil {
			a.Log.Errorf("关闭 HTTP 服务器时出错: %v", err)
			return err
		}
		a.IsRunning = false
	}

	return nil
}

// GetServerStatus 获取服务器状态
func (a *AppCore) GetServerStatus() map[string]interface{} {
	return map[string]interface{}{
		"running": a.IsRunning,
		"port":    config.AppConfig.ServerPort,
	}
}

// Shutdown 执行优雅停机
func (a *AppCore) Shutdown() {
	a.Log.Info("🔄 开始优雅停机...")

	// 1. 停止备份调度器
	if a.BackupScheduler != nil {
		a.Log.Info("⏳ 正在停止备份调度器...")
		a.BackupScheduler.Stop()
		a.Log.Info("✅ 备份调度器已停止")
	}

	// 2. 停止 HTTP 服务器
	if err := a.StopServer(); err != nil {
		a.Log.Errorf("❌ 停止服务器失败: %v", err)
	} else {
		a.Log.Info("✅ HTTP服务器已停止")
	}

	// 3. 关闭数据库连接
	a.Log.Info("⏳ 正在关闭数据库连接...")
	if err := database.Close(); err != nil {
		a.Log.Errorf("❌ 关闭数据库失败: %v", err)
	} else {
		a.Log.Info("✅ 数据库连接已关闭")
	}

	// 4. 关闭文件服务
	a.Log.Info("⏳ 正在关闭文件服务...")
	if err := services.CloseFileServices(); err != nil {
		a.Log.Errorf("❌ 关闭文件服务失败: %v", err)
	} else {
		a.Log.Info("✅ 文件服务已关闭")
	}

	a.Log.Info("👋 优雅停机完成")
}
