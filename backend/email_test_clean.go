package main

import (
	"fmt"
	"log"

	"aiicg-backend/internal/config"
	"aiicg-backend/internal/services"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(".env"); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}

	// Load configuration
	cfg := config.Load()

	// Create email service
	emailService := services.NewEmailService(cfg.ResendAPIKey, cfg.EmailFrom)

	// Test email sending
	fmt.Println("Testing email service...")
	fmt.Printf("Sending test email to: ranerhash@gmail.com\n")
	fmt.Printf("Using API Key: %s...\n", cfg.ResendAPIKey[:10])

	err := emailService.SendVerificationEmail("ranerhash@gmail.com", "TestUser")
	if err != nil {
		log.Fatalf("Failed to send email: %v", err)
	}

	fmt.Println("Test email sent successfully!")
	fmt.Println("Please check your email inbox (ranerhash@gmail.com)")
	fmt.Println("The email should contain a 6-digit verification code")
}
