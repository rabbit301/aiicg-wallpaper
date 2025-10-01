package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"aiicg-backend/internal/models"
	"aiicg-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GenerationHandler wallpaper generation handler
type GenerationHandler struct {
	services *services.ServiceContainer
}

// NewGenerationHandler create wallpaper generation handler
func NewGenerationHandler(services *services.ServiceContainer) *GenerationHandler {
	return &GenerationHandler{
		services: services,
	}
}

// GenerateRequest generation request structure
type GenerateRequest struct {
	Prompt string `json:"prompt" binding:"required"`
	Title  string `json:"title"`
	Preset string `json:"preset"`
}

// GenerateResponse generation response structure
type GenerateResponse struct {
	ID           string                 `json:"id"`
	Title        string                 `json:"title"`
	Prompt       string                 `json:"prompt"`
	ImageURL     string                 `json:"imageUrl"`
	ThumbnailURL string                 `json:"thumbnailUrl"`
	Width        int                    `json:"width"`
	Height       int                    `json:"height"`
	Format       string                 `json:"format"`
	Metadata     map[string]interface{} `json:"metadata"`
}

// ScreenPreset screen preset configuration
type ScreenPreset struct {
	Name      string `json:"name"`
	Width     int    `json:"width"`
	Height    int    `json:"height"`
	ImageSize string `json:"image_size"`
}

// Screen preset configurations
var SCREEN_PRESETS = map[string]ScreenPreset{
	"desktop_fhd": {
		Name:      "Desktop FHD",
		Width:     1920,
		Height:    1080,
		ImageSize: "landscape_4_3",
	},
	"desktop_4k": {
		Name:      "Desktop 4K",
		Width:     3840,
		Height:    2160,
		ImageSize: "landscape_16_9",
	},
	"mobile": {
		Name:      "Mobile",
		Width:     1080,
		Height:    1920,
		ImageSize: "portrait_4_3",
	},
	"tablet": {
		Name:      "Tablet",
		Width:     1536,
		Height:    2048,
		ImageSize: "portrait_3_4",
	},
}

// GenerateWallpaper generate wallpaper
func (h *GenerationHandler) GenerateWallpaper(c *gin.Context) {
	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Request parameter error",
			"details": err.Error(),
		})
		return
	}

	log.Printf("Generate API received parameters:")
	log.Printf("Original prompt: %s", req.Prompt)
	log.Printf("Preset: %s", req.Preset)
	log.Printf("Title: %s", req.Title)

	// Get user information
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not logged in",
		})
		return
	}

	// Get screen configuration
	preset := req.Preset
	if preset == "" {
		preset = "desktop_fhd"
	}
	
	screenConfig, exists := SCREEN_PRESETS[preset]
	if !exists {
		screenConfig = SCREEN_PRESETS["desktop_fhd"]
	}

	log.Printf("Selected screen config: %+v", screenConfig)

	// Translation and enhancement phase
	translationStartTime := time.Now()
	log.Println("Starting translation phase...")

	// Call translation service (simple processing for now, can integrate real translation service later)
	translatedPrompt := req.Prompt // Use original prompt for now
	enhancedPrompt := enhancePrompt(translatedPrompt)

	translationTime := time.Since(translationStartTime)
	log.Printf("Translation time: %v", translationTime)

	// AI generation phase
	aiGenerationStartTime := time.Now()
	log.Println("Starting AI generation phase...")

	// Call AI image generation service
	imageResult, err := h.generateImage(enhancedPrompt, screenConfig)
	if err != nil {
		log.Printf("AI generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "AI generation failed",
			"details": err.Error(),
		})
		return
	}

	aiGenerationTime := time.Since(aiGenerationStartTime)
	log.Printf("AI generation time: %v", aiGenerationTime)

	totalTime := translationTime + aiGenerationTime
	log.Printf("Total time: %v (translation: %v + AI generation: %v)", totalTime, translationTime, aiGenerationTime)

	// Store wallpaper to database
	userUUID := userID.(string)
	userUUIDParsed, err := uuid.Parse(userUUID)
	if err != nil {
		log.Printf("Failed to parse user UUID: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	wallpaper := &models.Wallpaper{
		ID:              uuid.New(),
		Title:           req.Title,
		Prompt:          req.Prompt,
		ImageURL:        imageResult.ImageURL,
		ThumbnailURL:    imageResult.ThumbnailURL,
		Width:           screenConfig.Width,
		Height:          screenConfig.Height,
		Format:          "jpg",
		UserID:          &userUUIDParsed,
		DownloadCount:   0,
		FavoriteCount:   0,
		Category:        "generated",
		IsPublic:        true,
		GenerationTime:  float64(totalTime.Milliseconds()),
	}

	// Set tags
	tags := map[string]interface{}{
		"preset":           preset,
		"enhanced_prompt":  enhancedPrompt,
		"generation_time":  totalTime.Milliseconds(),
		"provider":         imageResult.Provider,
	}
	tagsJSON, _ := json.Marshal(tags)
	wallpaper.Tags = tagsJSON

	if err := h.services.DB.Create(wallpaper).Error; err != nil {
		log.Printf("Failed to save wallpaper: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save wallpaper",
		})
		return
	}

	log.Printf("Wallpaper generated successfully: %s", wallpaper.ID)

	// Record user activity
	activity := &models.UserActivity{
		ID:          uuid.New(),
		UserID:      userUUIDParsed,
		Action:      "generate_wallpaper",
		Description: fmt.Sprintf("Generated wallpaper: %s", req.Title),
		Metadata:    tagsJSON,
	}
	h.services.DB.Create(activity)

	// Return generation result
	response := GenerateResponse{
		ID:           wallpaper.ID.String(),
		Title:        wallpaper.Title,
		Prompt:       wallpaper.Prompt,
		ImageURL:     wallpaper.ImageURL,
		ThumbnailURL: wallpaper.ThumbnailURL,
		Width:        wallpaper.Width,
		Height:       wallpaper.Height,
		Format:       wallpaper.Format,
		Metadata: map[string]interface{}{
			"generation_time": totalTime.Milliseconds(),
			"provider":        imageResult.Provider,
			"preset":          preset,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    response,
		"message": "Wallpaper generated successfully",
	})
}

// ImageGenerationResult AI generation result
type ImageGenerationResult struct {
	ImageURL     string `json:"image_url"`
	ThumbnailURL string `json:"thumbnail_url"`
	Provider     string `json:"provider"`
}

// generateImage call AI image generation service
func (h *GenerationHandler) generateImage(prompt string, config ScreenPreset) (*ImageGenerationResult, error) {
	// This should call actual AI image generation service
	// Return mock data for now, need to integrate FastGPT or FAL.AI later
	
	log.Printf("Calling AI generation service:")
	log.Printf("   Prompt: %s", prompt)
	log.Printf("   Size: %dx%d", config.Width, config.Height)
	
	// Simulate AI generation delay
	time.Sleep(2 * time.Second)
	
	// Return mock result
	result := &ImageGenerationResult{
		ImageURL:     "https://picsum.photos/" + fmt.Sprintf("%d/%d", config.Width, config.Height),
		ThumbnailURL: "https://picsum.photos/" + fmt.Sprintf("%d/%d", config.Width/4, config.Height/4),
		Provider:     "mock_provider",
	}
	
	log.Printf("AI generation completed: %s", result.ImageURL)
	return result, nil
}

// enhancePrompt enhance prompt
func enhancePrompt(prompt string) string {
	// Simple prompt enhancement logic
	enhanced := prompt + ", high quality, detailed, professional, 4k resolution"
	return enhanced
}
