package main

import (
	"fmt"
	"os"
	"os/exec"
	"io"
	"net/http"
	"time"
	"io/ioutil"
	"github.com/cipherpols/franky/server/models"
	"encoding/json"
)

func getFailedMessage(message string) string {
	return fmt.Sprintf(`{"success":%s,"message":"%s","data":[]}`, "false", message)
}

func amazon(w http.ResponseWriter, r *http.Request) {
	var checkoutRequest models.AmzCheckoutRequest
	var responseResult string

	if r.Body == nil {
		responseResult = getFailedMessage("Request is invalid")
		io.WriteString(w, responseResult)
		http.Error(w, "Please send a request body", 400)
		return
	}

	start := time.Now()
	redisClient, _ := models.CreateNewClient()
	account, accountError := models.GetAvailableAccount("configs/accounts.json")
	if accountError == nil {
		err := json.NewDecoder(r.Body).Decode(&checkoutRequest)
		if err != nil {
			responseResult = getFailedMessage("Request is invalid")
		} else {
			models.LockAccount(redisClient, account.ID)

			cmdName := "casperjs"
			cmdArgs := []string{"../robot/services/amazon.js"}
			cmdArgs = append(cmdArgs, "--amzEmail=" + account.Email)
			cmdArgs = append(cmdArgs, "--amzPassword=" + account.Password)
			cmdArgs = append(cmdArgs, "--requestId=" + checkoutRequest.ID)
			cmdArgs = append(cmdArgs, "--productId=" + checkoutRequest.Product)
			//Addresses
			cmdArgs = append(cmdArgs, "--addressCountryCode=" + checkoutRequest.Address.Country)
			cmdArgs = append(cmdArgs, "--addressFullName=" + checkoutRequest.Address.FullName)
			cmdArgs = append(cmdArgs, "--addressAddressLine1=" + checkoutRequest.Address.StreetAddress)
			cmdArgs = append(cmdArgs, "--addressAddressLine2=" + checkoutRequest.Address.StreetAddress2)
			cmdArgs = append(cmdArgs, "--addressCity=" + checkoutRequest.Address.City)
			cmdArgs = append(cmdArgs, "--addressStateOrRegion=" + checkoutRequest.Address.State)
			cmdArgs = append(cmdArgs, "--addressPostalCode=" + checkoutRequest.Address.ZipCode)
			cmdArgs = append(cmdArgs, "--addressPhoneNumber=" + checkoutRequest.Address.PhoneNumber)

			cmdArgs = append(cmdArgs, "--verbose=true")
			cmdArgs = append(cmdArgs, "--logLevel=error")
			cmdArgs = append(cmdArgs, "--changeAddress=" + checkoutRequest.Address.Editable)
			if _, err = exec.Command(cmdName, cmdArgs...).Output(); err != nil {
				fmt.Fprintln(os.Stderr, err)
				fmt.Println(cmdArgs)
				responseResult = getFailedMessage("Could not checkout")

			} else {
				responseFile, err := ioutil.ReadFile("../logs/" + checkoutRequest.ID + "/response.log")
				if (err == nil) {
					fmt.Print(string(responseFile))
				}
				egiftOutput := string(responseFile)
				responseResult = string(egiftOutput)
			}
		}
	}


	defer func() {
		if responseResult == "" {
			responseResult = getFailedMessage("Unexpected error")
		}

		elapsed := time.Since(start)
		w.Header().Set("X-Egift-Response-Time", elapsed.String())
		fmt.Print(elapsed.String())
		models.UnLockAccount(redisClient, account.ID)
		io.WriteString(w, responseResult)
	}()
}

func main() {
	port := "8888"
	http.HandleFunc("/amazon", amazon)
	fmt.Println("Server is running at port " + port)
	fmt.Println("http://localhost:" + port + "/amazon")

	http.ListenAndServe(":" + port, nil)
}
