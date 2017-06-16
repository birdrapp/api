# BIRDR API

## Users
### `POST /users`

```json
{
  "firstName": "Matthew",
  "lastName": "Williams",
  "email": "matt@williams.com",
  "password": "secret"
}
```

### `PATCH /user`

```http
PATCH /user HTTP/1.1
Authorization: Bearer <token>

{
  "firstName": "Matthew",
  "lastName": "Williams",
  "email": "matt@williams.com",
  "password": "secret"
}
```

### `DELETE /user`

```http
DELETE /user HTTP/1.1
Authorization: Bearer <token>
```

### `GET /user`

```http
GET /user HTTP/1.1
Authorization: Bearer <token>
```

### `POST /password/reset`

```json
{
  "email": "matt@williams.com"
}
```

## Authentication
### `POST /tokens`

```json
{
  "email": "matt@williams.com",
  "password": "secret"
}
```
 
## Birds
### `POST /birds`

```json
{
  "commonName": "Robin",
  "scientificName": "Robinus robinus",
  "sort": 2
}
```

### `GET /user/birds`

```http
GET /user/birds HTTP/1.1
Authorization: Bearer <token>
```

## Sightings
### `POST /sightings`

```http
POST /sightings HTTP/1.1
Authorization: Bearer <token>

{
  "birdId": "22414-51521-52151"
}
```

### `DELETE /sightings`

```http
DELETE /sightings HTTP/1.1
Authorization: Bearer <token>

{
  "birdId": "22414-51521-52151"
}
```
