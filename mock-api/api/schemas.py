from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel


class CreatorSchema(BaseModel):
    id: str


class CrawlError(BaseModel):
    data: Dict[str, Any]
    code: str
    message: str


class AvatarSchema(BaseModel):
    thumb_url_list: Optional[List[str]] = None
    url_list: Optional[List[str]] = None


class AvgRevenuePerBuyerSchema(BaseModel):
    format: Optional[str] = None
    symbol: Optional[str] = None
    value: Optional[str] = None


class CategorySchema(BaseModel):
    name: Optional[str] = None
    starling_key: Optional[str] = None


class ContentGroupSchema(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None


class EcliveGpmSchema(BaseModel):
    maximum: Optional[str] = None
    maximum_format: Optional[str] = None
    minimal: Optional[str] = None
    minimal_format: Optional[str] = None
    symbol: Optional[str] = None


class EcVideoGpmSchema(BaseModel):
    maximum: Optional[str] = None
    maximum_format: Optional[str] = None
    minimal: Optional[str] = None
    minimal_format: Optional[str] = None
    symbol: Optional[str] = None


class FollowerAgesV2Schema(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None


class FollowerGendersV2Schema(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None


class FollowerStateLocationSchema(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None


class GpmSchema(BaseModel):
    format: Optional[str] = None
    symbol: Optional[str] = None
    value: Optional[str] = None


class IndustryGroupSchema(BaseModel):
    key: Optional[str] = None
    name: Optional[str] = None
    value: Optional[str] = None


class LiveGmvSchema(BaseModel):
    format: Optional[str] = None
    symbol: Optional[str] = None
    value: Optional[str] = None


class MedGmvRevenueSchema(BaseModel):
    format: Optional[str] = None
    symbol: Optional[str] = None
    value: Optional[str] = None


class OccurredTopRankSchema(BaseModel):
    rank_type: Optional[int] = None
    rank_period: Optional[int] = None
    rank_content_type: Optional[int] = None
    rank_date: Optional[str] = None
    rank_position: Optional[int] = None
    indus_cate: Optional[str] = None


class BrandSchema(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None


class PartneredBrandSchema(BaseModel):
    brand: Optional[List[Dict]] = None
    value: Optional[List[Dict]] = None


class VideoInfosSchema(BaseModel):
    backup_url: Optional[str] = None
    bitrate: Optional[int] = None
    file_hash: Optional[str] = None
    format: Optional[str] = None
    height: Optional[int] = None
    main_url: Optional[str] = None
    size: Optional[int] = None
    url_expire: Optional[int] = None
    video_quality: Optional[str] = None
    width: Optional[int] = None


class VideoSchema(BaseModel):
    duration: Optional[float] = None
    id: Optional[str] = None
    media_type: Optional[str] = None
    post_url: Optional[str] = None
    video_infos: Optional[List[VideoInfosSchema]] = None


class MaxSalePriceSchema(BaseModel):
    currency: Optional[str] = None
    formatted_price: Optional[str] = None
    price: Optional[str] = None


class MinSalePriceSchema(BaseModel):
    currency: Optional[str] = None
    formatted_price: Optional[str] = None
    price: Optional[str] = None


class VideoProductsSchema(BaseModel):
    image: Optional[str] = None
    max_sale_price: Optional[MaxSalePriceSchema] = None
    min_sale_price: Optional[MinSalePriceSchema] = None
    name: Optional[str] = None
    product_id: Optional[str] = None


class TopVideoDataSchema(BaseModel):
    comment_cnt: Optional[int] = None
    item_id: Optional[str] = None
    like_cnt: Optional[int] = None
    name: Optional[str] = None
    play_cnt: Optional[int] = None
    release_date: Optional[str] = None
    video: Optional[VideoSchema] = None
    video_products: Optional[List[VideoProductsSchema]] = None


class VideoGmvSchema(BaseModel):
    format: Optional[str] = None
    symbol: Optional[str] = None
    value: Optional[str] = None


class CreatorProfileSchema(BaseModel):
    avatar: Optional[AvatarSchema] = None
    avg_revenue_per_buyer: Optional[AvgRevenuePerBuyerSchema] = None
    avg_revenue_per_buyer_range: Optional[str] = None
    bio: Optional[str] = None
    bio_url: Optional[str] = None
    bounded_partner_name_offline: Optional[str] = None
    category: Optional[List[CategorySchema]] = None
    collaborated_brands_num: Optional[int] = None
    contact_info_available: Optional[bool] = None
    content_groups: Optional[List[ContentGroupSchema]] = None
    creator_bind_mcn_name: Optional[str] = None
    creator_oecuid: Optional[str] = None
    creator_permission_tag: Optional[int] = None
    ec_live_avg_comment_cnt: Optional[str] = None
    ec_live_engagement: Optional[int] = None
    ec_live_gpm: Optional[EcliveGpmSchema] = None
    ec_live_gpm_reference: Optional[bool] = None
    ec_live_med_comment_cnt: Optional[str] = None
    ec_live_med_like_cnt: Optional[str] = None
    ec_live_med_share_cnt: Optional[str] = None
    ec_live_med_view_cnt: Optional[str] = None
    ec_live_streaming_cnt_30d: Optional[str] = None
    ec_top_video_data: Optional[List[TopVideoDataSchema]] = None
    ec_video_engagement: Optional[int] = None
    ec_video_gpm: Optional[EcVideoGpmSchema] = None
    ec_video_gpm_reference: Optional[bool] = None
    ec_video_med_comment_cnt: Optional[str] = None
    ec_video_med_like_cnt: Optional[str] = None
    ec_video_med_share_cnt: Optional[str] = None
    ec_video_med_view_cnt: Optional[str] = None
    ec_video_play_cnt_med: Optional[str] = None
    ec_video_publish_cnt_30d: Optional[str] = None
    follower_ages_v2: Optional[List[FollowerAgesV2Schema]] = None
    follower_cnt: Optional[str] = None
    follower_genders_v2: Optional[List[FollowerGendersV2Schema]] = None
    follower_state_location: Optional[List[FollowerStateLocationSchema]] = None
    gpm: Optional[GpmSchema] = None
    gpm_range: Optional[str] = None
    gpm_reference: Optional[bool] = None
    handle: Optional[str] = None
    has_collaborated: Optional[bool] = None
    has_invited_before_90d: Optional[bool] = None
    industry_groups: Optional[List[IndustryGroupSchema]] = None
    is_creator_blocked_by_shop: Optional[bool] = None
    is_ecom_authorized: Optional[bool] = None
    is_official_recommend: Optional[bool] = None
    is_show_recom_icon: Optional[bool] = None
    live_engagement: Optional[int] = None
    live_gmv: Optional[LiveGmvSchema] = None
    live_med_comment_cnt: Optional[str] = None
    live_med_like_cnt: Optional[str] = None
    live_med_share_cnt: Optional[str] = None
    live_med_view_cnt: Optional[str] = None
    live_streaming_cnt_30d: Optional[str] = None
    med_commission_rate: Optional[int] = None
    med_commission_rate_range: Optional[str] = None
    med_gmv_revenue: Optional[MedGmvRevenueSchema] = None
    med_gmv_revenue_range: Optional[str] = None
    nickname: Optional[str] = None
    occurred_top_rank: Optional[OccurredTopRankSchema] = None
    partnered_brand: Optional[PartneredBrandSchema] = None
    product_cnt: Optional[int] = None
    product_price_range: Optional[str] = None
    promoted_product_num: Optional[str] = None
    qr_code_schema: Optional[str] = None
    recommend_reason: Optional[str] = None
    sales_performance_end_time: Optional[int] = None
    sample_fulfillment_rate: Optional[Union[int, float]] = None
    selection_region: Optional[str] = None
    shop_collect_status: Optional[bool] = None
    sorted_creator_labels: Optional[List] = None
    top_video_data: Optional[List[TopVideoDataSchema]] = None
    units_sold: Optional[str] = None
    units_sold_range: Optional[str] = None
    video_avg_view_cnt: Optional[int] = None
    video_engagement: Optional[int] = None
    video_gmv: Optional[VideoGmvSchema] = None
    video_med_comment_cnt: Optional[str] = None
    video_med_like_cnt: Optional[str] = None
    video_med_share_cnt: Optional[str] = None
    video_med_view_cnt: Optional[str] = None
    video_play_cnt_med: Optional[str] = None
    video_publish_cnt_30d: Optional[str] = None


class CreatorConnectInfoSchema(BaseModel):
    creator_id: Optional[str] = None


class TrendGmvSchema(BaseModel):
    format: Optional[str] = None
    symbol: Optional[str] = None
    value: Optional[str] = None


class ProfileSchema(BaseModel):
    trend_ec_video_engagement_rate: Optional[int] = None
    trend_ec_video_play_cnt: Optional[str] = None
    trend_follower: Optional[str] = None
    trend_gmv: Optional[TrendGmvSchema] = None
    trend_units_sold: Optional[str] = None
    trend_video_engagement_rate: Optional[int] = None
    trend_video_play_cnt: Optional[str] = None


class StatsSchema(BaseModel):
    start_timestamp: Optional[int] = None
    end_timestamp: Optional[int] = None
    profile: Optional[ProfileSchema] = None


class CreatorProfileTrendDataSchema(BaseModel):
    stats: Optional[List[StatsSchema]] = None


class ProfilesSchema(BaseModel):
    creator_connect_info: Optional[CreatorConnectInfoSchema]
    creator_profile: Optional[CreatorProfileSchema]
    creator_profile_trend_data: Optional[List[CreatorProfileTrendDataSchema]]


class CreatorResultSchema(BaseModel):
    id: Optional[str]
    uniqueId: Optional[str]
    nickname: Optional[str]
    profiles: Optional[ProfilesSchema]
