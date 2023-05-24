package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/Junzki/link-preview"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v9"
	"github.com/gocarina/gocsv"
)

var ctx = context.Background()

var rdb = redis.NewClient(&redis.Options{
	Addr:     getVariableFromEnvWithDefaultValue("redis_address", "localhost:6379"),
	Password: "", // no password set
	DB:       0,  // use default DB
})

type Invitation struct {
	Name          string   `json:"name" csv:"name"`
	FurtherGuests []string `json:"further_guests" csv:"further_guests"`
	FavouriteSong string   `json:"favourite_song" csv:"favourite_song"`
	NeedToKnow    string   `json:"need_to_know" csv:"need_to_know"`
	Rideshare     int      `json:"rideshare" csv:"rideshare"`
	Accepted      bool     `json:"accepted" csv:"accepted"`
	Uuid          string   `json:"uuid" csv:"uuid"`
}

func getVariableFromEnvWithDefaultValue(variable, defaultValue string) string {
	value, exists := os.LookupEnv(variable)
	if !exists {
		value = defaultValue
	}
	return value
}

func getApiAddressFromEnv() string {
	value, exists := os.LookupEnv("api_address")
	if !exists {
		value = "localhost:8080"
	}
	return value
}

func getAllInvitations(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Token argument missing."})
		return
	}
	if token != os.Getenv("token") {
		c.JSON(http.StatusForbidden, gin.H{"message": "Token not valid."})
		return
	}

	var invitations []Invitation

	iter := rdb.Scan(ctx, 0, "*", 0).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		invitation := Invitation{}
		s, err := rdb.Get(ctx, key).Result()
		if err != nil {
			continue
		}
		json.Unmarshal([]byte(s), &invitation)
		invitations = append(invitations, invitation)
	}
	if err := iter.Err(); err != nil {
		panic(err)
	}

	out, _ := gocsv.MarshalString(invitations)

	// Next line is previous `out`. Then the altered one:
	// ,"[""Foo Bar"",""Bar Foo""]",
	// ,Foo Bar|Bar Foo,

	// Delete the first qoutes from gocsv' output
	out = strings.ReplaceAll(out, "\"[\"\"", "")
	// Followed by the middle part
	out = strings.ReplaceAll(out, "\"\",\"\"", "|")
	// Then delete the last part
	out = strings.ReplaceAll(out, "\"\"]\"", "")
	// In case no further guests
	out = strings.ReplaceAll(out, ",[],", ",,")

	c.String(http.StatusOK, out)
}

func getInvitation(c *gin.Context) {
	uuid := c.Param("uuid")
	invitation, err := rdb.Get(ctx, uuid).Result()
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found."})
		return
	} else if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Error while getting invitation"})
		return
	}
	c.Data(http.StatusOK, "application/json", []byte(invitation))
}

func setInvitation(c *gin.Context) {
	var invitation Invitation
	c.BindJSON(&invitation)
	j, err := json.Marshal(invitation)
	if err != nil {
		panic(err)
	}
	err = rdb.Set(ctx, invitation.Uuid, string(j), 0).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error setting invitation."})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"error": "", "success": true, "invitation": j})
}

func getSongPreview(c *gin.Context) {
	url := c.Query("url")
	if url == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "URL parameter missing."})
		return
	}
	result, err := LinkPreview.Preview(url, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"message": "Error getting preview."})
		return
	}
	c.JSON(http.StatusOK, result)
}

func main() {
	r := gin.Default()
	r.GET("/api/invitation/:uuid", getInvitation)
	r.POST("/api/invitation/:uuid", setInvitation)
	r.GET("/api/invitation/all", getAllInvitations)
	r.GET("/api/song/preview", getSongPreview)
	r.Run(getVariableFromEnvWithDefaultValue("api_address", "localhost:8080"))
}
