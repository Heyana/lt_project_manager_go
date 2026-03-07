package utils

import (
	"go_wails_project_manager/response"

	"github.com/gin-gonic/gin"
)

// FileLibraryResponseHelper 实现 file-library 的 ResponseHelper 接口
type FileLibraryResponseHelper struct{}

// Success 成功响应
func (h *FileLibraryResponseHelper) Success(c *gin.Context, data interface{}) {
	response.Success(c, data)
}

// SuccessWithMsg 带消息的成功响应
func (h *FileLibraryResponseHelper) SuccessWithMsg(c *gin.Context, msg string, data interface{}) {
	response.SuccessWithMsg(c, msg, data)
}

// SuccessWithPagination 分页响应
func (h *FileLibraryResponseHelper) SuccessWithPagination(c *gin.Context, list interface{}, total int64, page, pageSize int) {
	response.SuccessWithPagination(c, list, total, page, pageSize)
}

// Error 错误响应
func (h *FileLibraryResponseHelper) Error(c *gin.Context, code int, msg string) {
	response.Error(c, response.ResponseCode(code), msg)
}
