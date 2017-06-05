package models

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"errors"
)

type Account struct {
	ID    string    `json:"id"`
	Email string `json:"email"`
	Password   string `json:"password"`
	Note   string `json:"note"`
}

type Config struct {
	Accounts []Account `json:"accounts"`
}

func (p Account) toString() string {
	return p.Email
}

/**
 File contains all accounts
 */
func GetAvailableAccount(file string) (Account, error) {
	config := GetAccounts(file)
	redisClient, _ := CreateNewClient()
	for _, account := range config.Accounts {
		fmt.Println(account.ID)
		if AccountAvailable(redisClient, account.ID) {
			return account, nil
		}
	}
	return Account{}, errors.New("Cannot found")
}

func GetAccounts(file string) Config {
	raw, err := ioutil.ReadFile(file)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	var config Config
	json.Unmarshal(raw, &config)
	return config
}
