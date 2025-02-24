# TikTok Creator Profile Schema

This document describes the JSON schema for a TikTok creator's profile

## Top-Level Fields

- **`id`** (string): The unique identifier for the creator.
- **`uniqueId`** (string): The creator's TikTok user ID.
- **`nickname`** (string): The creator's display name.
- **`profiles`** (object): Contains detailed information about the creator's profile, divided into sections:
  - `creator_connect_info`: Connection information.
  - `creator_profile`: Detailed profile information.
  - `creator_profile_trend_data`: Trend data for the profile.

## `profiles` Object

### 1. `creator_connect_info`

- **`creator_id`** (string): The unique identifier for the creator (same as the top-level `id`).

### 2. `creator_profile`

- **`avatar`** (object): Information about the creator's profile picture.
  - **`thumb_url_list`** (array of strings): A list of URLs for thumbnail-sized versions of the avatar.
  - **`url_list`** (array of strings): A list of URLs for full-sized versions of the avatar. These URLs include query parameters such as `x-expires` (expiration time), `x-signature` (authentication signature), and other parameters related to the server and image quality.
- **`avg_revenue_per_buyer`** (number, _nullable_): The average revenue generated per buyer
- **`avg_revenue_per_buyer_range`** (string): The range of average revenue per buyer.
- **`bio`** (string): The creator's biography.
- **`bio_url`** (string, _nullable_): A URL included in the creator's bio
- **`bounded_partner_name_offline`** (string, _nullable_): The name of an offline bounded partner
- **`category`** (array of objects): The content categories the creator belongs to.
  - **`name`** (string): The name of the category.
  - **`starling_key`** (string): An internal key associated with the category.
- **`collaborated_brands_num`** (integer): The number of brands the creator has collaborated with.
- **`contact_info_available`** (boolean): Indicates whether contact information is available.
- **`content_groups`** (array of objects): Groups of content.
  - **`key`** (string): The key for the group (e.g., "showcase_gmv").
  - **`value`** (string): The value associated with the key (e.g., "1.0000").
- **`creator_bind_mcn_name`** (string, _nullable_): The name of the Multi-Channel Network (MCN) the creator is associated with
- **`creator_oecuid`** (string): The creator's e-commerce unique ID.
- **`creator_permission_tag`** (integer): A permission tag for the creator (e.g., 2).
- **`ec_live_avg_comment_cnt`** (string): The average number of comments during e-commerce related live streams.
- **`ec_live_engagement`** (number): The average engagement rate during e-commerce related live streams.
- **`ec_live_gpm`** (object): Gross Merchandise Value (GMV) per Mille (revenue per 1000 views) for live streams.
  - **`maximum`** (string): The highest GPM value.
  - **`maximum_format`** (string): The highest GPM value (formatted).
  - **`minimal`** (string): The lowest GPM value.
  - **`minimal_format`** (string): The lowest GPM value (formatted).
  - **`symbol`** (string): The currency symbol.
- **`ec_live_gpm_reference`** (boolean): Indicates whether the live stream GPM is eligible for reference.
- **`ec_live_med_comment_cnt`**, **`ec_live_med_like_cnt`**, **`ec_live_med_share_cnt`**, **`ec_live_med_view_cnt`** (string): The median number of comments, likes, shares, and views during e-commerce related live streams.
- **`ec_live_streaming_cnt_30d`** (string): The number of e-commerce related live streams in the past 30 days.
- **`ec_top_video_data`** (object, _nullable_): Data about the top-performing videos related to e-commerce
- **`ec_video_engagement`** (number): The average engagement rate for e-commerce related videos.
- **`ec_video_gpm`** (object): Gross Merchandise Value (GMV) per Mille (revenue per 1000 views) for videos.
  - **`maximum`** (string): The highest GPM value.
  - **`maximum_format`** (string): The highest GPM value (formatted).
  - **`minimal`** (string): The lowest GPM value.
  - **`minimal_format`** (string): The lowest GPM value (formatted).
  - **`symbol`** (string): The currency symbol.
- **`ec_video_gpm_reference`** (boolean): Indicates whether the video GPM is eligible for reference.
- **`ec_video_med_comment_cnt`**, **`ec_video_med_like_cnt`**, **`ec_video_med_share_cnt`**, **`ec_video_med_view_cnt`** (string): The median number of comments, likes, shares and views for e-commerce videos.
- **`ec_video_play_cnt_med`** (string): The median number of video plays.
- **`ec_video_publish_cnt_30d`** (string): The number of videos published in the past 30 days.
- **`follower_ages_v2`** (object, _nullable_): The age distribution of the creator's followers
- **`follower_cnt`** (string): The number of followers.
- **`follower_genders_v2`** (object, _nullable_): The gender distribution of the creator's followers
- **`follower_state_location`** (array of objects): The geographic distribution (state/province) of the creator's followers.
  - **`key`** (string): The name of the state/province.
  - **`value`** (string): The number of followers from that location.
- **`gpm`** (object): Gross Merchandise Value (GMV) per Mille.
  - **`format`** (string): The formatted GPM.
  - **`symbol`** (string): The currency symbol.
  - **`value`** (string): The GPM value.
- **`gpm_range`** (object, _nullable_): The range of the GPM metric
- **`gpm_reference`** (boolean): Indicates whether the GPM is eligible for reference.
- **`handle`** (string): The creator's TikTok handle.
- **`has_collaborated`** (boolean): Indicates whether the creator has ever collaborated.
- **`has_invited_before_90d`** (boolean): Indicates whether the creator has been invited to collaborate in the past 90 days.
- **`industry_groups`** (array of objects): Industry groups related to the creator's content.
  - **`key`** (string): The ID of the industry group.
  - **`name`** (string): The name of the industry group.
  - **`value`** (string): A related percentage.
- **`is_creator_blocked_by_shop`** (boolean): Indicates whether the creator is blocked by the shop.
- **`is_ecom_authorized`** (boolean, _nullable_): Indicates whether the creator is authorized for e-commerce
- **`is_official_recommend`** (boolean, _nullable_): Indicates whether the creator is officially recommended
- **`is_show_recom_icon`** (boolean, _nullable_): Indicates whether to show a recommendation icon
- **`live_engagement`** (number): The average engagement rate during live streams.
- **`live_gmv`** (number, _nullable_): The total Gross Merchandise Value (GMV) from live streams
- **`live_med_comment_cnt`**, **`live_med_like_cnt`**, **`live_med_share_cnt`**, **`live_med_view_cnt`** (string): The median number of comments, likes, shares, and views during live streams.
- **`live_streaming_cnt_30d`** (string): The number of live streams in the past 30 days.
- **`med_commission_rate`** (number, _nullable_): The median commission rate
- **`med_commission_rate_range`** (number, _nullable_): The range of the median commission rate
- **`med_gmv_revenue`** (number, _nullable_): The median GMV revenue
- **`med_gmv_revenue_range`** (string): The range of median GMV revenue.
- **`nickname`** (string): The creator's display name.
- **`occurred_top_rank`** (number, _nullable_): The highest rank achieved
- **`partnered_brand`** (object): Brands the creator has partnered with.
  - **`brand`** (array of objects): A list of brands (duplicates `value`).
    - **`id`** (string): The brand's ID.
    - **`name`** (string): The brand's name.
  - **`value`** (array of objects): A list of brands (duplicates `brand`).
    - **`id`** (string): The brand's ID.
    - **`name`** (string): The brand's name.
- **`product_cnt`** (number, _nullable_): The number of products
- **`product_price_range`** (string): The price range of the products.
- **`promoted_product_num`** (string): The number of promoted products.
- **`qr_code_schema`** (string): A schema URL for generating a QR code that leads to the TikTok profile.
- **`recommend_reason`** (string, _nullable_): The reason for recommendation
- **`sales_performance_end_time`** (string): The end time for the sales performance period.
- **`sample_fulfillment_rate`** (number, _nullable_): The sample fulfillment rate
- **`selection_region`** (string): The selection region (e.g., "VN" for Vietnam).
- **`shop_collect_status`** (boolean): The shop collection status.
- **`sorted_creator_labels`** (array, _nullable_) Sorted creator labels
- **`top_video_data`** (array of objects): Data about the creator's top videos. Each element in the array represents a video:
  - **`comment_cnt`** (number): The number of comments.
  - **`item_id`** (string): The video's ID.
  - **`like_cnt`** (number): The number of likes.
  - **`name`** (string): The video's title/description.
  - **`play_cnt`** (number): The number of plays.
  - **`release_date`** (string): The release timestamp.
  - **`video`** (object): Detailed information about the video.
    - **`duration`** (number): The video's duration in seconds.
    - **`id`** (string): The video's ID.
    - **`media_type`** (string): The type of media (e.g., "video").
    - **`post_url`** (string): The URL of the video's thumbnail image.
    - **`video_infos`** (array of objects): A list of information about different video versions.
      - **`backup_url`** (string): A backup URL.
      - **`bitrate`** (number): The video's bitrate (bps).
      - **`file_hash`** (string): The file hash of the video.
      - **`format`** (string): The video format.
      - **`height`** (number): The video's height in pixels.
      - **`main_url`** (string): The main URL.
      - **`size`** (number): The file size in bytes.
      - **`url_expire`** (number): The URL expiration timestamp.
      - **`video_quality`** (string): The video quality (e.g., "normal").
      - **`width`** (number): The video's width in pixels.
- **`units_sold`** (string): The number of units sold.
- **`units_sold_range`** (number, _nullable_): The range of units sold
- **`video_avg_view_cnt`** (number, _nullable_): The average number of views per video
- **`video_engagement`** (number): The average video engagement rate.
- **`video_gmv`** (number, _nullable_): The total Gross Merchandise Value (GMV) from videos
- **`video_med_comment_cnt`**, **`video_med_like_cnt`**, **`video_med_share_cnt`**, **`video_med_view_cnt`** (string): The median number of comments, likes, shares and views for videos.
- **`video_play_cnt_med`** (string): The median number of video plays.
- **`video_publish_cnt_30d`** (string): The number of videos published in the past 30 days.

### 3. `creator_profile_trend_data`

- **`filter`** (string, _nullable_): The applied filter
- **`stats`** (array of objects): An array containing statistical data over time. Each element in the array represents a time period.
  - **`end_timestamp`** (number): The end timestamp of the time period.
  - **`profile`** (object): Statistical data for that time period.
    - **`trend_ec_video_engagement_rate`** (number): E-commerce video engagement rate.
    - **`trend_ec_video_play_cnt`** (string): E-commerce video play count.
    - **`trend_follower`** (string): Number of followers.
    - **`trend_gmv`** (number, _nullable_): Total Gross Merchandise Value (GMV)
    - **`trend_units_sold`** (string): Number of units sold.
    - **`trend_video_engagement_rate`** (number): Video engagement rate.
    - **`trend_video_play_cnt`** (string): Video play count.
  - **`start_timestamp`** (number): The start timestamp of the time period.
  - **`stats`** (object, _nullable_): Statistical data
- **`time_selector`**: (object, _nullable_): Used to select the time period

## Summary

This document provides a comprehensive overview of the performance metrics, profile information, and interaction data for a content creator on TikTok, with a particular focus on e-commerce related aspects. It includes data on followers, views, likes, comments, shares, revenue, product counts, partnered brands, and more. This data can be used to analyze creator performance, identify trends, and make business decisions.
