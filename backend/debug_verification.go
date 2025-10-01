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

	fmt.Println("=== Debug Verification Code System ===")

	// Step 1: Send verification email
	fmt.Println("Step 1: Sending verification email...")
	err := emailService.SendVerificationEmail("ranerhash@gmail.com", "DebugUser")
	if err != nil {
		log.Fatalf("Failed to send email: %v", err)
	}
	fmt.Println("✅ Verification email sent")

	// Step 2: Try to verify with a test code
	fmt.Println("\nStep 2: Testing verification with wrong code...")
	err = emailService.VerifyCode("ranerhash@gmail.com", "000000")
	if err != nil {
		fmt.Printf("❌ Expected error: %v\n", err)
	} else {
		fmt.Println("❌ Unexpected success with wrong code")
	}

	// Step 3: Check what codes are stored (this requires modifying the service)
	fmt.Println("\nStep 3: Debug complete")
	fmt.Println("Please check your email for the verification code")
	fmt.Println("The verification code should be valid for 5 minutes")
}
