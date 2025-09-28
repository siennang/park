<?php
$searchQuery = $_GET['search'];

// Set your Google Places API key
$apiKey = 'AIzaSyBX8XhtTBG7OwtaHVafMu8khM_jtiLVmFU';

// Set the search endpoint
$searchEndpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// Prepare the search parameters
$searchParams = http_build_query([
    'key' => $apiKey,
    'query' => 'parking garages ' . $searchQuery,
]);

// Build the search URL
$searchUrl = $searchEndpoint . '?' . $searchParams;

// Make the API request
$searchResult = file_get_contents($searchUrl);

// Process the search result
$searchData = json_decode($searchResult, true);

// Extract relevant information from the search result
$parkingLocations = [];
if ($searchData['status'] === 'OK') {
    // Connect to the database
    $conn = mysqli_connect('localhost', 'root', '', 'parking_facilities_db');

    foreach ($searchData['results'] as $result) {
        $placeId = $result['place_id'];

        // Retrieve the details of each place using the Place Details API
        $detailsEndpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
        $detailsParams = http_build_query([
            'key' => $apiKey,
            'place_id' => $placeId,
            'fields' => 'opening_hours',
        ]);
        $detailsUrl = $detailsEndpoint . '?' . $detailsParams;
        $detailsResult = file_get_contents($detailsUrl);
        $detailsData = json_decode($detailsResult, true);

        $name = $result['name'];
        $location = json_encode($result['geometry']['location']);
        $hours = isset($detailsData['result']['opening_hours']) ? json_encode($detailsData['result']['opening_hours']['weekday_text']) : null;

        // Insert the data into the database
        $query = "INSERT INTO parking_garages (name, location, hours) VALUES (?, ?, ?)";
        $stmt = mysqli_prepare($conn, $query);
        mysqli_stmt_bind_param($stmt, 'sss', $name, $location, $hours);
        mysqli_stmt_execute($stmt);

        $parkingLocations[] = [
            'name' => $name,
            'location' => $location,
            'hours' => $hours,
        ];
    }

    // Close the database connection
    mysqli_close($conn);
}

// Return the parking locations as JSON response
header('Content-Type: application/json');
echo json_encode($parkingLocations);
?>
