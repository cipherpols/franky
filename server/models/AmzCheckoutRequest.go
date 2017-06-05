package models

type AmzCheckoutRequest struct {
	ID    string    `json:"id"`
	Product    string    `json:"product"`
	Address AmzAddress `json:"address"`
	Note   string `json:"note"`
}

type AmzAddress struct {
	Editable string `json:"editable"`
	Country    string    `json:"country"`
	FullName string `json:"full_name"`
	StreetAddress   string `json:"street_address"`
	StreetAddress2   string `json:"street_address_2"`
	City   string `json:"city"`
	State   string `json:"state"`
	ZipCode   string `json:"zip_code"`
	PhoneNumber string `json:"phone_number"`
}
