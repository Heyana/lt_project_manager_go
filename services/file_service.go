package services

import (
	"fmt"
	"go_wails_project_manager/database"
	"go_wails_project_manager/logger"
	"go_wails_project_manager/utils"
	"os"
	"path/filepath"

	filelibrary "github.com/heyango/file-library"
	filemanager "github.com/heyango/file-manager"
	fileprocessor "github.com/heyango/file-processor"
)

var (
	// FileProcessor 文件处理器实例
	FileProcessor fileprocessor.Processor

	// FileLibrary 文件库实例
	FileLibrary filelibrary.Library

	// FileManager 文件管理器实例
	FileManager filemanager.Manager

	// FileLibraryPlugin file-library 插件实例（用于路由注册）
	FileLibraryPlugin *filelibrary.Plugin
)

// InitFileServices 初始化文件服务
func InitFileServices() error {
	logger.Log.Info("正在初始化文件服务...")

	// 初始化 File Processor
	if err := initFileProcessor(); err != nil {
		return fmt.Errorf("初始化文件处理器失败: %w", err)
	}

	// 初始化 File Library
	if err := initFileLibrary(); err != nil {
		return fmt.Errorf("初始化文件库失败: %w", err)
	}

	// 初始化 File Manager
	if err := initFileManager(); err != nil {
		return fmt.Errorf("初始化文件管理器失败: %w", err)
	}

	logger.Log.Info("文件服务初始化完成")
	return nil
}

// initFileProcessor 初始化文件处理器
func initFileProcessor() error {
	logger.Log.Info("初始化 File Processor...")

	// 从 YAML 创建处理器
	processor, err := fileprocessor.NewFromYAML("config/file_processor.yaml", logger.Log)
	if err != nil {
		return err
	}

	FileProcessor = processor
	logger.Log.Info("File Processor 初始化成功")
	return nil
}

// initFileLibrary 初始化文件库（使用插件模式）
func initFileLibrary() error {
	logger.Log.Info("初始化 File Library...")

	// 获取数据库连接
	db, err := database.GetDB()
	if err != nil {
		return fmt.Errorf("获取数据库连接失败: %w", err)
	}

	// 创建 ResponseHelper
	responseHelper := &utils.FileLibraryResponseHelper{}

	// 获取当前工作目录
	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("获取当前工作目录失败: %w", err)
	}

	// 将相对路径转换为绝对路径
	storageDir := filepath.Join(cwd, "static", "cdn", "docments")
	tempPath := filepath.Join(cwd, "static", "temp")

	logger.Log.Infof("存储目录（绝对路径）: %s", storageDir)

	// 读取配置文件
	config := map[string]interface{}{
		"storage_dir":             storageDir,
		"base_url":                "http://localhost:23370/cdn/docments/",
		"max_file_size":           int64(10737418240), // 10GB
		"allow_all_formats":       true,
		"preview_enabled":         true,
		"version_control_enabled": true,
		"trash_enabled":           true,
		"backup_enabled":          true,
		"temp_path":               tempPath,
		"preview_width":           800,
		"preview_quality":         85,
		"log_access":              true,
	}

	// 创建插件实例
	FileLibraryPlugin = filelibrary.NewPlugin()

	// 初始化插件
	if err := FileLibraryPlugin.Init(db, logger.Log, config, FileProcessor, responseHelper); err != nil {
		return fmt.Errorf("初始化 file-library 插件失败: %w", err)
	}

	// 执行数据库迁移
	if err := FileLibraryPlugin.Migrate(); err != nil {
		return fmt.Errorf("file-library 数据库迁移失败: %w", err)
	}

	logger.Log.Info("File Library 初始化成功")
	return nil
}

// initFileManager 初始化文件管理器
func initFileManager() error {
	logger.Log.Info("初始化 File Manager...")

	// 从 YAML 创建文件管理器
	manager, err := filemanager.NewFromYAML("config/file_manager.yaml")
	if err != nil {
		return err
	}

	FileManager = manager
	logger.Log.Info("File Manager 初始化成功")
	return nil
}

// CloseFileServices 关闭文件服务
func CloseFileServices() error {
	logger.Log.Info("正在关闭文件服务...")

	// 这里可以添加清理逻辑

	logger.Log.Info("文件服务已关闭")
	return nil
}
