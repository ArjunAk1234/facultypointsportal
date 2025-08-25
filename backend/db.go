package main

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func initMongoDB() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Replace with your MongoDB connection string
	clientOptions := options.Client().ApplyURI(
		"mongodb+srv://userpoint1:teacherportal@cluster0.4jvpwwj.mongodb.net/?retryWrites=true&w=majority&appName=pointportal",
	)
	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	}

	db = client.Database("schoolEvents") // Replace with your database name
	return nil
}
