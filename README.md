#E-gift 

Amazon bot

## Install

```
npm install -g casperjs
npm install -g phantomjs
```
### Install golang
https://golang.org/doc/install#tarball

Golang 1.8

```

export GOROOT=/usr/local/go/
export GOPATH=$HOME/gosrc
export PATH=$PATH:$GOROOT/bin:GOPATH/bin

```

## Running API server

`go run egift.go`

## Calling egift directly without API
```
POST: http://localhost:8888/amazon
BODY:
{
	"id": "ID_ID_ID",
	"product": "B00GIYHAEQ",
	"address": {
		"editable": "false",
		"country": "VN",
		"full_name": "Quang Phan Hai",
		"street_address": "Vagabond Inn Santa Clara",
		"street_address_2": "Room 221, 3580 El Camino Real",
		"city": "Santa Clara",
		"state": "California",
		"zip_code": "95053",
		"phone_number": "408-241-0771"
	},
	"note": "LALALA"
}
```
