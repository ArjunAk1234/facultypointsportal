package main

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Routes

func main() {
	// Initialize MongoDB
	if err := initMongoDB(); err != nil {
		panic(err)
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	// User routes
	r.POST("/signup", Signup)
	r.POST("/login", Login)
	r.POST("/teachers", CreateTeacher)
	r.POST("/events", CreateEvent)
	r.POST("/roles/:eventid", CreateRole)
	// Event routes
	r.GET("/events", ListEvents)
	// r.GET("/events/:id", GetEventByID)
	r.GET("/teachers", ListTeachers)

	r.PUT("/events/:id", UpdateEvent)

	// Role routes

	r.GET("/events/:id/roles", GetRolesByEventID)

	// Teacher routes

	r.GET("/teachers/top", GetTopTeachers)

	// Assignment routes
	r.POST("/assignments", AssignTeacherToRole)

	r.DELETE("/delete-role-assignment", DeleteRoleAssignment)

	// GET: Get all assignments for a specific teacher
	r.GET("/teacher-assignments/:id", GetTeacherAssignments)

	// GET: Get all assignments for a specific role
	r.GET("/role-assignments/:id", GetRoleAssignments)

	r.DELETE("/event", DeleteEvent)

	r.GET("/event/:id/roles", GetRolesByEventID)

	r.GET("/teacher/:teacherid/event/:eventid/roles", GetTeacherRolesInEvent)

	r.GET("/events/assigned-teachers/:eventid", GetAssignedTeachersForEvent)

	r.GET("/events/current", GetCurrentEvents)
	r.GET("/events/past", GetPastEvents)
	r.GET("/events/upcoming", GetUpcomingEvents)
	r.GET("/eventid/:id", GetEventByID)

	r.PUT("/teacher/:id", EditTeacher)
	r.DELETE("/teacher/:id", DeleteTeacher)

	//notifications
	r.GET("/teachers/:id/notifications", GetTeacherNotifications)
	r.PUT("/notifications/:id/read", MarkNotificationRead)
	r.DELETE("/notifications/:id", DeleteNotification)
	r.PUT("/teachers/:id/notifications/read-all", MarkAllNotificationsRead)
	r.GET("/teachers/:id/notifications/count", GetNotificationCount)

	//reports
	r.GET("/reports/event/:eventid", GenerateEventReportCSV)
	r.GET("/reports/daterange", GenerateDateRangeReportCSV)
	r.GET("/reports/teacher/:teacherid", GenerateTeacherReportCSV)

	r.GET("/dashboard/faculty", GetFacultyDashboard)

	r.PUT("/assignments/edit/:id", EditTeacherAssignment)

	r.POST("/events/create-from-excel", CreateEventFromExcel)
	// In your main function where you define routes...
	r.POST("/events/:eventid/roles/:roleid/auto-assign", AutoAssignLowestPointTeacherToRole)
	r.Run(":8080")
}
