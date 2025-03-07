import random
from typing import Annotated, List

from fastapi import Body, FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from api.mock_data import MOCK_CREATOR_IDS
from api.schemas import CrawlError, CreatorResultSchema, CreatorSchema

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/creator-ids")
async def get_creator_ids(
    num: int = Query(default=50, ge=1, le=100)
) -> List[CreatorSchema]:
    random_ids = random.sample(MOCK_CREATOR_IDS, num)
    return [CreatorSchema(id=id) for id in random_ids]


@app.post("/creators")
async def create_creators(
    creators: Annotated[List[CreatorResultSchema], Body(...)]
) -> Response:
    [
        logger.info(f"Received creator {creator.id}: {creator.nickname}")
        for creator in creators
    ]

    return Response(status_code=200)


@app.post("/creators/errors")
async def create_creator_errors(
    errors: Annotated[List[CrawlError], Body(...)]
) -> Response:
    [
        logger.error(
            f"Error crawling creator {error.code} - {error.message}: {error.data}"
        )
        for error in errors
    ]

    return Response(status_code=200)
