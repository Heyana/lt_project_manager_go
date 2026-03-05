package services

import (
	"fmt"
	"go_wails_project_manager/database"
	"go_wails_project_manager/models"

	"gorm.io/gorm"
)

// ProjectService 项目服务
type ProjectService struct {
	db *gorm.DB
}

// NewProjectService 创建项目服务实例
func NewProjectService() *ProjectService {
	return &ProjectService{
		db: database.MustGetDB(),
	}
}

// CreateProject 创建项目
func (s *ProjectService) CreateProject(project *models.Project) error {
	return s.db.Create(project).Error
}

// GetProjectByID 根据ID获取项目
func (s *ProjectService) GetProjectByID(id uint) (*models.Project, error) {
	var project models.Project
	err := s.db.Preload("Resources").First(&project, id).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// GetProjects 获取项目列表
func (s *ProjectService) GetProjects(projectType string, page, pageSize int) ([]models.Project, int64, error) {
	var projects []models.Project
	var total int64

	query := s.db.Model(&models.Project{})

	// 按类型筛选
	if projectType != "" && projectType != "all" {
		query = query.Where("type = ?", projectType)
	}

	// 只查询启用的项目
	query = query.Where("status = ?", 1)

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	err := query.Order("sort_order ASC, created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&projects).Error

	if err != nil {
		return nil, 0, err
	}

	return projects, total, nil
}

// UpdateProject 更新项目
func (s *ProjectService) UpdateProject(project *models.Project) error {
	return s.db.Save(project).Error
}

// DeleteProject 删除项目（软删除）
func (s *ProjectService) DeleteProject(id uint) error {
	return s.db.Delete(&models.Project{}, id).Error
}

// UpdateProjectSort 更新项目排序
func (s *ProjectService) UpdateProjectSort(id uint, sortOrder int) error {
	return s.db.Model(&models.Project{}).Where("id = ?", id).Update("sort_order", sortOrder).Error
}

// GetProjectsByType 根据类型获取所有项目
func (s *ProjectService) GetProjectsByType(projectType string) ([]models.Project, error) {
	var projects []models.Project
	query := s.db.Where("status = ?", 1)

	if projectType != "" && projectType != "all" {
		query = query.Where("type = ?", projectType)
	}

	err := query.Order("sort_order ASC, created_at DESC").Find(&projects).Error
	return projects, err
}

// SearchProjects 搜索项目
func (s *ProjectService) SearchProjects(keyword string, projectType string, page, pageSize int) ([]models.Project, int64, error) {
	var projects []models.Project
	var total int64

	query := s.db.Model(&models.Project{}).Where("status = ?", 1)

	// 按类型筛选
	if projectType != "" && projectType != "all" {
		query = query.Where("type = ?", projectType)
	}

	// 关键词搜索
	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?",
			fmt.Sprintf("%%%s%%", keyword),
			fmt.Sprintf("%%%s%%", keyword))
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	err := query.Order("sort_order ASC, created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&projects).Error

	return projects, total, err
}
