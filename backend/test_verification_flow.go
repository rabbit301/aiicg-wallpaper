package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"

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

	// Create debug email service
	emailService := services.NewEmailServiceDebug(cfg.ResendAPIKey, cfg.EmailFrom)

	fmt.Println("=== AIICG Wallpaper - Email Verification Test ===")
	fmt.Println()

	// Step 1: Send verification email
	email := "ranerhash@gmail.com"
	username := "TestUser"

	fmt.Printf("Step 1: Sending verification email to %s...\n", email)
	err := emailService.SendVerificationEmail(email, username)
	if err != nil {
		log.Fatalf("Failed to send email: %v", err)
	}
	fmt.Println("✅ Verification email sent successfully!")
	fmt.Println()

	// Step 2: Wait for user input
	fmt.Println("Step 2: Please check your email and enter the 6-digit verification code:")
	fmt.Print("Verification Code: ")

	reader := bufio.NewReader(os.Stdin)
	input, err := reader.ReadString('\n')
	if err != nil {
		log.Fatalf("Failed to read input: %v", err)
	}

	code := strings.TrimSpace(input)
	fmt.Printf("You entered: %s\n", code)
	fmt.Println()

	// Step 3: Verify the code
	fmt.Println("Step 3: Verifying the code...")
	err = emailService.VerifyCode(email, code)
	if err != nil {
		fmt.Printf("❌ Verification failed: %v\n", err)
		fmt.Println()
		fmt.Println("Possible reasons:")
		fmt.Println("- Code is incorrect")
		fmt.Println("- Code has expired (5 minutes)")
		fmt.Println("- Code was already used")
	} else {
		fmt.Println("✅ Verification successful!")
		fmt.Println("🎉 Email verification completed!")
	}

	fmt.Println()
	fmt.Println("=== Test Complete ===")
}
