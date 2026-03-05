package models

import (
	"fmt"
	"go_wails_project_manager/config"
	"time"

	"gorm.io/gorm"
)

// Resource 资源模型
type Resource struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	ProjectID    uint           `gorm:"index" json:"project_id"`
	ResourceType string         `gorm:"size:50" json:"resource_type"` // image, video, html, other
	FileName     string         `gorm:"size:255" json:"file_name"`
	FilePath     string         `gorm:"size:500" json:"file_path"` // 只存储相对路径，如：image/20240305_thumb.jpg
	FileSize     int64          `json:"file_size"`
	CreatedAt    time.Time      `json:"created_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// 完整 URL（不存储到数据库，查询后动态生成）
	CDNURL string `gorm:"-" json:"cdn_url,omitempty"`
}

// TableName 指定表名
func (Resource) TableName() string {
	return "resources"
}

// AfterFind GORM 钩子：查询后自动拼接完整 CDN URL
func (r *Resource) AfterFind(tx *gorm.DB) error {
	if r.FilePath != "" {
		cdnBaseURL := config.GetCDNBaseURL()
		r.CDNURL = fmt.Sprintf("%s%s", cdnBaseURL, r.FilePath)
	}
	return nil
}
