# Run Mock API

```sh
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

# Endpoints

## Get Creator Ids

```sh
http://localhost:8000/creator-ids
```

## Post Creators Data

```sh
http://localhost:8000/creators
```

## Post Creators Error

```sh
http://localhost:8000/creators/errors
```
