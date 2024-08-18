#!/bin/bash

#BASE_URL="https://www.nobroker.in/api/v2/property/maps/"
#HEADERS=(
#  -H 'sec-ch-ua: "Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"'
#  -H 'X-User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
#  -H 'sec-ch-ua-mobile: ?0'
#  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
#  -H 'Access-Control-Allow-Origin: *'
#  -H 'Accept: application/json'
#  -H 'Referer: https://www.nobroker.in/property/rent/chennai/Chennai/?searchParam=W3sibGF0IjoxMy4wNDM3NjEyODI5MTkyLCJsb24iOjgwLjIwMDA2ODUxNjk2OTMsInBsYWNlSWQiOiJDaElKWVROOVQtcGxVam9STTlSamFBdW5ZVzQiLCJwbGFjZU5hbWUiOiJDaGVubmFpIiwic2hvd01hcCI6dHJ1ZX1d&sharedAccomodation=0&radius=2.0&budgetRange=0,500000&locality=Chennai&isMetro=false&rent=10000,10000&type=BHK2&leaseType=FAMILY&furnishing=FULLY_FURNISHED,SEMI_FURNISHED&parking=TWO_WHEELER,FOUR_WHEELER&farea=0,3000&withPics=1&fpref=true&orderBy=lastUpdateDate,desc&showMap=true'
#  -H 'userid: ff80818167d0ccf80167d144738e29fd'
#  -H 'baggage: sentry-environment=production,sentry-release=02102023,sentry-public_key=826f347c1aa641b6a323678bf8f6290b,sentry-trace_id=5a44422f14eb4f14b1fdbcb36cb00f9c,sentry-sample_rate=0.2,sentry-sampled=false'
#  -H 'sentry-trace: 5a44422f14eb4f14b1fdbcb36cb00f9c-823a18f71e0d6978-0'
#  -H 'sec-ch-ua-platform: "macOS"'
#)
#
## Create a directory to store the JSON files
#mkdir -p nobroker_map_data
#
## Loop through BHK types
#for bhk in {1..3}; do
#  # Loop through rent values
#  for rent in $(seq 10000 1000 25000); do
#    echo "Fetching data for BHK${bhk}, rent: ${rent}"
#
#    # Construct the URL with the current rent value and BHK type
#    URL="${BASE_URL}?searchParam=W3sibGF0IjoxMy4wNDM3NjEyODI5MTkyLCJsb24iOjgwLjIwMDA2ODUxNjk2OTMsInBsYWNlSWQiOiJDaElKWVROOVQtcGxVam9STTlSamFBdW5ZVzQiLCJwbGFjZU5hbWUiOiJDaGVubmFpIiwic2hvd01hcCI6dHJ1ZX1d&sharedAccomodation=0&radius=2.0&budgetRange=0,500000&locality=Chennai&isMetro=false&rent=${rent},${rent}&type=BHK${bhk}&leaseType=FAMILY&furnishing=FULLY_FURNISHED,SEMI_FURNISHED&parking=TWO_WHEELER,FOUR_WHEELER&farea=0,3000&withPics=1&fpref=true&orderBy=lastUpdateDate,desc&showMap=true&includeViewPortProperties=true&excludeInsideProperties=true&propertyType=rent&northEastLat=13.200737166008436&northEastLng=80.6809559397979&southWestLat=12.89440345412908&southWestLng=79.73292555971611"
#
#    # Make the curl request and save the response to a file
#    response=$(curl -s "${URL}" "${HEADERS[@]}")
#
#    # Check if the response contains data
#    if echo "$response" | jq -e '.data.outside.total > 0' > /dev/null; then
#      echo "$response" > "nobroker_map_data/BHK${bhk}_rent_${rent}.json"
#      echo "Data saved for BHK${bhk}, rent: ${rent}"
#    else
#      echo "No data found for BHK${bhk}, rent: ${rent}"
#    fi
#
#    # Wait for a short time to avoid overwhelming the server
#    sleep 2
#  done
#done
#
#echo "Data collection complete. Check the 'nobroker_map_data' directory for JSON files."


#BASE_URL="https://www.nobroker.in/api/v3/multi/property/RENT/filter"
#HEADERS=(
#  -H 'sec-ch-ua: "Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"'
#  -H 'X-User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
#  -H 'sec-ch-ua-mobile: ?0'
#  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
#  -H 'Access-Control-Allow-Origin: *'
#  -H 'Accept: application/json'
#  -H 'Referer: https://www.nobroker.in/property/rent/chennai/Chennai/?searchParam=W3sibGF0IjoxMy4wNDM3NjEyODI5MTkyLCJsb24iOjgwLjIwMDA2ODUxNjk2OTMsInBsYWNlSWQiOiJDaElKWVROOVQtcGxVam9STTlSamFBdW5ZVzQiLCJwbGFjZU5hbWUiOiJDaGVubmFpIiwic2hvd01hcCI6ZmFsc2V9XQ==&sharedAccomodation=0&radius=2.0&budgetRange=0,500000&locality=Chennai&isMetro=false&rent=10000,10000&type=BHK1&leaseType=FAMILY&furnishing=FULLY_FURNISHED,SEMI_FURNISHED&parking=TWO_WHEELER,FOUR_WHEELER&farea=0,3000&withPics=1&fpref=true&orderBy=lastUpdateDate,desc'
#  -H 'userid: ff80818167d0ccf80167d144738e29fd'
#  -H 'sec-ch-ua-platform: "macOS"'
#)
#
## Create a directory to store the JSON files
#mkdir -p nobroker_api_data2
#
## Loop through BHK types
#for bhk in {1..3}; do
#  # Loop through rent ranges
#  for min_rent in $(seq 9000 1000 24000); do
#    max_rent=$((min_rent + 1000))
#    echo "Fetching data for BHK${bhk}, rent range: ${min_rent}-${max_rent}"
#
#    # Construct the URL with the current rent range and BHK type
#    URL="${BASE_URL}?pageNo=1&searchParam=W3sibGF0IjoxMy4wNDM3NjEyODI5MTkyLCJsb24iOjgwLjIwMDA2ODUxNjk2OTMsInBsYWNlSWQiOiJDaElKWVROOVQtcGxVam9STTlSamFBdW5ZVzQiLCJwbGFjZU5hbWUiOiJDaGVubmFpIiwic2hvd01hcCI6ZmFsc2V9XQ==&sharedAccomodation=0&radius=2.0&budgetRange=0,500000&locality=Chennai&isMetro=false&rent=${min_rent},${max_rent}&type=BHK${bhk}&leaseType=FAMILY&furnishing=FULLY_FURNISHED,SEMI_FURNISHED&parking=TWO_WHEELER,FOUR_WHEELER&farea=0,3000&withPics=1&fpref=true&orderBy=lastUpdateDate,desc&city=chennai"
#
#    # Make the curl request and save the response to a file
#    curl -s "${URL}" "${HEADERS[@]}" -o "nobroker_api_data2/BHK${bhk}_rent_${min_rent}_${max_rent}.json"
#
#    # Wait for a short time to avoid overwhelming the server
#    sleep 2
#  done
#done
#
#echo "Data collection complete. Check the 'nobroker_api_data' directory for JSON files."

# Base URL and headers
BASE_URL="https://www.nobroker.in/api/v3/multi/property/RENT/filter"
HEADERS=(
  -H 'sec-ch-ua: "Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"'
  -H 'X-User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  -H 'sec-ch-ua-mobile: ?0'
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  -H 'Access-Control-Allow-Origin: *'
  -H 'Accept: application/json'
  -H 'userid: ff80818167d0ccf80167d144738e29fd'
  -H 'sec-ch-ua-platform: "macOS"'
)

# Create a directory to store the JSON files
mkdir -p nobroker_api_data

# Loop through BHK types
for bhk in {1..3}; do
  # Loop through rent values
  for rent in $(seq 10000 1000 25000); do
    echo "Fetching data for BHK${bhk}, rent: ${rent}"

    # Construct the URL with the current rent value and BHK type
    URL="${BASE_URL}?pageNo=1&searchParam=W3sibGF0IjoxMy4wNDM3NjEyODI5MTkyLCJsb24iOjgwLjIwMDA2ODUxNjk2OTMsInBsYWNlSWQiOiJDaElKWVROOVQtcGxVam9STTlSamFBdW5ZVzQiLCJwbGFjZU5hbWUiOiJDaGVubmFpIiwic2hvd01hcCI6ZmFsc2V9XQ==&sharedAccomodation=0&radius=2.0&budgetRange=0,500000&locality=Chennai&isMetro=false&rent=${rent},${rent}&type=BHK${bhk}&leaseType=FAMILY&furnishing=FULLY_FURNISHED,SEMI_FURNISHED&parking=TWO_WHEELER,FOUR_WHEELER&farea=0,3000&withPics=1&fpref=true&orderBy=lastUpdateDate,desc&city=chennai"

    # Make the curl request and save the response to a file
    curl -s "${URL}" "${HEADERS[@]}" -o "nobroker_api_data/BHK${bhk}_rent_${rent}.json"

    # Wait for a short time to avoid overwhelming the server
    sleep 2
  done
done

echo "Data collection complete. Check the 'nobroker_api_data' directory for JSON files."