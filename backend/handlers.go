package main

import (
	"context"
	"encoding/csv"
	"fmt"

	"net/http"
	"strconv"
	"time"

	

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

// LeaderboardEntry defines the structure for a teacher's entry in the leaderboard.
type LeaderboardEntry struct {
	ID     primitive.ObjectID `json:"teacher_id" bson:"_id"`
	Name   string             `json:"teacher_name" bson:"teacher_name"`
	Points int                `json:"points" bson:"total_points"`
}

// FacultyDashboardResponse defines the structure for the faculty dashboard.
type FacultyDashboardResponse struct {
	Leaderboard    []LeaderboardEntry `json:"leaderboard"`
	CurrentEvents  []Event            `json:"current_events"`
	UpcomingEvents []Event            `json:"upcoming_events"`
	PastEvents     []Event            `json:"past_events"`
}

// EditAssignmentRequest defines the structure for the request to edit a teacher assignment.
type EditAssignmentRequest struct {
	Points *int `json:"points"` // Use a pointer to distinguish between 0 and not provided
}

func Signup(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	user.Role = "faculty"

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userCollectionRef := db.Collection(userCollection)
	teacherCollectionRef := db.Collection(teacherCollection)

	count, err := userCollectionRef.CountDocuments(ctx, bson.M{"email": user.Email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already in use"})
		return
	}

	var existingTeacher Teacher
	err = teacherCollectionRef.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingTeacher)
	if err == nil {
		user.ID = existingTeacher.UserID
		user.UserID = existingTeacher.UserID
	} else {
		user.ID = primitive.NewObjectID()
		user.UserID = user.ID
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	_, err = userCollectionRef.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user_id": user.ID,
	})
}

func Login(c *gin.Context) {
	type LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	type LoginResponse struct {
		Message string             `json:"message"`
		Role    string             `json:"role,omitempty"`
		Name    string             `json:"name,omitempty"`
		UserID  primitive.ObjectID `json:"user_id,omitempty" bson:"user_id,omitempty"`
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user User
	collection := db.Collection(userCollection)
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		Message: "Login successful",
		Name:    user.Name,
		Role:    user.Role,
		UserID:  user.UserID,
	})
}

func CreateEvent(c *gin.Context) {
	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection(eventCollection)
	event.ID = primitive.NewObjectID()
	event.EventID = event.ID
	_, err := collection.InsertOne(ctx, event)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, event)
}

func ListEvents(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection(eventCollection)
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var events []Event
	if err := cursor.All(ctx, &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, events)
}

func GetEventByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection(eventCollection)
	var event Event
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

func UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var event Event
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection(eventCollection)
	update := bson.M{
		"$set": bson.M{
			"name":        event.Name,
			"start_date":  event.StartDate,
			"start_time":  event.StartTime,
			"end_date":    event.EndDate,
			"end_time":    event.EndTime,
			"description": event.Description,
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully"})
}

// GetTopTeachers (leaderboard) now prioritizes custom points.
func GetTopTeachers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$lookup", bson.M{"from": teacherAssignmentCollection, "localField": "_id", "foreignField": "teacher_id", "as": "assignments"}}},
		{{"$unwind", bson.M{"path": "$assignments", "preserveNullAndEmptyArrays": true}}},
		{{"$lookup", bson.M{"from": roleCollection, "localField": "assignments.role_id", "foreignField": "_id", "as": "role"}}},
		{{"$unwind", bson.M{"path": "$role", "preserveNullAndEmptyArrays": true}}},
		{{"$group", bson.M{
			"_id":          "$_id",
			"teacher_name": bson.M{"$first": "$name"},
			// UPDATED: Use awarded points if they exist, otherwise fall back to role points.
			"total_points": bson.M{"$sum": bson.M{
				"$ifNull": []interface{}{"$assignments.points_awarded", "$role.point", 0},
			}},
		}}},
		{{"$sort", bson.M{"total_points": -1}}},
		{{"$limit", 10}},
	}

	cursor, err := db.Collection(teacherCollection).Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to aggregate top teachers: " + err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var teachers []LeaderboardEntry
	if err := cursor.All(ctx, &teachers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode top teachers: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, teachers)
}

func CreateRole(c *gin.Context) {
	eventID := c.Param("eventid")
	var role Role
	if err := c.ShouldBindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oid, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	roleCollection := db.Collection("roles")
	eventCollection := db.Collection("events")

	var event Event
	err = eventCollection.FindOne(ctx, bson.M{"_id": oid}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	role.ID = primitive.NewObjectID()
	role.EventID = oid
	role.EventName = event.Name
	role.RoleID = role.ID

	_, err = roleCollection.InsertOne(ctx, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert role: " + err.Error()})
		return
	}

	update := bson.M{"$push": bson.M{"roles": bson.M{"id": role.ID, "name": role.Name}}}
	_, err = eventCollection.UpdateOne(ctx, bson.M{"_id": oid}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event with role: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, role)
}

// func CreateTeacher(c *gin.Context) {
// 	var teacher Teacher
// 	if err := c.ShouldBindJSON(&teacher); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// --- START: Corrected Validation ---
// 	// Check if the Departmentname field is empty.
// 	if teacher.Departmentname == "" { // Changed from teacher.Department
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Departmentname field is required"})
// 		return
// 	}
// 	// --- END: Corrected Validation ---
// 	teacher.Point = 0
// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	userCollectionRef := db.Collection(userCollection)
// 	var existingUser User

// 	// Check if a user with this email already exists
// 	err := userCollectionRef.FindOne(ctx, bson.M{"email": teacher.Email}).Decode(&existingUser)
// 	if err == nil {
// 		// User exists, use their ID for the new teacher
// 		teacher.ID = existingUser.ID
// 		teacher.UserID = existingUser.ID
// 	} else if err == mongo.ErrNoDocuments {
// 		// User does not exist, create a new ID for the teacher
// 		teacher.ID = primitive.NewObjectID()
// 		teacher.UserID = teacher.ID
// 	} else {
// 		// Handle other potential errors from FindOne
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking for existing user: " + err.Error()})
// 		return
// 	}

// 	collection := db.Collection(teacherCollection)
// 	_, err = collection.InsertOne(ctx, teacher)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create teacher: " + err.Error()})
// 		return
// 	}

// 	filter := bson.M{"email": teacher.Email}
// 	update := bson.M{"$set": bson.M{"user_id": teacher.ID, "_id": teacher.ID}}
// 	opts := options.Update().SetUpsert(true)
// 	_, err = userCollectionRef.UpdateOne(ctx, filter, update, opts)
// 	if err != nil {
// 		fmt.Printf("Warning: Failed to upsert user for teacher %s: %v\n", teacher.Email, err)
// 	}

// 	c.JSON(http.StatusOK, teacher)
// }

// func CreateTeacher(c *gin.Context) {
// 	var teacher Teacher
// 	if err := c.ShouldBindJSON(&teacher); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// --- START: Corrected Validation ---
// 	// Check if the Departmentname field is empty.
// 	if teacher.Departmentname == "" { // Changed from teacher.Department
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Departmentname field is required"})
// 		return
// 	}
// 	// --- END: Corrected Validation ---

// 	// Initialize points to 0 for a new teacher
// 	teacher.Point = 0

// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	userCollectionRef := db.Collection(userCollection)
// 	var existingUser User

// 	// Check if a user with this email already exists
// 	err := userCollectionRef.FindOne(ctx, bson.M{"email": teacher.Email}).Decode(&existingUser)
// 	if err == nil {
// 		// User exists, use their ID for the new teacher
// 		teacher.ID = existingUser.ID
// 		teacher.UserID = existingUser.ID
// 	} else if err == mongo.ErrNoDocuments {
// 		// User does not exist, create a new ID for the teacher
// 		teacher.ID = primitive.NewObjectID()
// 		teacher.UserID = teacher.ID
// 	} else {
// 		// Handle other potential errors from FindOne
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking for existing user: " + err.Error()})
// 		return
// 	}

// 	collection := db.Collection(teacherCollection)
// 	_, err = collection.InsertOne(ctx, teacher)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create teacher: " + err.Error()})
// 		return
// 	}

// 	filter := bson.M{"email": teacher.Email}
// 	update := bson.M{"$set": bson.M{"user_id": teacher.ID, "_id": teacher.ID}}
// 	opts := options.Update().SetUpsert(true)
// 	_, err = userCollectionRef.UpdateOne(ctx, filter, update, opts)
// 	if err != nil {
// 		fmt.Printf("Warning: Failed to upsert user for teacher %s: %v\n", teacher.Email, err)
// 	}

//		c.JSON(http.StatusOK, teacher)
//	}
//original
func CreateTeacher(c *gin.Context) {
	var teacher Teacher
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate that the Departmentname field is not empty.
	if teacher.Departmentname == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Departmentname field is required"})
		return
	}

	// Initialize points to 0 for a new teacher.
	teacher.Point = 0

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := db.Collection(userCollection)
	var existingUser User

	// Check if a user with the provided email already exists in the user database.
	err := userCollection.FindOne(ctx, bson.M{"email": teacher.Email}).Decode(&existingUser)
	if err == nil {
		// If the user exists, use their ID for the new teacher's ID and UserID.
		teacher.ID = existingUser.ID
		teacher.UserID = existingUser.ID
	} else if err == mongo.ErrNoDocuments {
		// If the user does not exist, create a new ID for the teacher.
		// A new user will not be created in the user database.
		teacher.ID = primitive.NewObjectID()
		teacher.UserID = teacher.ID
	} else {
		// Handle other potential errors from FindOne.
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking for existing user: " + err.Error()})
		return
	}

	teacherCollection := db.Collection(teacherCollection)
	_, err = teacherCollection.InsertOne(ctx, teacher)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create teacher: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, teacher)
}

// func CreateTeacher(c *gin.Context) {
// 	var teacher Teacher
// 	if err := c.ShouldBindJSON(&teacher); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	// Validate that the Departmentname field is not empty.
// 	if teacher.Departmentname == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Departmentname field is required"})
// 		return
// 	}

// 	// Initialize points to 0 for a new teacher.
// 	teacher.Point = 0

// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	userCollection := db.Collection(userCollection) // Assuming userCollectionName is defined elsewhere as a string
// 	teacherCollection := db.Collection("teacher")

// 	// Step 1: Check for duplicate email in teacher collection
// 	var existingTeacher Teacher
// 	err := teacherCollection.FindOne(ctx, bson.M{"email": teacher.Email}).Decode(&existingTeacher)
// 	if err == nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Teacher with this email already exists"})
// 		return
// 	} else if err != mongo.ErrNoDocuments {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking teacher database: " + err.Error()})
// 		return
// 	}

// 	var existingUser User
// 	// Check if a user with the provided email already exists in the user database.
// 	// Use = for assignment here, as 'err' is already declared.
// 	err = userCollection.FindOne(ctx, bson.M{"email": teacher.Email}).Decode(&existingUser)
// 	if err == nil {
// 		// If the user exists, use their ID for the new teacher's ID and UserID.
// 		teacher.ID = existingUser.ID
// 		teacher.UserID = existingUser.ID
// 	} else if err == mongo.ErrNoDocuments {
// 		// If the user does not exist, create a new ID for the teacher.
// 		// A new user will not be created in the user database.
// 		teacher.ID = primitive.NewObjectID()
// 		teacher.UserID = teacher.ID
// 	} else {
// 		// Handle other potential errors from FindOne.
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking for existing user: " + err.Error()})
// 		return
// 	}

// 	// You already defined teacherCollection above, no need to redefine or call db.Collection again.
// 	_, err = teacherCollection.InsertOne(ctx, teacher)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create teacher: " + err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, teacher)
// }
func ListTeachers(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$lookup", bson.M{"from": departmentCollection, "localField": "department_id", "foreignField": "_id", "as": "department"}}},
		{{"$unwind", bson.M{"path": "$department", "preserveNullAndEmptyArrays": true}}},
		{{"$project", bson.M{
			"_id": 1, "name": 1, "email": 1, "profile_photo": 1, "point": 1,
			"department_name": "$departmentname",
		}}},
	}

	collection := db.Collection(teacherCollection)
	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var teachers []bson.M
	if err := cursor.All(ctx, &teachers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, teachers)
}

func AssignTeacherToRole(c *gin.Context) {
	type AssignmentRequest struct {
		TeacherID string `json:"teacher_id" binding:"required"`
		RoleID    string `json:"role_id" binding:"required"`
		EventID   string `json:"event_id" binding:"required"`
	}

	var req AssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	teacherID, _ := primitive.ObjectIDFromHex(req.TeacherID)
	roleID, _ := primitive.ObjectIDFromHex(req.RoleID)
	eventID, _ := primitive.ObjectIDFromHex(req.EventID)

	roleCollection := db.Collection(roleCollection)
	var role Role
	if err := roleCollection.FindOne(ctx, bson.M{"_id": roleID}).Decode(&role); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	eventCollection := db.Collection(eventCollection)
	var event Event
	if err := eventCollection.FindOne(ctx, bson.M{"_id": eventID}).Decode(&event); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	teacherCollection := db.Collection(teacherCollection)
	var teacher Teacher
	if err := teacherCollection.FindOne(ctx, bson.M{"_id": teacherID}).Decode(&teacher); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}

	assignmentCollection := db.Collection(teacherAssignmentCollection)
	count, _ := assignmentCollection.CountDocuments(ctx, bson.M{"teacher_id": teacherID, "role_id": roleID, "event_id": eventID})
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Teacher is already assigned to this role in this event"})
		return
	}

	assignedCount, _ := assignmentCollection.CountDocuments(ctx, bson.M{"role_id": roleID})
	if int(assignedCount) >= role.HeadCount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role has reached its maximum head count"})
		return
	}

	assignment := Assignment{
		ID:           primitive.NewObjectID(),
		EventID:      eventID,
		EventName:    event.Name,
		TeacherID:    teacherID,
		RoleID:       roleID,
		RoleName:     role.Name,
		TeacherName:  teacher.Name,
		TeacherEmail: teacher.Email,
	}
	assignment.AssignmentID = assignment.ID

	if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
		return
	}

	if _, err := teacherCollection.UpdateOne(ctx, bson.M{"_id": teacherID}, bson.M{"$inc": bson.M{"point": role.Point}}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update teacher points"})
		return
	}

	roleRef := RoleRef1{ID: roleID, RoleName: role.Name, TeacherleName: teacher.Name, Assignment_ID: assignment.ID}
	if _, err := eventCollection.UpdateOne(ctx, bson.M{"_id": eventID}, bson.M{"$push": bson.M{"assginedteachers": roleRef}}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event's assigned teachers"})
		return
	}

	if err := createNotification(teacherID, eventID, roleID, assignment.ID, event.Name, role.Name, teacher.Name); err != nil {
		fmt.Printf("Failed to create notification: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Teacher assigned successfully", "assignment": assignment})
}

// EditTeacherAssignment allows editing the points for a specific assignment.
func EditTeacherAssignment(c *gin.Context) {
	assignmentIDStr := c.Param("id")
	assignmentID, err := primitive.ObjectIDFromHex(assignmentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	var req EditAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if req.Points == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Points field is required for update"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	assignmentCollection := db.Collection(teacherAssignmentCollection)
	roleCollection := db.Collection(roleCollection)
	teacherCollection := db.Collection(teacherCollection)

	var originalAssignment Assignment
	err = assignmentCollection.FindOne(ctx, bson.M{"_id": assignmentID}).Decode(&originalAssignment)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	var originalPoints int
	if originalAssignment.PointsAwarded != nil {
		originalPoints = *originalAssignment.PointsAwarded
	} else {
		var originalRole Role
		err = roleCollection.FindOne(ctx, bson.M{"_id": originalAssignment.RoleID}).Decode(&originalRole)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Could not find the original role to determine points"})
			return
		}
		originalPoints = originalRole.Point
	}

	newPoints := *req.Points
	pointDifference := newPoints - originalPoints

	_, err = teacherCollection.UpdateOne(ctx, bson.M{"_id": originalAssignment.TeacherID}, bson.M{"$inc": bson.M{"point": pointDifference}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update teacher's total points"})
		return
	}

	_, err = assignmentCollection.UpdateOne(ctx, bson.M{"_id": assignmentID}, bson.M{"$set": bson.M{"points_awarded": newPoints}})
	if err != nil {
		_, _ = teacherCollection.UpdateOne(ctx, bson.M{"_id": originalAssignment.TeacherID}, bson.M{"$inc": bson.M{"point": -pointDifference}})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record the new points in the assignment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assignment points updated successfully"})
}

// DeleteRoleAssignment now correctly deducts custom points if they exist.
func DeleteRoleAssignment(c *gin.Context) {
	type DeleteAssignmentRequest struct {
		AssignmentID string `json:"assignment_id" binding:"required"`
		DeductPoints bool   `json:"deduct_points"`
	}

	var req DeleteAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	assignmentID, err := primitive.ObjectIDFromHex(req.AssignmentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	assignmentCollection := db.Collection(teacherAssignmentCollection)
	var assignment Assignment
	err = assignmentCollection.FindOne(ctx, bson.M{"_id": assignmentID}).Decode(&assignment)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	if req.DeductPoints {
		var pointsToDeduct int
		if assignment.PointsAwarded != nil {
			pointsToDeduct = *assignment.PointsAwarded
		} else {
			var role Role
			err = db.Collection(roleCollection).FindOne(ctx, bson.M{"_id": assignment.RoleID}).Decode(&role)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not find role to determine points for deduction"})
				return
			}
			pointsToDeduct = role.Point
		}

		_, err = db.Collection(teacherCollection).UpdateOne(ctx, bson.M{"_id": assignment.TeacherID}, bson.M{"$inc": bson.M{"point": -pointsToDeduct}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update teacher points"})
			return
		}
	}

	_, err = assignmentCollection.DeleteOne(ctx, bson.M{"_id": assignmentID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assignment"})
		return
	}

	_, err = db.Collection(eventCollection).UpdateOne(ctx, bson.M{"_id": assignment.EventID}, bson.M{"$pull": bson.M{"assginedteachers": bson.M{"assignment_id": assignment.ID}}})
	if err != nil {
		fmt.Printf("Warning: Failed to pull assignment reference from event %s: %v\n", assignment.EventID.Hex(), err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role assignment deleted successfully", "deducted_points": req.DeductPoints})
}

func GetTeacherAssignments(c *gin.Context) {
	teacherID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(teacherID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection(teacherAssignmentCollection)
	cursor, err := collection.Find(ctx, bson.M{"teacher_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var assignments []Assignment
	if err := cursor.All(ctx, &assignments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assignments)
}

func GetRoleAssignments(c *gin.Context) {
	roleID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(roleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection(teacherAssignmentCollection)
	cursor, err := collection.Find(ctx, bson.M{"role_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var assignments []Assignment
	if err := cursor.All(ctx, &assignments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assignments)
}

// DeleteEvent is updated to handle custom points for deduction.
// func DeleteEvent(c *gin.Context) {
// 	type DeleteEventRequest struct {
// 		EventID      string `json:"event_id" binding:"required"`
// 		DeductPoints bool   `json:"deduct_points"`
// 	}

// 	var req DeleteEventRequest
// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
// 		return
// 	}

// 	eventID, err := primitive.ObjectIDFromHex(req.EventID)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
// 		return
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
// 	defer cancel()

// 	eventCollection := db.Collection(eventCollection)
// 	var event Event
// 	err = eventCollection.FindOne(ctx, bson.M{"_id": eventID}).Decode(&event)
// 	if err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
// 		return
// 	}

// 	assignmentCollection := db.Collection(teacherAssignmentCollection)
// 	if req.DeductPoints {
// 		// Find all assignments for the event
// 		cursor, err := assignmentCollection.Find(ctx, bson.M{"event_id": eventID})
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve assignments for point deduction"})
// 			return
// 		}
// 		var assignmentsToDelete []Assignment
// 		if err = cursor.All(ctx, &assignmentsToDelete); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode assignments for point deduction"})
// 			return
// 		}

// 		// Deduct points for each assignment
// 		for _, assignment := range assignmentsToDelete {
// 			var pointsToDeduct int
// 			if assignment.PointsAwarded != nil {
// 				pointsToDeduct = *assignment.PointsAwarded
// 			} else {
// 				var role Role
// 				err := db.Collection(roleCollection).FindOne(ctx, bson.M{"_id": assignment.RoleID}).Decode(&role)
// 				if err == nil { // If role found, get points
// 					pointsToDeduct = role.Point
// 				}
// 			}

// 			if pointsToDeduct != 0 {
// 				_, _ = db.Collection(teacherCollection).UpdateOne(ctx, bson.M{"_id": assignment.TeacherID}, bson.M{"$inc": bson.M{"point": -pointsToDeduct}})
// 			}
// 		}
// 	}

// 	// Delete all assignments, roles, and finally the event
// 	_, err = assignmentCollection.DeleteMany(ctx, bson.M{"event_id": eventID})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assignments for the event"})
// 		return
// 	}

// 	_, err = db.Collection(roleCollection).DeleteMany(ctx, bson.M{"event_id": eventID})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete roles for the event"})
// 		return
// 	}

// 	_, err = eventCollection.DeleteOne(ctx, bson.M{"_id": eventID})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete the event"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message":         "Event and all associated data deleted successfully",
// 		"deducted_points": req.DeductPoints,
// 		"event_name":      event.Name,
// 	})
// }
func DeleteEvent(c *gin.Context) {
	type DeleteEventRequest struct {
		EventID      string `json:"event_id" binding:"required"`
		DeductPoints bool   `json:"deduct_points"`
	}

	var req DeleteEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	eventID, err := primitive.ObjectIDFromHex(req.EventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	eventCollection := db.Collection(eventCollection)
	var event Event
	err = eventCollection.FindOne(ctx, bson.M{"_id": eventID}).Decode(&event)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	assignmentCollection := db.Collection(teacherAssignmentCollection)
	notificationCollection := db.Collection("notifications") // Add this line

	if req.DeductPoints {
		// Find all assignments for the event
		cursor, err := assignmentCollection.Find(ctx, bson.M{"event_id": eventID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve assignments for point deduction"})
			return
		}
		var assignmentsToDelete []Assignment
		if err = cursor.All(ctx, &assignmentsToDelete); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode assignments for point deduction"})
			return
		}

		// Deduct points for each assignment
		for _, assignment := range assignmentsToDelete {
			var pointsToDeduct int
			if assignment.PointsAwarded != nil {
				pointsToDeduct = *assignment.PointsAwarded
			} else {
				var role Role
				err := db.Collection(roleCollection).FindOne(ctx, bson.M{"_id": assignment.RoleID}).Decode(&role)
				if err == nil { // If role found, get points
					pointsToDeduct = role.Point
				}
			}

			if pointsToDeduct != 0 {
				_, _ = db.Collection(teacherCollection).UpdateOne(ctx, bson.M{"_id": assignment.TeacherID}, bson.M{"$inc": bson.M{"point": -pointsToDeduct}})
			}
		}
	}

	// Delete all assignments, roles, notifications, and finally the event
	_, err = assignmentCollection.DeleteMany(ctx, bson.M{"event_id": eventID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assignments for the event"})
		return
	}

	_, err = db.Collection(roleCollection).DeleteMany(ctx, bson.M{"event_id": eventID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete roles for the event"})
		return
	}

	// NEW: Delete all notifications associated with this event
	_, err = notificationCollection.DeleteMany(ctx, bson.M{"event_id": eventID})
	if err != nil {
		fmt.Printf("Warning: Failed to delete notifications for event %s: %v\n", eventID.Hex(), err)
		// This is a warning, not a critical error, so we continue.
	}

	_, err = eventCollection.DeleteOne(ctx, bson.M{"_id": eventID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete the event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":         "Event and all associated data deleted successfully",
		"deducted_points": req.DeductPoints,
		"event_name":      event.Name,
	})
}
func GetRolesByEventID(c *gin.Context) {
	eventID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	roleCollection := db.Collection(roleCollection)
	cursor, err := roleCollection.Find(ctx, bson.M{"event_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var roles []Role
	if err := cursor.All(ctx, &roles); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}

func GetTeacherRolesInEvent(c *gin.Context) {
	teacherID := c.Param("teacherid")
	eventID := c.Param("eventid")

	teacherObjID, _ := primitive.ObjectIDFromHex(teacherID)
	eventObjID, _ := primitive.ObjectIDFromHex(eventID)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.M{"teacher_id": teacherObjID, "event_id": eventObjID}}},
		{{"$lookup", bson.M{"from": roleCollection, "localField": "role_id", "foreignField": "_id", "as": "role_details"}}},
		{{"$unwind", "$role_details"}},
		{{"$project", bson.M{
			"_id": 1, "event_id": 1, "event_name": "$eventname", "teacher_id": 1, "role_id": 1,
			"role_name": "$role_details.name", "role_description": "$role_details.description",
			// UPDATED: Show actual points awarded.
			"role_point": bson.M{"$ifNull": []interface{}{"$points_awarded", "$role_details.point"}},
		}}},
	}

	cursor, err := db.Collection(teacherAssignmentCollection).Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var assignments []bson.M
	if err := cursor.All(ctx, &assignments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, assignments)
}

func GetAssignedTeachersForEvent(c *gin.Context) {
	eventIDParam := c.Param("eventid")
	eventID, err := primitive.ObjectIDFromHex(eventIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	assignmentCollection := db.Collection("teacherAssignments")
	cursor, err := assignmentCollection.Find(ctx, bson.M{"event_id": eventID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}
	defer cursor.Close(ctx)

	var assignments []Assignment
	if err = cursor.All(ctx, &assignments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode assignments"})
		return
	}

	c.JSON(http.StatusOK, assignments)
}

func parseEventDateTime(dateStr, timeStr string) (time.Time, error) {
	if dateStr == "" || timeStr == "" {
		return time.Time{}, fmt.Errorf("date or time string is empty")
	}
	return time.ParseInLocation("2006-01-02 15:04", dateStr+" "+timeStr, time.Local)
}

func GetCurrentEvents(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	curTime := time.Now()
	cursor, err := db.Collection(eventCollection).Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events: " + err.Error()})
		return
	}
	var events []Event
	if err := cursor.All(ctx, &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse events: " + err.Error()})
		return
	}
	currentEvents := make([]Event, 0)
	for _, e := range events {
		start, err1 := parseEventDateTime(e.StartDate, e.StartTime)
		end, err2 := parseEventDateTime(e.EndDate, e.EndTime)
		if err1 == nil && err2 == nil && curTime.After(start) && curTime.Before(end) {
			currentEvents = append(currentEvents, e)
		}
	}
	c.JSON(http.StatusOK, currentEvents)
}

func GetPastEvents(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	curTime := time.Now()
	cursor, err := db.Collection(eventCollection).Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var events []Event
	if err := cursor.All(ctx, &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	pastEvents := make([]Event, 0)
	for _, e := range events {
		end, err := parseEventDateTime(e.EndDate, e.EndTime)
		if err == nil && curTime.After(end) {
			pastEvents = append(pastEvents, e)
		}
	}
	c.JSON(http.StatusOK, pastEvents)
}

func GetUpcomingEvents(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	curTime := time.Now()
	cursor, err := db.Collection(eventCollection).Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var events []Event
	if err := cursor.All(ctx, &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	upcomingEvents := make([]Event, 0)
	for _, e := range events {
		start, err := parseEventDateTime(e.StartDate, e.StartTime)
		if err == nil && curTime.Before(start) {
			upcomingEvents = append(upcomingEvents, e)
		}
	}
	c.JSON(http.StatusOK, upcomingEvents)
}

func EditTeacher(c *gin.Context) {
	teacherIDStr := c.Param("id")
	teacherID, err := primitive.ObjectIDFromHex(teacherIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}

	var updateData struct {
		Name           string `json:"name"`
		Email          string `json:"email"`
		DepartmentName string `json:"departmentname"`
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	updateFields := bson.M{}
	if updateData.Name != "" {
		updateFields["name"] = updateData.Name
	}
	if updateData.Email != "" {
		updateFields["email"] = updateData.Email
	}
	if updateData.DepartmentName != "" {
		updateFields["departmentname"] = updateData.DepartmentName
	}
	if len(updateFields) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields provided for update"})
		return
	}

	result, err := db.Collection(teacherCollection).UpdateOne(ctx, bson.M{"_id": teacherID}, bson.M{"$set": updateFields})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update teacher"})
		return
	}
	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Teacher updated successfully"})
}

func DeleteTeacher(c *gin.Context) {
	teacherIDStr := c.Param("id")
	teacherID, err := primitive.ObjectIDFromHex(teacherIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := db.Collection(teacherCollection).DeleteOne(ctx, bson.M{"_id": teacherID})
	if err != nil || result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found or delete failed"})
		return
	}

	_, _ = db.Collection(teacherAssignmentCollection).DeleteMany(ctx, bson.M{"teacher_id": teacherID})
	_, _ = db.Collection(eventCollection).UpdateMany(ctx, bson.M{}, bson.M{"$pull": bson.M{"assginedteachers": bson.M{"teacher_id": teacherID}}})
	_, _ = db.Collection(userCollection).DeleteOne(ctx, bson.M{"_id": teacherID})

	c.JSON(http.StatusOK, gin.H{"message": "Teacher and related references deleted successfully"})
}

func createNotification(teacherID, eventID, roleID, assignmentID primitive.ObjectID, eventName, roleName, teacherName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	notification := Notification{
		ID:             primitive.NewObjectID(),
		NotificationID: primitive.NewObjectID(),
		TeacherID:      teacherID,
		UserID:         teacherID,
		Type:           "assignment",
		Title:          "New Role Assignment",
		Message:        fmt.Sprintf("You have been assigned to the role '%s' in event '%s'", roleName, eventName),
		EventID:        eventID,
		EventName:      eventName,
		RoleID:         roleID,
		RoleName:       roleName,
		AssignmentID:   assignmentID,
		IsRead:         false,
		CreatedAt:      time.Now(),
	}
	_, err := db.Collection("notifications").InsertOne(ctx, notification)
	return err
}

func GetTeacherNotifications(c *gin.Context) {
	teacherID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(teacherID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	showRead := c.DefaultQuery("show_read", "true") == "true"
	filter := bson.M{"teacher_id": objectID}
	if !showRead {
		filter["is_read"] = false
	}

	cursor, err := db.Collection("notifications").Find(ctx, filter, options.Find().SetSort(bson.D{{"created_at", -1}}))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var notifications []Notification
	if err := cursor.All(ctx, &notifications); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if notifications == nil {
		c.JSON(http.StatusOK, []Notification{})
		return
	}
	c.JSON(http.StatusOK, notifications)
}

func MarkNotificationRead(c *gin.Context) {
	notificationID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(notificationID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	now := time.Now()
	update := bson.M{"$set": bson.M{"is_read": true, "read_at": &now}}
	result, err := db.Collection("notifications").UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

func DeleteNotification(c *gin.Context) {
	notificationID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(notificationID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := db.Collection("notifications").DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted successfully"})
}

func MarkAllNotificationsRead(c *gin.Context) {
	teacherID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(teacherID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	now := time.Now()
	update := bson.M{"$set": bson.M{"is_read": true, "read_at": &now}}
	filter := bson.M{"teacher_id": objectID, "is_read": false}
	result, err := db.Collection("notifications").UpdateMany(ctx, filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read", "updated_count": result.ModifiedCount})
}

func GetNotificationCount(c *gin.Context) {
	teacherID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(teacherID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection("notifications")
	totalCount, _ := collection.CountDocuments(ctx, bson.M{"teacher_id": objectID})
	unreadCount, _ := collection.CountDocuments(ctx, bson.M{"teacher_id": objectID, "is_read": false})

	c.JSON(http.StatusOK, gin.H{"total_count": totalCount, "unread_count": unreadCount})
}

type DetailedAssignmentReport struct {
	EventName      string `bson:"eventName"`
	EventStartDate string `bson:"eventStartDate"`
	EventEndDate   string `bson:"eventEndDate"`
	TeacherName    string `bson:"teacherName"`
	TeacherEmail   string `bson:"teacherEmail"`
	DepartmentName string `bson:"departmentName"`
	RoleName       string `bson:"roleName"`
	RolePoint      int    `bson:"rolePoint"`
}

// GenerateEventReportCSV now shows the actual points awarded in the report.
func GenerateEventReportCSV(c *gin.Context) {
	eventIDStr := c.Param("eventid")
	eventID, err := primitive.ObjectIDFromHex(eventIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.M{"event_id": eventID}}},
		{{"$lookup", bson.M{"from": "events", "localField": "event_id", "foreignField": "_id", "as": "event"}}},
		{{"$unwind", "$event"}},
		{{"$lookup", bson.M{"from": "teachers", "localField": "teacher_id", "foreignField": "_id", "as": "teacher"}}},
		{{"$unwind", "$teacher"}},
		{{"$lookup", bson.M{"from": "roles", "localField": "role_id", "foreignField": "_id", "as": "role"}}},
		{{"$unwind", "$role"}},
		{{"$project", bson.M{
			"eventName": "$event.name", "eventStartDate": "$event.start_date", "eventEndDate": "$event.end_date",
			"teacherName": "$teacher.name", "teacherEmail": "$teacher.email", "departmentName": "$teacher.departmentname",
			"roleName":  "$role.name",
			"rolePoint": bson.M{"$ifNull": []interface{}{"$points_awarded", "$role.point"}},
		}}},
	}
	cursor, err := db.Collection(teacherAssignmentCollection).Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate report"})
		return
	}
	defer cursor.Close(ctx)

	var results []DetailedAssignmentReport
	if err := cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode report data"})
		return
	}
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=event_report.csv")
	writer := csv.NewWriter(c.Writer)
	headers := []string{"Event Name", "Event Start Date", "Event End Date", "Teacher Name", "Teacher Email", "Department", "Assigned Role", "Points Awarded"}
	_ = writer.Write(headers)
	for _, result := range results {
		row := []string{result.EventName, result.EventStartDate, result.EventEndDate, result.TeacherName, result.TeacherEmail, result.DepartmentName, result.RoleName, strconv.Itoa(result.RolePoint)}
		_ = writer.Write(row)
	}
	writer.Flush()
}

// GenerateDateRangeReportCSV is updated to handle custom points.
func GenerateDateRangeReportCSV(c *gin.Context) {
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	if startDateStr == "" || endDateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide start_date and end_date parameters."})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.M{"start_date": bson.M{"$gte": startDateStr}, "end_date": bson.M{"$lte": endDateStr}}}},
		{{"$lookup", bson.M{"from": "teacherAssignments", "localField": "_id", "foreignField": "event_id", "as": "assignments"}}},
		{{"$unwind", "$assignments"}},
		{{"$lookup", bson.M{"from": "teachers", "localField": "assignments.teacher_id", "foreignField": "_id", "as": "teacher"}}},
		{{"$unwind", "$teacher"}},
		{{"$lookup", bson.M{"from": "roles", "localField": "assignments.role_id", "foreignField": "_id", "as": "role"}}},
		{{"$unwind", "$role"}},
		{{"$project", bson.M{
			"eventName": "$name", "eventStartDate": "$start_date", "eventEndDate": "$end_date",
			"teacherName": "$teacher.name", "teacherEmail": "$teacher.email", "departmentName": "$teacher.departmentname",
			"roleName":  "$role.name",
			"rolePoint": bson.M{"$ifNull": []interface{}{"$assignments.points_awarded", "$role.point"}},
		}}},
	}

	cursor, err := db.Collection(eventCollection).Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate report"})
		return
	}
	defer cursor.Close(ctx)
	var results []DetailedAssignmentReport
	if err := cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode report data"})
		return
	}
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=report_%s_to_%s.csv", startDateStr, endDateStr))
	writer := csv.NewWriter(c.Writer)
	headers := []string{"Event Name", "Event Start Date", "Event End Date", "Teacher Name", "Teacher Email", "Department", "Assigned Role", "Points"}
	_ = writer.Write(headers)
	for _, result := range results {
		row := []string{result.EventName, result.EventStartDate, result.EventEndDate, result.TeacherName, result.TeacherEmail, result.DepartmentName, result.RoleName, strconv.Itoa(result.RolePoint)}
		_ = writer.Write(row)
	}
	writer.Flush()
}

// GenerateTeacherReportCSV is updated to handle custom points.
func GenerateTeacherReportCSV(c *gin.Context) {
	teacherIDStr := c.Param("teacherid")
	teacherID, err := primitive.ObjectIDFromHex(teacherIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.M{"teacher_id": teacherID}}},
		{{"$lookup", bson.M{"from": "events", "localField": "event_id", "foreignField": "_id", "as": "event"}}},
		{{"$unwind", "$event"}},
		{{"$lookup", bson.M{"from": "teachers", "localField": "teacher_id", "foreignField": "_id", "as": "teacher"}}},
		{{"$unwind", "$teacher"}},
		{{"$lookup", bson.M{"from": "roles", "localField": "role_id", "foreignField": "_id", "as": "role"}}},
		{{"$unwind", "$role"}},
		{{"$project", bson.M{
			"eventName":      "$event.name",
			"eventStartDate": "$event.start_date",
			"eventEndDate":   "$event.end_date",
			"teacherName":    "$teacher.name", "teacherEmail": "$teacher.email", "departmentName": "$teacher.departmentname",
			"roleName":  "$role.name",
			"rolePoint": bson.M{"$ifNull": []interface{}{"$points_awarded", "$role.point"}},
		}}},
	}

	cursor, err := db.Collection(teacherAssignmentCollection).Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate report"})
		return
	}
	defer cursor.Close(ctx)
	var results []DetailedAssignmentReport
	if err := cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode report data"})
		return
	}
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=teacher_report.csv")
	writer := csv.NewWriter(c.Writer)
	headers := []string{"Teacher Name", "Teacher Email", "Department", "Event Name", "Event Start Date", "Event End Date", "Assigned Role", "Points"}
	_ = writer.Write(headers)
	for _, result := range results {
		row := []string{result.TeacherName, result.TeacherEmail, result.DepartmentName, result.EventName, result.EventStartDate, result.EventEndDate, result.RoleName, strconv.Itoa(result.RolePoint)}
		_ = writer.Write(row)
	}
	writer.Flush()
}

// GetFacultyDashboard is updated to handle custom points for the leaderboard.
func GetFacultyDashboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	var dashboardResponse FacultyDashboardResponse
	var err error

	// Channel to receive leaderboard results
	leaderboardChan := make(chan []LeaderboardEntry)
	errChan := make(chan error, 2) // Buffered channel for errors

	go func() {
		leaderboardPipeline := mongo.Pipeline{
			{{"$lookup", bson.M{"from": teacherAssignmentCollection, "localField": "_id", "foreignField": "teacher_id", "as": "assignments"}}},
			{{"$unwind", bson.M{"path": "$assignments", "preserveNullAndEmptyArrays": true}}},
			{{"$lookup", bson.M{"from": roleCollection, "localField": "assignments.role_id", "foreignField": "_id", "as": "role"}}},
			{{"$unwind", bson.M{"path": "$role", "preserveNullAndEmptyArrays": true}}},
			{{"$group", bson.M{
				"_id": "$_id", "teacher_name": bson.M{"$first": "$name"},
				"total_points": bson.M{"$sum": bson.M{"$ifNull": []interface{}{"$assignments.points_awarded", "$role.point", 0}}},
			}}},
			{{"$sort", bson.M{"total_points": -1}}},
			{{"$limit", 10}},
		}
		cursor, err := db.Collection(teacherCollection).Aggregate(ctx, leaderboardPipeline)
		if err != nil {
			errChan <- err
			return
		}
		defer cursor.Close(ctx)
		var teachers []LeaderboardEntry
		if err = cursor.All(ctx, &teachers); err != nil {
			errChan <- err
			return
		}
		leaderboardChan <- teachers
	}()

	cursor, err := db.Collection(eventCollection).Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}
	defer cursor.Close(ctx)

	var events []Event
	if err = cursor.All(ctx, &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse events"})
		return
	}

	curTime := time.Now()
	currentEvents := make([]Event, 0)
	pastEvents := make([]Event, 0)
	upcomingEvents := make([]Event, 0)
	for _, e := range events {
		start, err1 := parseEventDateTime(e.StartDate, e.StartTime)
		end, err2 := parseEventDateTime(e.EndDate, e.EndTime)
		if err1 == nil && err2 == nil {
			if curTime.After(start) && curTime.Before(end) {
				currentEvents = append(currentEvents, e)
			} else if curTime.After(end) {
				pastEvents = append(pastEvents, e)
			} else if curTime.Before(start) {
				upcomingEvents = append(upcomingEvents, e)
			}
		}
	}
	dashboardResponse.CurrentEvents = currentEvents
	dashboardResponse.PastEvents = pastEvents
	dashboardResponse.UpcomingEvents = upcomingEvents

	// Wait for leaderboard results or an error
	select {
	case leaderboard := <-leaderboardChan:
		dashboardResponse.Leaderboard = leaderboard
	case err := <-errChan:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate leaderboard: " + err.Error()})
		return
	case <-ctx.Done():
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Request timed out"})
		return
	}

	c.JSON(http.StatusOK, dashboardResponse)
}

// func CreateEventFromExcel(c *gin.Context) {
// 	file, err := c.FormFile("excel_file")
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Excel file is required"})
// 		return
// 	}

// 	f, err := file.Open()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open the uploaded file"})
// 		return
// 	}
// 	defer f.Close()

// 	excelFile, err := excelize.OpenReader(f)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read the Excel file"})
// 		return
// 	}

// 	// --- 1. Parse and Create the Event ---
// 	eventName, _ := excelFile.GetCellValue("EventDetails", "B1")
// 	startDate, _ := excelFile.GetCellValue("EventDetails", "B2")
// 	startTime, _ := excelFile.GetCellValue("EventDetails", "B3")
// 	endDate, _ := excelFile.GetCellValue("EventDetails", "B4")
// 	endTime, _ := excelFile.GetCellValue("EventDetails", "B5")
// 	description, _ := excelFile.GetCellValue("EventDetails", "B6")

// 	if eventName == "" || startDate == "" || startTime == "" || endDate == "" || endTime == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Event details are incomplete. Ensure cells B1-B6 on the 'EventDetails' sheet are filled."})
// 		return
// 	}

// 	event := Event{
// 		ID:               primitive.NewObjectID(),
// 		Name:             eventName,
// 		StartDate:        startDate,
// 		StartTime:        startTime,
// 		EndDate:          endDate,
// 		EndTime:          endTime,
// 		Description:      description,
// 		Roles:            []RoleRef{},
// 		Assginedteachers: []RoleRef1{},
// 	}
// 	event.EventID = event.ID

// 	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second) // Increased timeout for more DB operations
// 	defer cancel()

// 	eventCollection := db.Collection(eventCollection)
// 	if _, err := eventCollection.InsertOne(ctx, event); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create the event in the database"})
// 		return
// 	}

// 	// --- 2. Parse Roles and Pre-assign Teachers ---
// 	rows, err := excelFile.GetRows("Roles")
// 	if err != nil || len(rows) <= 1 {
// 		c.JSON(http.StatusCreated, gin.H{
// 			"message": "Event created successfully without roles (or 'Roles' sheet was empty/missing).",
// 			"event":   event,
// 		})
// 		return
// 	}

// 	roleCollection := db.Collection(roleCollection)
// 	teacherCollection := db.Collection(teacherCollection)
// 	assignmentCollection := db.Collection(teacherAssignmentCollection)

// 	var createdRoles []Role
// 	var assignmentResults []string // To provide feedback on assignments

// 	// Start from index 1 to skip the header row
// 	for i, row := range rows[1:] {
// 		if len(row) == 0 || row[0] == "" {
// 			continue // Skip empty rows
// 		}

// 		// Safely access row data
// 		getCellValue := func(r []string, index int) string {
// 			if len(r) > index {
// 				return r[index]
// 			}
// 			return ""
// 		}

// 		roleName := getCellValue(row, 0)
// 		roleDescription := getCellValue(row, 1)
// 		headCount, _ := strconv.Atoi(getCellValue(row, 2))
// 		points, _ := strconv.Atoi(getCellValue(row, 3))
// 		teacherName := getCellValue(row, 4)
// 		teacherDept := getCellValue(row, 5)

// 		role := Role{
// 			ID:          primitive.NewObjectID(),
// 			EventID:     event.ID,
// 			EventName:   event.Name,
// 			Name:        roleName,
// 			Description: roleDescription,
// 			HeadCount:   headCount,
// 			Point:       points,
// 		}
// 		role.RoleID = role.ID

// 		if _, err := roleCollection.InsertOne(ctx, role); err != nil {
// 			assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: Failed to create role '%s'", i+2, roleName))
// 			continue // Skip to next role
// 		}
// 		createdRoles = append(createdRoles, role)
// 		event.Roles = append(event.Roles, RoleRef{ID: role.ID, Name: role.Name})

// 		// --- NEW: Logic to find and assign a teacher ---
// 		if teacherName != "" && teacherDept != "" {
// 			var teacherToAssign Teacher
// 			// Find the teacher by name and department for accuracy
// 			filter := bson.M{"name": teacherName, "departmentname": teacherDept}
// 			err := teacherCollection.FindOne(ctx, filter).Decode(&teacherToAssign)

// 			if err != nil {
// 				if err == mongo.ErrNoDocuments {
// 					assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: Teacher '%s' from '%s' not found. Role '%s' created without assignment.", i+2, teacherName, teacherDept, roleName))
// 				} else {
// 					assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: DB error finding teacher '%s': %v", i+2, teacherName, err))
// 				}
// 				continue // Go to the next role
// 			}

// 			// Teacher found, proceed with assignment
// 			assignment := Assignment{
// 				ID:            primitive.NewObjectID(),
// 				EventID:       event.ID,
// 				EventName:     event.Name,
// 				TeacherID:     teacherToAssign.ID,
// 				RoleID:        role.ID,
// 				RoleName:      role.Name,
// 				TeacherName:   teacherToAssign.Name,
// 				TeacherEmail:  teacherToAssign.Email,
// 				PointsAwarded: nil, // Initially nil, uses role.Point
// 			}
// 			assignment.AssignmentID = assignment.ID

// 			if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
// 				assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: Failed to create assignment for teacher '%s'.", i+2, teacherName))
// 				continue
// 			}

// 			// Update teacher's total points
// 			_, err = teacherCollection.UpdateOne(ctx, bson.M{"_id": teacherToAssign.ID}, bson.M{"$inc": bson.M{"point": role.Point}})
// 			if err != nil {
// 				// Log this error, as it's important but shouldn't stop the process
// 				fmt.Printf("Warning: Failed to update points for teacher %s: %v\n", teacherToAssign.Name, err)
// 			}

// 			// Add reference to the event's assigned teachers list
// 			event.Assginedteachers = append(event.Assginedteachers, RoleRef1{
// 				ID:            role.ID,
// 				RoleName:      role.Name,
// 				TeacherleName: teacherToAssign.Name,
// 				Assignment_ID: assignment.ID,
// 			})

// 			// Create a notification for the teacher
// 			createNotification(teacherToAssign.ID, event.ID, role.ID, assignment.ID, event.Name, role.Name, teacherToAssign.Name)

// 			assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: Successfully assigned teacher '%s' to role '%s'.", i+2, teacherName, roleName))
// 		}
// 	}

// 	// --- 3. Finalize Event Update ---
// 	// Update the event with all role references and successful teacher assignments
// 	update := bson.M{"$set": bson.M{"roles": event.Roles, "assginedteachers": event.Assginedteachers}}
// 	_, err = eventCollection.UpdateOne(ctx, bson.M{"_id": event.ID}, update)
// 	if err != nil {
// 		fmt.Printf("Warning: Final event update failed for event ID %s: %v\n", event.ID.Hex(), err)
// 	}

//		c.JSON(http.StatusCreated, gin.H{
//			"message":             "Event processing from Excel complete.",
//			"event_details":       event,
//			"created_roles_count": len(createdRoles),
//			"assignment_log":      assignmentResults,
//		})
//	}
//
// CreateEventFromExcel handles creating an event, its roles, and pre-assigning single or multiple teachers
// to roles based on the Excel file format.

func parseAndFormatDate(dateStr string) (string, error) {
	// Define common date layouts that Excel might output
	layouts := []string{
		"2006-01-02",          // YYYY-MM-DD
		"02-01-2006",          // DD-MM-YYYY
		"01/02/2006",          // MM/DD/YYYY
		"02/01/2006",          // DD/MM/YYYY
		"2006/01/02",          // YYYY/MM/DD
		"02-Jan-2006",         // DD-Mon-YYYY (e.g., 25-Oct-2026)
		"2-1-06",              // D-M-YY (e.g., 25-10-26) - assuming current century for '06'
		"02-01-06",            // DD-MM-YY
		"01/02/06",            // MM/DD/YY
		"01-02-06",            // MM-DD-YY  <--- ADD THIS LAYOUT
	}

	for _, layout := range layouts {
		t, err := time.Parse(layout, dateStr)
		if err == nil {
			// Successfully parsed, now format to YYYY-MM-DD
			return t.Format("2006-01-02"), nil
		}
	}
	return "", fmt.Errorf("could not parse date string '%s' with any known layout", dateStr)
}

// func CreateEventFromExcel(c *gin.Context) {
// 	file, err := c.FormFile("excel_file")
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Excel file is required"})
// 		return
// 	}

// 	f, err := file.Open()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open the uploaded file"})
// 		return
// 	}
// 	defer f.Close()

// 	excelFile, err := excelize.OpenReader(f)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read the Excel file"})
// 		return
// 	}

// 	// --- 1. Parse and Create the Event ---
// 	// eventName, _ := excelFile.GetCellValue("EventDetails", "B1")
// 	// startDate, _ := excelFile.GetCellValue("EventDetails", "B2")
// 	// startTime, _ := excelFile.GetCellValue("EventDetails", "B3")
// 	// endDate, _ := excelFile.GetCellValue("EventDetails", "B4")
// 	// endTime, _ := excelFile.GetCellValue("EventDetails", "B5")
// 	// description, _ := excelFile.GetCellValue("EventDetails", "B6")
// 	eventName, _ := excelFile.GetCellValue("EventDetails", "B1")
// 	rawStartDate, _ := excelFile.GetCellValue("EventDetails", "B2")
// 	startTime, _ := excelFile.GetCellValue("EventDetails", "B3")
// 	rawEndDate, _ := excelFile.GetCellValue("EventDetails", "B4")
// 	endTime, _ := excelFile.GetCellValue("EventDetails", "B5")
// 	description, _ := excelFile.GetCellValue("EventDetails", "B6")

// 	// NEW: Parse and format startDate
// 	formattedStartDate, err := parseAndFormatDate(rawStartDate)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid start date format: %v", err)})
// 		return
// 	}

// 	// NEW: Parse and format endDate
// 	formattedEndDate, err := parseAndFormatDate(rawEndDate)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid end date format: %v", err)})
// 		return
// 	}

// 	// if eventName == "" || startDate == "" || startTime == "" || endDate == "" || endTime == "" {
// 	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Event details are incomplete. Ensure cells B1-B6 on the 'EventDetails' sheet are filled."})
// 	// 	return
// 	// }
// 	if eventName == "" || formattedStartDate == "" || startTime == "" || formattedEndDate == "" || endTime == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Event details are incomplete. Ensure cells B1-B6 on the 'EventDetails' sheet are filled and dates are valid."})
// 		return
// 	}

// 	event := Event{
// 		ID:               primitive.NewObjectID(),
// 		Name:             eventName,
// 		StartDate:        formattedStartDate,
// 		StartTime:        startTime,
// 		EndDate:          formattedEndDate,
// 		EndTime:          endTime,
// 		Description:      description,
// 		Roles:            []RoleRef{},
// 		Assginedteachers: []RoleRef1{},
// 	}
// 	event.EventID = event.ID

// 	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second) // Increased timeout
// 	defer cancel()

// 	eventCollection := db.Collection(eventCollection)
// 	if _, err := eventCollection.InsertOne(ctx, event); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create the event in the database"})
// 		return
// 	}

// 	// --- 2. Parse Roles and Pre-assign Teachers ---
// 	rows, err := excelFile.GetRows("Roles")
// 	if err != nil || len(rows) <= 1 {
// 		c.JSON(http.StatusCreated, gin.H{
// 			"message": "Event created successfully without roles (or 'Roles' sheet was empty/missing).",
// 			"event":   event,
// 		})
// 		return
// 	}

// 	roleCollection := db.Collection(roleCollection)
// 	teacherCollection := db.Collection(teacherCollection)
// 	assignmentCollection := db.Collection(teacherAssignmentCollection)

// 	// NEW: Maps to track roles created during this import and their current assignment count
// 	createdRolesMap := make(map[string]Role)
// 	assignedCounts := make(map[primitive.ObjectID]int)
// 	var assignmentResults []string

// 	for i, row := range rows[1:] {
// 		if len(row) == 0 || row[0] == "" {
// 			continue // Skip empty rows
// 		}

// 		getCellValue := func(r []string, index int) string {
// 			if len(r) > index {
// 				return r[index]
// 			}
// 			return ""
// 		}

// 		roleName := getCellValue(row, 0)
// 		teacherName := getCellValue(row, 4)
// 		teacherDept := getCellValue(row, 5)

// 		var currentRole Role
// 		var ok bool

// 		// NEW: Check if we have already processed this role in a previous row
// 		if currentRole, ok = createdRolesMap[roleName]; !ok {
// 			// This is the first time we see this role name, so create it.
// 			roleDescription := getCellValue(row, 1)
// 			headCount, _ := strconv.Atoi(getCellValue(row, 2))
// 			points, _ := strconv.Atoi(getCellValue(row, 3))

// 			newRole := Role{
// 				ID:          primitive.NewObjectID(),
// 				EventID:     event.ID,
// 				EventName:   event.Name,
// 				Name:        roleName,
// 				Description: roleDescription,
// 				HeadCount:   headCount,
// 				Point:       points,
// 			}
// 			newRole.RoleID = newRole.ID

// 			if _, err := roleCollection.InsertOne(ctx, newRole); err != nil {
// 				assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: FAILED to create role '%s'. Skipping.", i+2, roleName))
// 				continue
// 			}

// 			// Store the newly created role in our map for future rows
// 			createdRolesMap[roleName] = newRole
// 			currentRole = newRole
// 			assignedCounts[currentRole.ID] = 0 // Initialize assignment count
// 			event.Roles = append(event.Roles, RoleRef{ID: currentRole.ID, Name: currentRole.Name})
// 		}

// 		// --- Proceed with Teacher Assignment ---
// 		if teacherName != "" && teacherDept != "" {
// 			// NEW: Check if the role's head count has been reached
// 			if assignedCounts[currentRole.ID] >= currentRole.HeadCount {
// 				assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: SKIPPED. Head count for role '%s' (%d) reached. Cannot assign '%s'.", i+2, roleName, currentRole.HeadCount, teacherName))
// 				continue
// 			}

// 			var teacherToAssign Teacher
// 			filter := bson.M{"name": teacherName, "departmentname": teacherDept}
// 			err := teacherCollection.FindOne(ctx, filter).Decode(&teacherToAssign)

// 			if err != nil {
// 				if err == mongo.ErrNoDocuments {
// 					assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: Teacher '%s' from '%s' not found. Role '%s' created but this assignment was skipped.", i+2, teacherName, teacherDept, roleName))
// 				} else {
// 					assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: DB error finding teacher '%s': %v", i+2, teacherName, err))
// 				}
// 				continue
// 			}

// 			// Teacher found, create the assignment
// 			assignment := Assignment{
// 				ID:           primitive.NewObjectID(),
// 				EventID:      event.ID,
// 				EventName:    event.Name,
// 				TeacherID:    teacherToAssign.ID,
// 				RoleID:       currentRole.ID,
// 				RoleName:     currentRole.Name,
// 				TeacherName:  teacherToAssign.Name,
// 				TeacherEmail: teacherToAssign.Email,
// 			}
// 			assignment.AssignmentID = assignment.ID

// 			if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
// 				assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: FAILED to create assignment for teacher '%s'.", i+2, teacherName))
// 				continue
// 			}

// 			_, _ = teacherCollection.UpdateOne(ctx, bson.M{"_id": teacherToAssign.ID}, bson.M{"$inc": bson.M{"point": currentRole.Point}})

// 			event.Assginedteachers = append(event.Assginedteachers, RoleRef1{
// 				ID:            currentRole.ID,
// 				RoleName:      currentRole.Name,
// 				TeacherleName: teacherToAssign.Name,
// 				Assignment_ID: assignment.ID,
// 			})

// 			createNotification(teacherToAssign.ID, event.ID, currentRole.ID, assignment.ID, event.Name, currentRole.Name, teacherToAssign.Name)

// 			// NEW: Increment the count for this role
// 			assignedCounts[currentRole.ID]++
// 			assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: SUCCESS. Assigned teacher '%s' to role '%s'. (Assigned %d of %d)", i+2, teacherName, roleName, assignedCounts[currentRole.ID], currentRole.HeadCount))
// 		}
// 	}

// 	// --- 3. Finalize Event Update ---
// 	update := bson.M{"$set": bson.M{"roles": event.Roles, "assginedteachers": event.Assginedteachers}}
// 	_, err = eventCollection.UpdateOne(ctx, bson.M{"_id": event.ID}, update)
// 	if err != nil {
// 		fmt.Printf("Warning: Final event update failed for event ID %s: %v\n", event.ID.Hex(), err)
// 	}

// 	c.JSON(http.StatusCreated, gin.H{
// 		"message":        "Event processing from Excel complete.",
// 		"event_details":  event,
// 		"assignment_log": assignmentResults,
// 	})
// }


func CreateEventFromExcel(c *gin.Context) {
	file, err := c.FormFile("excel_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Excel file is required"})
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open the uploaded file"})
		return
	}
	defer f.Close()

	excelFile, err := excelize.OpenReader(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read the Excel file"})
		return
	}

	// --- 1. Parse and Create the Event ---
	eventName, _ := excelFile.GetCellValue("EventDetails", "B1")
	rawStartDate, _ := excelFile.GetCellValue("EventDetails", "B2")
	// StartTime (B3) and EndTime (B5) are no longer read from Excel and will be defaulted.
	rawEndDate, _ := excelFile.GetCellValue("EventDetails", "B3")
	description, _ := excelFile.GetCellValue("EventDetails", "B4")

	// Parse and format startDate
	formattedStartDate, err := parseAndFormatDate(rawStartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid start date format: %v", err)})
		return
	}

	// Parse and format endDate
	formattedEndDate, err := parseAndFormatDate(rawEndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid end date format: %v", err)})
		return
	}

	// Adjusted condition to remove startTime and endTime checks, as they are now defaulted
	if eventName == "" || formattedStartDate == "" || formattedEndDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Event details are incomplete. Ensure cells B1-B6 on the 'EventDetails' sheet are filled and dates are valid."})
		return
	}

	event := Event{
		ID:        primitive.NewObjectID(),
		Name:      eventName,
		StartDate: formattedStartDate,
		// Default StartTime to "00:00" (12 AM)
		StartTime: "00:00",
		EndDate:   formattedEndDate,
		// Default EndTime to "00:00" (as per "00 defaultly" request)
		// Note: Setting both StartTime and EndTime to "00:00" effectively means the event is considered to be at midnight, with zero duration.
		// If a full-day event is intended, consider setting EndTime to "23:59".
		EndTime:          "00:00",
		Description:      description,
		Roles:            []RoleRef{},
		Assginedteachers: []RoleRef1{},
	}
	event.EventID = event.ID

	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second) // Increased timeout
	defer cancel()

	eventCollection := db.Collection(eventCollection)
	if _, err := eventCollection.InsertOne(ctx, event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create the event in the database"})
		return
	}

	// --- 2. Parse Roles and Pre-assign Teachers ---
	rows, err := excelFile.GetRows("Roles")
	if err != nil || len(rows) <= 1 {
		c.JSON(http.StatusCreated, gin.H{
			"message": "Event created successfully without roles (or 'Roles' sheet was empty/missing).",
			"event":   event,
		})
		return
	}

	// NEW: First pass to calculate HeadCount for each role based on occurrences
	roleHeadCounts := make(map[string]int)
	for _, row := range rows[1:] {
		if len(row) > 0 && row[0] != "" {
			roleName := row[0]
			roleHeadCounts[roleName]++
		}
	}

	roleCollection := db.Collection(roleCollection)
	teacherCollection := db.Collection(teacherCollection)
	assignmentCollection := db.Collection(teacherAssignmentCollection)

	// NEW: Maps to track roles created during this import and their current assignment count
	createdRolesMap := make(map[string]Role)
	assignedCounts := make(map[primitive.ObjectID]int)
	var assignmentResults []string

	for i, row := range rows[1:] {
		if len(row) == 0 || row[0] == "" {
			continue // Skip empty rows
		}

		getCellValue := func(r []string, index int) string {
			if len(r) > index {
				return r[index]
			}
			return ""
		}

		roleName := getCellValue(row, 0)
		teacherName := getCellValue(row, 3)
		teacherDept := getCellValue(row, 4)
		// teacherName := getCellValue(row, 4)
		// teacherDept := getCellValue(row, 5)

		var currentRole Role
		var ok bool

		// NEW: Check if we have already processed this role in a previous row
		if currentRole, ok = createdRolesMap[roleName]; !ok {
			// This is the first time we see this role name, so create it.
			roleDescription := getCellValue(row, 1)
			// HeadCount is now derived from roleHeadCounts, not read from column C (index 2)
			points, _ := strconv.Atoi(getCellValue(row, 2)) // Points are still read from column D (index 3)

			newRole := Role{
				ID:          primitive.NewObjectID(),
				EventID:     event.ID,
				EventName:   event.Name,
				Name:        roleName,
				Description: roleDescription,
				HeadCount:   roleHeadCounts[roleName], // HeadCount calculated from occurrences
				Point:       points,
			}
			newRole.RoleID = newRole.ID

			if _, err := roleCollection.InsertOne(ctx, newRole); err != nil {
				assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: FAILED to create role '%s'. Skipping.", i+2, roleName))
				continue
			}

			// Store the newly created role in our map for future rows
			createdRolesMap[roleName] = newRole
			currentRole = newRole
			assignedCounts[currentRole.ID] = 0 // Initialize assignment count
			event.Roles = append(event.Roles, RoleRef{ID: currentRole.ID, Name: currentRole.Name})
		}

		// --- Proceed with Teacher Assignment ---
		if teacherName != "" && teacherDept != "" {
			// NEW: Check if the role's head count has been reached
			if assignedCounts[currentRole.ID] >= currentRole.HeadCount {
				assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: SKIPPED. Head count for role '%s' (%d) reached. Cannot assign '%s'.", i+2, roleName, currentRole.HeadCount, teacherName))
				continue
			}

			var teacherToAssign Teacher
			filter := bson.M{"name": teacherName, "departmentname": teacherDept}
			err := teacherCollection.FindOne(ctx, filter).Decode(&teacherToAssign)

			if err != nil {
				if err == mongo.ErrNoDocuments {
					assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: Teacher '%s' from '%s' not found. Role '%s' created but this assignment was skipped.", i+2, teacherName, teacherDept, roleName))
				} else {
					assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: DB error finding teacher '%s': %v", i+2, teacherName, err))
				}
				continue
			}

			// Teacher found, create the assignment
			assignment := Assignment{
				ID:           primitive.NewObjectID(),
				EventID:      event.ID,
				EventName:    event.Name,
				TeacherID:    teacherToAssign.ID,
				RoleID:       currentRole.ID,
				RoleName:     currentRole.Name,
				TeacherName:  teacherToAssign.Name,
				TeacherEmail: teacherToAssign.Email,
			}
			assignment.AssignmentID = assignment.ID

			if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
				assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: FAILED to create assignment for teacher '%s'.", i+2, teacherName))
				continue
			}

			_, _ = teacherCollection.UpdateOne(ctx, bson.M{"_id": teacherToAssign.ID}, bson.M{"$inc": bson.M{"point": currentRole.Point}})

			event.Assginedteachers = append(event.Assginedteachers, RoleRef1{
				ID:            currentRole.ID,
				RoleName:      currentRole.Name,
				TeacherleName: teacherToAssign.Name,
				Assignment_ID: assignment.ID,
			})

			createNotification(teacherToAssign.ID, event.ID, currentRole.ID, assignment.ID, event.Name, currentRole.Name, teacherToAssign.Name)

			// NEW: Increment the count for this role
			assignedCounts[currentRole.ID]++
			assignmentResults = append(assignmentResults, fmt.Sprintf("Row %d: SUCCESS. Assigned teacher '%s' to role '%s'. (Assigned %d of %d)", i+2, teacherName, roleName, assignedCounts[currentRole.ID], currentRole.HeadCount))
		}
	}

	// --- 3. Finalize Event Update ---
	update := bson.M{"$set": bson.M{"roles": event.Roles, "assginedteachers": event.Assginedteachers}}
	_, err = eventCollection.UpdateOne(ctx, bson.M{"_id": event.ID}, update)
	if err != nil {
		fmt.Printf("Warning: Final event update failed for event ID %s: %v\n", event.ID.Hex(), err)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":        "Event processing from Excel complete.",
		"event_details":  event,
		"assignment_log": assignmentResults,
	})
}

// AutoAssignLowestPointTeacherToRole finds an available teacher with the lowest points
// and assigns them to the specified role in an event.

// func AutoAssignLowestPointTeacherToRole(c *gin.Context) {
// 	eventID, err := primitive.ObjectIDFromHex(c.Param("eventid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
// 		return
// 	}
// 	roleID, err := primitive.ObjectIDFromHex(c.Param("roleid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID format"})
// 		return
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
// 	defer cancel()

// 	// Step 1: Get all assignments for this role to find out who is already assigned.
// 	assignmentCollection := db.Collection(teacherAssignmentCollection)
// 	assignedCursor, err := assignmentCollection.Find(ctx, bson.M{"event_id": eventID, "role_id": roleID})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve existing assignments"})
// 		return
// 	}
// 	var assignedTeachers []Assignment
// 	if err := assignedCursor.All(ctx, &assignedTeachers); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode existing assignments"})
// 		return
// 	}

// 	assignedTeacherIDs := make(map[primitive.ObjectID]bool)
// 	for _, assignment := range assignedTeachers {
// 		assignedTeacherIDs[assignment.TeacherID] = true
// 	}

// 	// Step 2: Find the teacher with the lowest points who is not already assigned.
// 	teacherCollection := db.Collection(teacherCollection)
// 	// We filter by teachers whose ID is "not in" the list of already assigned IDs.
// 	// findOptions := options.FindOne().SetSort(bson.D{{"point", 1}}) // 1 for ascending order
// 	findOptions := options.FindOne().SetSort(bson.D{{Key: "point", Value: 1}}) // 1 for ascending order

// 	var teacherToAssign Teacher
// 	err = teacherCollection.FindOne(ctx, bson.M{"_id": bson.M{"$nin": maps.Keys(assignedTeacherIDs)}}, findOptions).Decode(&teacherToAssign)
// 	if err != nil {
// 		if err == mongo.ErrNoDocuments {
// 			c.JSON(http.StatusNotFound, gin.H{"error": "No available teachers to assign"})
// 			return
// 		}
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find a teacher to assign"})
// 		return
// 	}

// 	// Step 3: Use the existing assignment logic to assign the found teacher.
// 	// This reuses the logic from your AssignTeacherToRole function.

// 	// Fetch role and event details for the assignment
// 	var role Role
// 	if err := db.Collection(roleCollection).FindOne(ctx, bson.M{"_id": roleID}).Decode(&role); err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
// 		return
// 	}

// 	var event Event
// 	if err := db.Collection(eventCollection).FindOne(ctx, bson.M{"_id": eventID}).Decode(&event); err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
// 		return
// 	}

// 	// Check head count before assigning
// 	if len(assignedTeachers) >= role.HeadCount {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Role has reached its maximum head count"})
// 		return
// 	}

// 	assignment := Assignment{
// 		ID:           primitive.NewObjectID(),
// 		EventID:      eventID,
// 		EventName:    event.Name,
// 		TeacherID:    teacherToAssign.ID,
// 		RoleID:       roleID,
// 		RoleName:     role.Name,
// 		TeacherName:  teacherToAssign.Name,
// 		TeacherEmail: teacherToAssign.Email,
// 	}
// 	assignment.AssignmentID = assignment.ID

// 	if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
// 		return
// 	}

// 	if _, err := teacherCollection.UpdateOne(ctx, bson.M{"_id": teacherToAssign.ID}, bson.M{"$inc": bson.M{"point": role.Point}}); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update teacher points"})
// 		return
// 	}

// 	roleRef := RoleRef1{ID: roleID, RoleName: role.Name, TeacherleName: teacherToAssign.Name, Assignment_ID: assignment.ID}
// 	if _, err := db.Collection(eventCollection).UpdateOne(ctx, bson.M{"_id": eventID}, bson.M{"$push": bson.M{"assginedteachers": roleRef}}); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event's assigned teachers"})
// 		return
// 	}

// 	if err := createNotification(teacherToAssign.ID, eventID, roleID, assignment.ID, event.Name, role.Name, teacherToAssign.Name); err != nil {
// 		fmt.Printf("Failed to create notification: %v\n", err)
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message":          "Successfully auto-assigned teacher with the lowest points.",
// 		"assigned_teacher": teacherToAssign.Name,
// 		"assignment":       assignment,
// 	})
// }

// AutoAssignLowestPointTeacherToRole finds an available teacher with the lowest points
// and assigns them to the specified role in an event.

// func AutoAssignLowestPointTeacherToRole(c *gin.Context) {
// 	eventID, err := primitive.ObjectIDFromHex(c.Param("eventid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
// 		return
// 	}
// 	roleID, err := primitive.ObjectIDFromHex(c.Param("roleid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID format"})
// 		return
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
// 	defer cancel()

// 	// Step 1: Get all assignments for this role to find out who is already assigned.
// 	assignmentCollection := db.Collection(teacherAssignmentCollection)
// 	assignedCursor, err := assignmentCollection.Find(ctx, bson.M{"event_id": eventID, "role_id": roleID})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve existing assignments"})
// 		return
// 	}
// 	var assignedTeachers []Assignment
// 	if err := assignedCursor.All(ctx, &assignedTeachers); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode existing assignments"})
// 		return
// 	}

// 	// SOLUTION 1: Build a slice of ObjectIDs directly. This is more robust than using maps.Keys().
// 	// Initialize as a non-nil empty slice to avoid issues with the $nin operator.
// 	assignedTeacherIDs := make([]primitive.ObjectID, 0)
// 	for _, assignment := range assignedTeachers {
// 		assignedTeacherIDs = append(assignedTeacherIDs, assignment.TeacherID)
// 	}

// 	// Step 2: Find the teacher with the lowest points who is not already assigned.
// 	teacherCollection := db.Collection(teacherCollection)
// 	findOptions := options.FindOne().SetSort(bson.D{{Key: "point", Value: 1}}) // 1 for ascending order

// 	var teacherToAssign Teacher
// 	// Use the assignedTeacherIDs slice directly in the query.
// 	err = teacherCollection.FindOne(ctx, bson.M{"_id": bson.M{"$nin": assignedTeacherIDs}}, findOptions).Decode(&teacherToAssign)
// 	if err != nil {
// 		if err == mongo.ErrNoDocuments {
// 			c.JSON(http.StatusNotFound, gin.H{"error": "No available teachers to assign. They may all be assigned already."})
// 			return
// 		}
// 		// SOLUTION 2: Add the actual database error to the response for better debugging.
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find a teacher to assign: " + err.Error()})
// 		return
// 	}

// 	// Step 3: Use the existing assignment logic to assign the found teacher.
// 	var role Role
// 	if err := db.Collection(roleCollection).FindOne(ctx, bson.M{"_id": roleID}).Decode(&role); err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
// 		return
// 	}

// 	var event Event
// 	if err := db.Collection(eventCollection).FindOne(ctx, bson.M{"_id": eventID}).Decode(&event); err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
// 		return
// 	}

// 	// Check head count before assigning
// 	if len(assignedTeachers) >= role.HeadCount {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Role has reached its maximum head count"})
// 		return
// 	}

// 	assignment := Assignment{
// 		ID:           primitive.NewObjectID(),
// 		EventID:      eventID,
// 		EventName:    event.Name,
// 		TeacherID:    teacherToAssign.ID,
// 		RoleID:       roleID,
// 		RoleName:     role.Name,
// 		TeacherName:  teacherToAssign.Name,
// 		TeacherEmail: teacherToAssign.Email,
// 	}
// 	assignment.AssignmentID = assignment.ID

// 	if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
// 		return
// 	}

// 	if _, err := teacherCollection.UpdateOne(ctx, bson.M{"_id": teacherToAssign.ID}, bson.M{"$inc": bson.M{"point": role.Point}}); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update teacher points"})
// 		return
// 	}

// 	roleRef := RoleRef1{ID: roleID, RoleName: role.Name, TeacherleName: teacherToAssign.Name, Assignment_ID: assignment.ID}
// 	if _, err := db.Collection(eventCollection).UpdateOne(ctx, bson.M{"_id": eventID}, bson.M{"$push": bson.M{"assginedteachers": roleRef}}); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event's assigned teachers"})
// 		return
// 	}

// 	if err := createNotification(teacherToAssign.ID, eventID, roleID, assignment.ID, event.Name, role.Name, teacherToAssign.Name); err != nil {
// 		fmt.Printf("Failed to create notification: %v\n", err)
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"message":          "Successfully auto-assigned teacher with the lowest points.",
// 		"assigned_teacher": teacherToAssign.Name,
// 		"assignment":       assignment,
// 	})
// }

// AutoAssignLowestPointTeacherToRole finds and assigns a specified number of available teachers
// with the lowest points to a given role.

// func AutoAssignLowestPointTeacherToRole(c *gin.Context) {
// 	// --- 1. Get IDs and Request Body ---
// 	eventID, err := primitive.ObjectIDFromHex(c.Param("eventid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
// 		return
// 	}
// 	roleID, err := primitive.ObjectIDFromHex(c.Param("roleid"))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID format"})
// 		return
// 	}

// 	type AutoAssignRequest struct {
// 		Count int `json:"count" binding:"required"`
// 	}
// 	var req AutoAssignRequest
// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body. 'count' is required."})
// 		return
// 	}

// 	if req.Count <= 0 {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Count must be a positive number."})
// 		return
// 	}

// 	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second) // Increased timeout for bulk operations
// 	defer cancel()

// 	// --- 2. Get Initial State (Role Details and Current Assignments) ---
// 	var role Role
// 	if err := db.Collection(roleCollection).FindOne(ctx, bson.M{"_id": roleID}).Decode(&role); err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
// 		return
// 	}

// 	assignmentCollection := db.Collection(teacherAssignmentCollection)
// 	assignedCursor, err := assignmentCollection.Find(ctx, bson.M{"role_id": roleID})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve existing assignments"})
// 		return
// 	}
// 	var assignedTeachers []Assignment
// 	if err := assignedCursor.All(ctx, &assignedTeachers); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode existing assignments"})
// 		return
// 	}

// 	// --- 3. Determine How Many Teachers to Find ---
// 	availableSlots := role.HeadCount - len(assignedTeachers)
// 	if availableSlots <= 0 {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Role has already reached its maximum head count"})
// 		return
// 	}

// 	teachersToFind := req.Count
// 	if req.Count > availableSlots {
// 		teachersToFind = availableSlots // Don't find more teachers than there are slots
// 	}

// 	// --- 4. Find Available Teachers ---
// 	assignedTeacherIDs := make([]primitive.ObjectID, 0)
// 	for _, assignment := range assignedTeachers {
// 		assignedTeacherIDs = append(assignedTeacherIDs, assignment.TeacherID)
// 	}

// 	teacherCollection := db.Collection(teacherCollection)
// 	findOptions := options.Find().SetSort(bson.D{{Key: "point", Value: 1}}).SetLimit(int64(teachersToFind))

// 	teacherCursor, err := teacherCollection.Find(ctx, bson.M{"_id": bson.M{"$nin": assignedTeacherIDs}}, findOptions)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query for available teachers: " + err.Error()})
// 		return
// 	}
// 	var teachersToAssign []Teacher
// 	if err = teacherCursor.All(ctx, &teachersToAssign); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode available teachers: " + err.Error()})
// 		return
// 	}

// 	if len(teachersToAssign) == 0 {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "No available teachers found to assign."})
// 		return
// 	}

// 	// --- 5. Loop and Assign Each Teacher ---
// 	var event Event
// 	if err := db.Collection(eventCollection).FindOne(ctx, bson.M{"_id": eventID}).Decode(&event); err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found during assignment phase"})
// 		return
// 	}

// 	var successfulAssignments []string
// 	for _, teacher := range teachersToAssign {
// 		assignment := Assignment{
// 			ID:           primitive.NewObjectID(),
// 			EventID:      eventID,
// 			EventName:    event.Name,
// 			TeacherID:    teacher.ID,
// 			RoleID:       roleID,
// 			RoleName:     role.Name,
// 			TeacherName:  teacher.Name,
// 			TeacherEmail: teacher.Email,
// 		}
// 		assignment.AssignmentID = assignment.ID

// 		if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
// 			fmt.Printf("Failed to create assignment for teacher %s: %v\n", teacher.Name, err)
// 			continue // Skip to the next teacher if this one fails
// 		}

// 		// Use goroutines for non-critical updates to speed up the process
// 		go func(t Teacher) {
// 			_, _ = teacherCollection.UpdateOne(context.Background(), bson.M{"_id": t.ID}, bson.M{"$inc": bson.M{"point": role.Point}})
// 			roleRef := RoleRef1{ID: roleID, RoleName: role.Name, TeacherleName: t.Name, Assignment_ID: assignment.ID}
// 			_, _ = db.Collection(eventCollection).UpdateOne(context.Background(), bson.M{"_id": eventID}, bson.M{"$push": bson.M{"assginedteachers": roleRef}})
// 			_ = createNotification(t.ID, eventID, roleID, assignment.ID, event.Name, role.Name, t.Name)
// 		}(teacher)

// 		successfulAssignments = append(successfulAssignments, teacher.Name)
// 	}

//		c.JSON(http.StatusOK, gin.H{
//			"message":           fmt.Sprintf("Successfully assigned %d teacher(s).", len(successfulAssignments)),
//			"assigned_count":    len(successfulAssignments),
//			"assigned_teachers": successfulAssignments,
//		})
//	}
//
// AutoAssignLowestPointTeacherToRole finds and assigns a specified number of available teachers
// with the lowest points to a given role, ensuring no duplicates within the same event role.
func AutoAssignLowestPointTeacherToRole(c *gin.Context) {
	// --- 1. Get IDs and Request Body ---
	eventID, err := primitive.ObjectIDFromHex(c.Param("eventid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
		return
	}
	roleID, err := primitive.ObjectIDFromHex(c.Param("roleid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID format"})
		return
	}

	type AutoAssignRequest struct {
		Count int `json:"count" binding:"required"`
	}
	var req AutoAssignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body. 'count' is required."})
		return
	}

	if req.Count <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Count must be a positive number."})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second) // Increased timeout for bulk operations
	defer cancel()

	// --- 2. Get Initial State (Role Details and Current Assignments for THIS event) ---
	var role Role
	if err := db.Collection(roleCollection).FindOne(ctx, bson.M{"_id": roleID}).Decode(&role); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	assignmentCollection := db.Collection(teacherAssignmentCollection)

	// CORRECTED LINE: The query now checks for assignments to this role IN THIS SPECIFIC EVENT.
	// This is the key fix to prevent duplicates correctly.
	assignedCursor, err := assignmentCollection.Find(ctx, bson.M{"role_id": roleID, "event_id": eventID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve existing assignments"})
		return
	}
	var existingAssignments []Assignment
	if err := assignedCursor.All(ctx, &existingAssignments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode existing assignments"})
		return
	}

	// --- 3. Determine How Many Teachers to Find ---
	availableSlots := role.HeadCount - len(existingAssignments)
	if availableSlots <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role has already reached its maximum head count"})
		return
	}

	teachersToFind := req.Count
	if req.Count > availableSlots {
		teachersToFind = availableSlots // Don't find more teachers than there are slots
	}

	// --- 4. Find Available Teachers (who are not already assigned to this role in this event) ---
	assignedTeacherIDs := make([]primitive.ObjectID, 0)
	for _, assignment := range existingAssignments {
		assignedTeacherIDs = append(assignedTeacherIDs, assignment.TeacherID)
	}

	teacherCollection := db.Collection(teacherCollection)
	findOptions := options.Find().SetSort(bson.D{{Key: "point", Value: 1}}).SetLimit(int64(teachersToFind))

	teacherCursor, err := teacherCollection.Find(ctx, bson.M{"_id": bson.M{"$nin": assignedTeacherIDs}}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query for available teachers: " + err.Error()})
		return
	}
	var teachersToAssign []Teacher
	if err = teacherCursor.All(ctx, &teachersToAssign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode available teachers: " + err.Error()})
		return
	}

	if len(teachersToAssign) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No available teachers found to assign."})
		return
	}

	// --- 5. Loop and Assign Each Teacher ---
	var event Event
	if err := db.Collection(eventCollection).FindOne(ctx, bson.M{"_id": eventID}).Decode(&event); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found during assignment phase"})
		return
	}

	var successfulAssignments []string
	for _, teacher := range teachersToAssign {
		assignment := Assignment{
			ID:           primitive.NewObjectID(),
			EventID:      eventID,
			EventName:    event.Name,
			TeacherID:    teacher.ID,
			RoleID:       roleID,
			RoleName:     role.Name,
			TeacherName:  teacher.Name,
			TeacherEmail: teacher.Email,
		}
		assignment.AssignmentID = assignment.ID

		if _, err := assignmentCollection.InsertOne(ctx, assignment); err != nil {
			fmt.Printf("Failed to create assignment for teacher %s: %v\n", teacher.Name, err)
			continue // Skip to the next teacher if this one fails
		}

		// Use goroutines for non-critical updates to speed up the process
		go func(t Teacher) {
			bgCtx := context.Background()
			_, _ = teacherCollection.UpdateOne(bgCtx, bson.M{"_id": t.ID}, bson.M{"$inc": bson.M{"point": role.Point}})
			roleRef := RoleRef1{ID: roleID, RoleName: role.Name, TeacherleName: t.Name, Assignment_ID: assignment.ID}
			_, _ = db.Collection(eventCollection).UpdateOne(bgCtx, bson.M{"_id": eventID}, bson.M{"$push": bson.M{"assginedteachers": roleRef}})
			_ = createNotification(t.ID, eventID, roleID, assignment.ID, event.Name, role.Name, t.Name)
		}(teacher)

		successfulAssignments = append(successfulAssignments, teacher.Name)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           fmt.Sprintf("Successfully assigned %d teacher(s).", len(successfulAssignments)),
		"assigned_count":    len(successfulAssignments),
		"assigned_teachers": successfulAssignments,
	})
}

// func GetAllAssignments(c *gin.Context) {
// 	// Set a timeout for the database operation to prevent it from running indefinitely.
// 	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
// 	defer cancel()

// 	// Access the collection for teacher assignments.
// 	assignmentCollection := db.Collection(teacherAssignmentCollection)

// 	// An empty bson.M{} filter will match all documents in the collection. [1, 2]
// 	cursor, err := assignmentCollection.Find(ctx, bson.M{})
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments from the database"})
// 		return
// 	}
// 	defer cursor.Close(ctx)

// 	// A slice to hold the results.
// 	var assignments []Assignment

// 	// Decode all documents found by the cursor into the 'assignments' slice. [2]
// 	if err := cursor.All(ctx, &assignments); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode assignments"})
// 		return
// 	}

// 	// If no assignments are found, return an empty array instead of null for JSON compatibility.
// 	if assignments == nil {
// 		assignments = []Assignment{}
// 	}

// 	// Return the slice of assignments with a 200 OK status.
// 	c.JSON(http.StatusOK, assignments)
// }
// In your main.go file, replace the existing GetAllAssignments function with this one.

// GetAllAssignments now joins role data to include the default role points.
func GetAllAssignments(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	assignmentCollection := db.Collection(teacherAssignmentCollection)

	pipeline := mongo.Pipeline{
		{{"$lookup", bson.M{
			"from":         roleCollection,
			"localField":   "role_id",
			"foreignField": "_id",
			"as":           "roleDetails",
		}}},
		{{"$unwind", bson.M{
			"path":                       "$roleDetails",
			"preserveNullAndEmptyArrays": true,
		}}},
		{{"$project", bson.M{
			"_id":           1,
			"assignment_id": 1,
			"event_id":      1,
			"eventname":     1,
			"teacher_id":    1,
			"role_id":       1,
			"rolename":      1,
			"teachername":   1,
			"teacheremail":  1,
			"points_awarded": bson.M{
				"$ifNull": []interface{}{
					"$points_awarded",
					"$roleDetails.point",
				},
			},
		}}},
	}

	cursor, err := assignmentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch and process assignments"})
		return
	}
	defer cursor.Close(ctx)

	var assignmentsWithPoints []Assignment
	if err := cursor.All(ctx, &assignmentsWithPoints); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode assignments"})
		return
	}

	if assignmentsWithPoints == nil {
		assignmentsWithPoints = []Assignment{}
	}

	c.JSON(http.StatusOK, assignmentsWithPoints)
}

func DeleteRole(c *gin.Context) {
	// Define a struct for the optional request body.
	type DeleteRoleRequest struct {
		DeductPoints bool `json:"deduct_points"`
	}

	// 1. Get Role ID from the URL parameter.
	roleIDStr := c.Param("id")
	roleID, err := primitive.ObjectIDFromHex(roleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role ID format"})
		return
	}

	// 2. Bind the optional JSON body. An empty body is acceptable and will result in DeductPoints being false.
	var req DeleteRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil && err.Error() != "EOF" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// 3. Set up a context with a timeout for the database operations.
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	// Define collection helpers.
	roleCollection := db.Collection(roleCollection)
	assignmentCollection := db.Collection(teacherAssignmentCollection)
	teacherCollection := db.Collection(teacherCollection)
	eventCollection := db.Collection(eventCollection)

	// 4. Find the role first to ensure it exists and to get its details.
	var roleToDelete Role
	if err := roleCollection.FindOne(ctx, bson.M{"_id": roleID}).Decode(&roleToDelete); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error finding role: " + err.Error()})
		}
		return
	}

	// 5. If requested, deduct points from all assigned teachers.
	if req.DeductPoints {
		// Find all assignments for this role.
		cursor, err := assignmentCollection.Find(ctx, bson.M{"role_id": roleID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve assignments for point deduction"})
			return
		}
		var assignmentsToDelete []Assignment
		if err = cursor.All(ctx, &assignmentsToDelete); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode assignments for point deduction"})
			return
		}

		// Loop through each assignment and deduct points from the corresponding teacher.
		for _, assignment := range assignmentsToDelete {
			pointsToDeduct := 0
			if assignment.PointsAwarded != nil {
				pointsToDeduct = *assignment.PointsAwarded // Prioritize custom points.
			} else {
				pointsToDeduct = roleToDelete.Point // Fallback to role's default points.
			}

			if pointsToDeduct != 0 {
				_, err := teacherCollection.UpdateOne(
					ctx,
					bson.M{"_id": assignment.TeacherID},
					bson.M{"$inc": bson.M{"point": -pointsToDeduct}},
				)
				if err != nil {
					// Log a warning but continue the process, as this is not a fatal error for the deletion itself.
					fmt.Printf("Warning: Failed to deduct points for teacher %s during role deletion: %v\n", assignment.TeacherID.Hex(), err)
				}
			}
		}
	}

	// 6. Delete all teacher assignments associated with this role.
	if _, err := assignmentCollection.DeleteMany(ctx, bson.M{"role_id": roleID}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete associated teacher assignments"})
		return
	}

	// 7. Remove the role's reference from the parent event's arrays.
	updateEventPayload := bson.M{
		"$pull": bson.M{
			"roles":            bson.M{"id": roleID},
			"assginedteachers": bson.M{"id": roleID}, // Assuming 'id' in assginedteachers refers to the role ID.
		},
	}
	if _, err := eventCollection.UpdateOne(ctx, bson.M{"_id": roleToDelete.EventID}, updateEventPayload); err != nil {
		// This is not critical enough to halt the process, but it's good to know if it fails.
		fmt.Printf("Warning: Failed to pull role references from event %s during role deletion: %v\n", roleToDelete.EventID.Hex(), err)
	}

	// 8. Delete the role document itself.
	if _, err := roleCollection.DeleteOne(ctx, bson.M{"_id": roleID}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete the role"})
		return
	}

	// 9. Send a final success response.
	c.JSON(http.StatusOK, gin.H{
		"message":         "Role and all associated data deleted successfully",
		"deducted_points": req.DeductPoints,
	})
}
