package models

type AmzResponse struct {
	Success    bool    `json:"id"`
	Message string `json:"message"`
	Data   string `json:"data"`
}
