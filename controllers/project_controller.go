package controllers

import (
	"go_wails_project_manager/models"
	"go_wails_project_manager/response"
	"go_wails_project_manager/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ProjectController 项目控制器
type ProjectController struct {
	projectService *services.ProjectService
}

// NewProjectController 创建项目控制器实例
func NewProjectController() *ProjectController {
	return &ProjectController{
		projectService: services.NewProjectService(),
	}
}

// CreateProject 创建项目
// @Summary 创建项目
// @Tags 项目管理
// @Accept json
// @Produce json
// @Param project body models.Project true "项目信息"
// @Success 200 {object} response.Response
// @Router /api/projects [post]
func (c *ProjectController) CreateProject(ctx *gin.Context) {
	var project models.Project
	if err := ctx.ShouldBindJSON(&project); err != nil {
		response.Error(ctx, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	if err := c.projectService.CreateProject(&project); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "创建项目失败: "+err.Error())
		return
	}

	response.SuccessWithMsg(ctx, "创建成功", project)
}

// GetProject 获取项目详情
// @Summary 获取项目详情
// @Tags 项目管理
// @Produce json
// @Param id path int true "项目ID"
// @Success 200 {object} response.Response
// @Router /api/projects/{id} [get]
func (c *ProjectController) GetProject(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "无效的项目ID")
		return
	}

	project, err := c.projectService.GetProjectByID(uint(id))
	if err != nil {
		response.Error(ctx, http.StatusNotFound, "项目不存在")
		return
	}

	response.SuccessWithMsg(ctx, "获取成功", project)
}

// GetProjects 获取项目列表
// @Summary 获取项目列表
// @Tags 项目管理
// @Produce json
// @Param type query string false "项目类型" Enums(all, table, show, tools, platform, origin)
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} response.Response
// @Router /api/projects [get]
func (c *ProjectController) GetProjects(ctx *gin.Context) {
	projectType := ctx.DefaultQuery("type", "all")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	projects, total, err := c.projectService.GetProjects(projectType, page, pageSize)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "获取项目列表失败: "+err.Error())
		return
	}

	response.SuccessWithPagination(ctx, projects, total, page, pageSize)
}

// UpdateProject 更新项目
// @Summary 更新项目
// @Tags 项目管理
// @Accept json
// @Produce json
// @Param id path int true "项目ID"
// @Param project body models.Project true "项目信息"
// @Success 200 {object} response.Response
// @Router /api/projects/{id} [put]
func (c *ProjectController) UpdateProject(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "无效的项目ID")
		return
	}

	var project models.Project
	if err := ctx.ShouldBindJSON(&project); err != nil {
		response.Error(ctx, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	project.ID = uint(id)
	if err := c.projectService.UpdateProject(&project); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "更新项目失败: "+err.Error())
		return
	}

	response.SuccessWithMsg(ctx, "更新成功", project)
}

// DeleteProject 删除项目
// @Summary 删除项目
// @Tags 项目管理
// @Produce json
// @Param id path int true "项目ID"
// @Success 200 {object} response.Response
// @Router /api/projects/{id} [delete]
func (c *ProjectController) DeleteProject(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "无效的项目ID")
		return
	}

	if err := c.projectService.DeleteProject(uint(id)); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "删除项目失败: "+err.Error())
		return
	}

	response.SuccessWithMsg(ctx, "删除成功", nil)
}

// UpdateProjectSort 更新项目排序
// @Summary 更新项目排序
// @Tags 项目管理
// @Accept json
// @Produce json
// @Param id path int true "项目ID"
// @Param sort body object{sort_order=int} true "排序值"
// @Success 200 {object} response.Response
// @Router /api/projects/{id}/sort [put]
func (c *ProjectController) UpdateProjectSort(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "无效的项目ID")
		return
	}

	var req struct {
		SortOrder int `json:"sort_order"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	if err := c.projectService.UpdateProjectSort(uint(id), req.SortOrder); err != nil {
		response.Error(ctx, http.StatusInternalServerError, "更新排序失败: "+err.Error())
		return
	}

	response.SuccessWithMsg(ctx, "更新成功", nil)
}

// SearchProjects 搜索项目
// @Summary 搜索项目
// @Tags 项目管理
// @Produce json
// @Param keyword query string false "搜索关键词"
// @Param type query string false "项目类型"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} response.Response
// @Router /api/projects/search [get]
func (c *ProjectController) SearchProjects(ctx *gin.Context) {
	keyword := ctx.Query("keyword")
	projectType := ctx.DefaultQuery("type", "all")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	projects, total, err := c.projectService.SearchProjects(keyword, projectType, page, pageSize)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, "搜索失败: "+err.Error())
		return
	}

	response.SuccessWithPagination(ctx, projects, total, page, pageSize)
}
