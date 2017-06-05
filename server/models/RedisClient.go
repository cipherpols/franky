package models

import (
	"github.com/go-redis/redis"
	"fmt"
	"time"
)

const cachePrefix = "account::"

func CreateNewClient() (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       2,  // use default DB
	})

	pong, err := client.Ping().Result()
	fmt.Println(pong, err)
	// Output: PONG <nil>
	return client, err
}

func AccountAvailable(client *redis.Client, accountId string) bool {
	val, err := client.Get(cachePrefix + accountId).Result()
	println(val)
	if val == "" {
		return true
	}
	if err != nil {
		return false
		panic(err)
	}
	return false;
}

func LockAccount(client *redis.Client, accountId string) {
	timeout := time.Minute * 15
	err := client.Set(cachePrefix + accountId, "1", timeout).Err()
	if err != nil {
		panic(err)
	}
}

func UnLockAccount(client *redis.Client, accountId string) {
	err := client.Del(cachePrefix + accountId).Err()
	if err != nil {
		panic(err)
	}
}
