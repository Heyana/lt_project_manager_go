package models

import (
	"time"

	"gorm.io/gorm"
)

// Project 项目模型
type Project struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"size:255;not null" json:"name"`
	Type        string         `gorm:"size:50;not null" json:"type"` // table, show, tools, platform, origin
	LinkType    string         `gorm:"size:50" json:"link_type"`     // local, url, videoPath
	Link        string         `gorm:"size:500" json:"link"`         // 项目链接或路径
	Thumbnail   string         `gorm:"size:500" json:"thumbnail"`    // 缩略图路径
	Description string         `gorm:"type:text" json:"description"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	Status      int            `gorm:"default:1" json:"status"` // 1:启用 0:禁用
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联资源
	Resources []Resource `gorm:"foreignKey:ProjectID" json:"resources,omitempty"`
}

// TableName 指定表名
func (Project) TableName() string {
	return "projects"
}
