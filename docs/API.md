# Affiliate Creator API

## 1. Get a List of Creator IDs

**Request:**

*   **Method:** `GET`

**Response:**

*   **Status Code:** `200 OK`
*   **Content Type:** `application/json`

```json
[
  {
    "id": "creator_id_1"
  },
  {
    "id": "creator_id_2"
  },
  // ...
]
```

## 2. Submit Collected Creator Data

**Request:**

*   **Method:** `POST`
*   **Content Type:** `application/json`

**Body (JSON - Example):**

```json
[
  {
    "id": "7495881263612856625",
    "nickname": "Em Thuý Thuý",
    "uniqueId": "emthuythuyyy",
    "profiles": {
      "creator_connect_info": {
        "creator_id": "7495881263612856625"
      },
      "creator_profile": {
        "avatar": {
          "thumb_url_list": [
            "https://p9-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/2c565bae501a0e13041dad4d8c3b2beb~tplv-tiktokx-cropcenter:168:168.webp?dr=14577&nonce=8791&refresh_token=cc8ddfbfdc95aab52119b67c5786cd17&x-expires=1740898800&x-signature=nWVDo3muA9AJAH5QhfocUt9hOM4%3D&idc=maliva&ps=13740610&shcp=39dffb78&shp=a5d48078&t=4d5b0474"
          ],
          "url_list": [
            "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/2c565bae501a0e13041dad4d8c3b2beb~tplv-tiktokx-cropcenter:720:720.webp?dr=14579&nonce=15379&refresh_token=eb51a428f8c83b89ff37a765a011721c&x-expires=1740898800&x-signature=uJ84WtzD1Oxq0uXxKCXBFE9m%2BGQ%3D&idc=maliva&ps=13740610&shcp=39dffb78&shp=a5d48078&t=4d5b0474"
          ]
        },
        "avg_revenue_per_buyer": {
          "format": "114.8K₫",
          "symbol": "₫",
          "value": "114796.89"
        },
        "avg_revenue_per_buyer_range": "0₫-127.8K₫",
        "bio": "Các brand cần PR, kết hợp AFF vui lòng inbox zl qly ạ \n🇻🇳🇻🇳🇻🇳 0985096709",
        "bio_url": null,
        "bounded_partner_name_offline": null,
        "category": [
          {
            "name": "Beauty & Personal Care",
            "starling_key": "magellan_601450"
          },
          {
            "name": "Shoes",
            "starling_key": "magellan_601352"
          },
          {
            "name": "Womenswear & Underwear",
            "starling_key": "magellan_601152"
          }
        ],
        "collaborated_brands_num": 24,
        "contact_info_available": false,
        "content_groups": [
          {
            "key": "video_gmv",
            "value": "0.9911"
          },
          {
            "key": "showcase_gmv",
            "value": "0.0089"
          }
        ],
        "creator_bind_mcn_name": null,
        "creator_oecuid": "7495881263612856625",
        "creator_permission_tag": 2,
        "ec_live_avg_comment_cnt": "0",
        "ec_live_engagement": 0,
        "ec_live_gpm": {
          "maximum": "0",
          "maximum_format": "0₫",
          "minimal": "0",
          "minimal_format": "0₫",
          "symbol": "₫"
        },
        "ec_live_gpm_reference": true,
        "ec_live_med_comment_cnt": "0",
        "ec_live_med_like_cnt": "0",
        "ec_live_med_share_cnt": "0",
        "ec_live_med_view_cnt": "0",
        "ec_live_streaming_cnt_30d": "0",
        "ec_top_video_data": [
          {
            "comment_cnt": 0,
            "item_id": "7468624007466667272",
            "like_cnt": 4491,
            "name": "Muốn có NY hun Ny thì miệng phải thơm tho nha các tình iu #xitthommieng #thommieng #xitthommiengks #xitthommieng89k #kscosmetic #xuhuong #gioitreviet #girlpho #boypho #hocsinh",
            "play_cnt": 353944,
            "release_date": "1738924539",
            "video": {
              "duration": 67.106,
              "id": "v14025g50000cuiu207og65kloj2m5i0",
              "media_type": "video",
              "post_url": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ooqQFhYfBclEoDSCsXeM8DhrIBAWe18AAs4PAT~tplv-noop.image?x-expires=1740750869&x-signature=jei9yuTnwP9TmY0irOyWt9Pwm2g%3D",
              "video_infos": [
                {
                  "backup_url": "https://v16m.byteicdn.com/5ca72b662b4f05a327aff233fd272cfa/67c1c015/video/tos/alisg/tos-alisg-pve-0037/oUlkHYiibAvX0hBAiVY6v4ZAiAqQFEYP4Ilrr/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=1802&bt=901&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=ODo8Z2gzM2g0aWg2ZjNlaUBpMzg1cm45cjN4eDMzODgzNEBfYDYxXmAwXmAxMGMtNTU0YSNmamdpMmQ0L2ZgLS1kLzFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000&cc=10",
                  "bitrate": 923157,
                  "file_hash": "7a50a8968aa9a2b7a334000cf02706b3",
                  "format": "",
                  "height": 1024,
                  "main_url": "https://v16m-default.akamaized.net/5ca72b662b4f05a327aff233fd272cfa/67c1c015/video/tos/alisg/tos-alisg-pve-0037/oUlkHYiibAvX0hBAiVY6v4ZAiAqQFEYP4Ilrr/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=1802&bt=901&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=ODo8Z2gzM2g0aWg2ZjNlaUBpMzg1cm45cjN4eDMzODgzNEBfYDYxXmAwXmAxMGMtNTU0YSNmamdpMmQ0L2ZgLS1kLzFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000",
                  "size": 7743674,
                  "url_expire": 1740750869,
                  "video_quality": "normal",
                  "width": 576
                }
              ]
            },
            "video_products": [
              {
                "image": "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/f190f2f6675a46f386b2cb66e94f1859~tplv-o3syd03w52-origin-webp.webp?from=3049088325",
                "max_sale_price": {
                  "currency": "VND",
                  "formatted_price": "169K₫",
                  "price": "169000"
                },
                "min_sale_price": {
                  "currency": "VND",
                  "formatted_price": "59K₫",
                  "price": "59000"
                },
                "name": "[COMBO 3 CHAI] Xịt thơm miệng KS Cosmetic - Mouth Spray - Bí quyết giúp bạn trở nên tự tin hơn",
                "product_id": "1731699188041746937"
              }
            ]
          },
          {
            "comment_cnt": 0,
            "item_id": "7472608925678849287",
            "like_cnt": 1457,
            "name": "Thầy ông nội này hôi lắm phải có tý nước hoa mới chịu được anh nhỉ @Thành Râu #emthuythuy #thanhrau #haihuoc #nuochoa #combonuochoa #hssv #hocsinh #cap3 ",
            "play_cnt": 86533,
            "release_date": "1739852353",
            "video": {
              "duration": 59.883,
              "id": "v14044g50000cuq0itvog65i0v1bvm30",
              "media_type": "video",
              "post_url": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oUltDfk3EEOUInC2DIngFB40IqRAAPfGuB4VVr~tplv-noop.image?x-expires=1740750861&x-signature=kbKJmdTB%2BdJp90Dj6p1TL2kEL94%3D",
              "video_infos": [
                {
                  "backup_url": "https://v16m.byteicdn.com/466e61e428f78445e17dcf036e2b4629/67c1c00d/video/tos/alisg/tos-alisg-pve-0037c001/osDGfADtGCyBpFRVnD23lQUEgIA0B4aEKBkAEf/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=2742&bt=1371&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=NDZmZjxpN2k4aDs6NmU8OEBpM3BleWw5cnczeDMzODczNEA0MTZiXjRjNjYxNF9iLzYyYSMwcy4tMmRzZm5gLS1kMTFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000&cc=10",
                  "bitrate": 1404747,
                  "file_hash": "eb45df98c7fbcecc2593a731edc818b6",
                  "format": "",
                  "height": 1024,
                  "main_url": "https://v16m-default.akamaized.net/466e61e428f78445e17dcf036e2b4629/67c1c00d/video/tos/alisg/tos-alisg-pve-0037c001/osDGfADtGCyBpFRVnD23lQUEgIA0B4aEKBkAEf/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=2742&bt=1371&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=NDZmZjxpN2k4aDs6NmU8OEBpM3BleWw5cnczeDMzODczNEA0MTZiXjRjNjYxNF9iLzYyYSMwcy4tMmRzZm5gLS1kMTFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000",
                  "size": 10515064,
                  "url_expire": 1740750861,
                  "video_quality": "normal",
                  "width": 576
                }
              ]
            },
            "video_products": [
              {
                "image": "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/10f0a9e20e3b4312a8389013d842b92d~tplv-o3syd03w52-origin-webp.webp?from=3049088325",
                "max_sale_price": {
                  "currency": "VND",
                  "formatted_price": "149K₫",
                  "price": "149000"
                },
                "min_sale_price": {
                  "currency": "VND",
                  "formatted_price": "29K₫",
                  "price": "29000"
                },
                "name": "Combo 4 chai nước hoa Nam - dung tích 10ml - Lưu hương lâu",
                "product_id": "1731554149722786577"
              }
            ]
          },
          {
            "comment_cnt": 0,
            "item_id": "7467545724746599698",
            "like_cnt": 244,
            "name": "Combo 3 chai nước hoa HSSV thơm rẻ chất cho các bạn học sinh sinh viên nè #emthuythuy #nuochoa #nuochoanam #nuochoanu #unisex @Vy Hoàng Cupid ",
            "play_cnt": 33272,
            "release_date": "1738673483",
            "video": {
              "duration": 50.41,
              "id": "v14044g50000cuh0p8nog65ijq83tkdg",
              "media_type": "video",
              "post_url": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o4EBaiQgUvAF2EgGVfRolofSpyDVBBhQ9VsnPE~tplv-noop.image?x-expires=1740750852&x-signature=igta%2FJIeDp8plGnmjHSITbujNe8%3D",
              "video_infos": [
                {
                  "backup_url": "https://v16m.byteicdn.com/5284eaba754b03e2275f60602799d081/67c1c004/video/tos/alisg/tos-alisg-pve-0037c001/oI10EJiERUSfey6bDgQgvEmoIAPnBlDyNiXBFB/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=3122&bt=1561&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=NzNkNTYzZDM0ZWVkNjo8ZkBpam42dGw5cjszeDMzODczNEAzMmFfM2FeX18xYy5hMWFfYSNhcTVnMmRrbWVgLS1kMTFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00088000&cc=10",
                  "bitrate": 1598750,
                  "file_hash": "c7560d7ffcb630819ad3e8a0fad0b355",
                  "format": "",
                  "height": 1024,
                  "main_url": "https://v16m-default.akamaized.net/5284eaba754b03e2275f60602799d081/67c1c004/video/tos/alisg/tos-alisg-pve-0037c001/oI10EJiERUSfey6bDgQgvEmoIAPnBlDyNiXBFB/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=3122&bt=1561&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=NzNkNTYzZDM0ZWVkNjo8ZkBpam42dGw5cjszeDMzODczNEAzMmFfM2FeX18xYy5hMWFfYSNhcTVnMmRrbWVgLS1kMTFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00088000",
                  "size": 10074128,
                  "url_expire": 1740750852,
                  "video_quality": "normal",
                  "width": 576
                }
              ]
            },
            "video_products": [
              {
                "image": "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/114e44d1a6cc42d09e3aa069179c6e68~tplv-o3syd03w52-origin-webp.webp?from=3049088325",
                "max_sale_price": {
                  "currency": "VND",
                  "formatted_price": "499K₫",
                  "price": "499000"
                },
                "min_sale_price": {
                  "currency": "VND",
                  "formatted_price": "499K₫",
                  "price": "499000"
                },
                "name": "COMBO 3 CHAI NƯỚC HOA NAM-NỮ CÓ HỘP ĐỰNG SANG TRỌNG(lưu hương lên đến 12H) nuochoagiare nuochoanam nuochoanu combonuochoa Xịt Thơm Perfume Xịt Thơm",
                "product_id": "1730383696031942930"
              }
            ]
          }
        ],
        "ec_video_engagement": 268,
        "ec_video_gpm": {
          "maximum": "59503.68",
          "maximum_format": "59.5K₫",
          "minimal": "59503.68",
          "minimal_format": "59.5K₫",
          "symbol": "₫"
        },
        "ec_video_gpm_reference": true,
        "ec_video_med_comment_cnt": "5",
        "ec_video_med_like_cnt": "226",
        "ec_video_med_share_cnt": "1",
        "ec_video_med_view_cnt": "15806",
        "ec_video_play_cnt_med": "15806",
        "ec_video_publish_cnt_30d": "21",
        "follower_ages_v2": null,
        "follower_cnt": "124062",
        "follower_genders_v2": null,
        "follower_state_location": [
          {
            "key": "HA NOI",
            "value": "2450"
          },
          {
            "key": "HO CHI MINH",
            "value": "1387"
          },
          {
            "key": "THANH HOA",
            "value": "257"
          },
          {
            "key": "HAI PHONG",
            "value": "251"
          },
          {
            "key": "BAC GIANG",
            "value": "228"
          }
        ],
        "gpm": {
          "format": "59.5K₫",
          "symbol": "₫",
          "value": "59503.68"
        },
        "gpm_range": null,
        "gpm_reference": true,
        "handle": "emthuythuyyy",
        "has_collaborated": false,
        "has_invited_before_90d": false,
        "industry_groups": [
          {
            "key": "601450",
            "name": "Beauty & Personal Care",
            "value": "0.3905"
          },
          {
            "key": "601352",
            "name": "Shoes",
            "value": "0.2614"
          },
          {
            "key": "601152",
            "name": "Womenswear & Underwear",
            "value": "0.2590"
          },
          {
            "key": "-1",
            "value": "0.0891"
          }
        ],
        "is_creator_blocked_by_shop": false,
        "is_ecom_authorized": null,
        "is_official_recommend": null,
        "is_show_recom_icon": null,
        "live_engagement": 0,
        "live_gmv": {
          "format": "0₫",
          "symbol": "₫",
          "value": "0"
        },
        "live_med_comment_cnt": "0",
        "live_med_like_cnt": "0",
        "live_med_share_cnt": "0",
        "live_med_view_cnt": "0",
        "live_streaming_cnt_30d": "0",
        "med_commission_rate": 1000,
        "med_commission_rate_range": null,
        "med_gmv_revenue": {
          "format": "133.7M₫",
          "symbol": "₫",
          "value": "133738359.53"
        },
        "med_gmv_revenue_range": "1M₫+",
        "nickname": "Em Thuý Thuý",
        "occurred_top_rank": null,
        "partnered_brand": {
          "brand": [
            {
              "id": "7032166671381006081",
              "name": "OLEVS"
            },
            {
              "id": "7046188084756678402",
              "name": "Làng Chài Xưa"
            },
            {
              "id": "7211731421705094917",
              "name": "JULIDO"
            },
            {
              "id": "7211614703284619014",
              "name": "MF MINI FOCUS"
            },
            {
              "id": "7309506990846019334",
              "name": "NESTY Premium Brand"
            },
            {
              "id": "7269987626756294406",
              "name": "HOBE BAR"
            },
            {
              "id": "7179972590616905478",
              "name": "Ăn Cùng Bà Tuyết"
            },
            {
              "id": "7193951614686922502",
              "name": "Vua Đèn Led"
            },
            {
              "id": "7179594211174729477",
              "name": "SD SD DESIGN"
            },
            {
              "id": "7046979877765089025",
              "name": "Celio"
            }
          ],
          "value": [
            {
              "id": "7032166671381006081",
              "name": "OLEVS"
            },
            {
              "id": "7046188084756678402",
              "name": "Làng Chài Xưa"
            },
            {
              "id": "7211731421705094917",
              "name": "JULIDO"
            },
            {
              "id": "7211614703284619014",
              "name": "MF MINI FOCUS"
            },
            {
              "id": "7309506990846019334",
              "name": "NESTY Premium Brand"
            },
            {
              "id": "7269987626756294406",
              "name": "HOBE BAR"
            },
            {
              "id": "7179972590616905478",
              "name": "Ăn Cùng Bà Tuyết"
            },
            {
              "id": "7193951614686922502",
              "name": "Vua Đèn Led"
            },
            {
              "id": "7179594211174729477",
              "name": "SD SD DESIGN"
            },
            {
              "id": "7046979877765089025",
              "name": "Celio"
            }
          ]
        },
        "product_cnt": null,
        "product_price_range": "89.3K₫ - 602.0K₫",
        "promoted_product_num": "44",
        "qr_code_schema": "aweme://user/profile/7402753618010866693?sec_uid=MS4wLjABAAAAB7eb8GMM6dn8acMw_vavjL_VA9z_ZhfDYQNXm6yV4BHX4HkHLmrcXz3lqNiTnfsM&from_scene=8&enter_from=scan",
        "recommend_reason": null,
        "sales_performance_end_time": "1740528000",
        "sample_fulfillment_rate": null,
        "selection_region": "VN",
        "shop_collect_status": false,
        "sorted_creator_labels": null,
        "top_video_data": [
          {
            "comment_cnt": 0,
            "item_id": "7471934276007726343",
            "like_cnt": 14459,
            "name": "Ăn chực nhà anh Tam Mao được đãi con cá mè siêu to khổng lồ gần 20kg và cái kết #emthuythuy #review #tammaotv #teamantruc ",
            "play_cnt": 386894,
            "release_date": "1739695272",
            "video": {
              "duration": 151.672,
              "id": "v14044g50000cuoov1vog65q632uj1eg",
              "media_type": "video",
              "post_url": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o8BxIUODIBpsXIiDKfRpEt6BtfZdYghMQMABin~tplv-noop.image?x-expires=1740750953&x-signature=n7Ani%2BeAdaQwbySRqiMDfbpcSe0%3D",
              "video_infos": [
                {
                  "backup_url": "https://v16m.byteicdn.com/dbe88f05f2f4033e85eda5125d6b3ab4/67c1c069/video/tos/alisg/tos-alisg-pve-0037c001/oof2pxHoYCDFvJ6QhITe0HAQCYeAOPtYDIjxES/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=3884&bt=1942&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=Mzg5NzU4OTw3OjZlNztkPEBpajR4NnQ5cjRyeDMzODczNEBfLzBjXmM2X2IxYzA1LWE0YSNiZy8zMmRzc2xgLS1kMTFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000&cc=10",
                  "bitrate": 1989592,
                  "file_hash": "0d7886f9b6f96e2ad461b2c9cbd7a10e",
                  "format": "",
                  "height": 1024,
                  "main_url": "https://v16m-default.akamaized.net/dbe88f05f2f4033e85eda5125d6b3ab4/67c1c069/video/tos/alisg/tos-alisg-pve-0037c001/oof2pxHoYCDFvJ6QhITe0HAQCYeAOPtYDIjxES/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=3884&bt=1942&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=Mzg5NzU4OTw3OjZlNztkPEBpajR4NnQ5cjRyeDMzODczNEBfLzBjXmM2X2IxYzA1LWE0YSNiZy8zMmRzc2xgLS1kMTFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000",
                  "size": 37720685,
                  "url_expire": 1740750953,
                  "video_quality": "normal",
                  "width": 576
                }
              ]
            }
          },
          {
            "comment_cnt": 0,
            "item_id": "7468624007466667272",
            "like_cnt": 4491,
            "name": "Muốn có NY hun Ny thì miệng phải thơm tho nha các tình iu #xitthommieng #thommieng #xitthommiengks #xitthommieng89k #kscosmetic #xuhuong #gioitreviet #girlpho #boypho #hocsinh",
            "play_cnt": 353944,
            "release_date": "1738924539",
            "video": {
              "duration": 67.106,
              "id": "v14025g50000cuiu207og65kloj2m5i0",
              "media_type": "video",
              "post_url": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ooqQFhYfBclEoDSCsXeM8DhrIBAWe18AAs4PAT~tplv-noop.image?x-expires=1740750869&x-signature=jei9yuTnwP9TmY0irOyWt9Pwm2g%3D",
              "video_infos": [
                {
                  "backup_url": "https://v16m.byteicdn.com/5ca72b662b4f05a327aff233fd272cfa/67c1c015/video/tos/alisg/tos-alisg-pve-0037/oUlkHYiibAvX0hBAiVY6v4ZAiAqQFEYP4Ilrr/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=1802&bt=901&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=ODo8Z2gzM2g0aWg2ZjNlaUBpMzg1cm45cjN4eDMzODgzNEBfYDYxXmAwXmAxMGMtNTU0YSNmamdpMmQ0L2ZgLS1kLzFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000&cc=10",
                  "bitrate": 923157,
                  "file_hash": "7a50a8968aa9a2b7a334000cf02706b3",
                  "format": "",
                  "height": 1024,
                  "main_url": "https://v16m-default.akamaized.net/5ca72b662b4f05a327aff233fd272cfa/67c1c015/video/tos/alisg/tos-alisg-pve-0037/oUlkHYiibAvX0hBAiVY6v4ZAiAqQFEYP4Ilrr/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=1802&bt=901&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=ODo8Z2gzM2g0aWg2ZjNlaUBpMzg1cm45cjN4eDMzODgzNEBfYDYxXmAwXmAxMGMtNTU0YSNmamdpMmQ0L2ZgLS1kLzFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000",
                  "size": 7743674,
                  "url_expire": 1740750869,
                  "video_quality": "normal",
                  "width": 576
                }
              ]
            },
            "video_products": [
              {
                "image": "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/f190f2f6675a46f386b2cb66e94f1859~tplv-o3syd03w52-origin-webp.webp?from=3049088325",
                "max_sale_price": {
                  "currency": "VND",
                  "formatted_price": "169K₫",
                  "price": "169000"
                },
                "min_sale_price": {
                  "currency": "VND",
                  "formatted_price": "59K₫",
                  "price": "59000"
                },
                "name": "[COMBO 3 CHAI] Xịt thơm miệng KS Cosmetic - Mouth Spray - Bí quyết giúp bạn trở nên tự tin hơn",
                "product_id": "1731699188041746937"
              }
            ]
          },
          {
            "comment_cnt": 0,
            "item_id": "7470391232678694152",
            "like_cnt": 8164,
            "name": "Top 10 dấu hiệu nhận biết Girl phố Sài Gòn và cái kết khi gặp \"girl phố\" @hienluongxink ở Hà Nội #emthuythuy #phongvan #girlpho #hienluong #top10 #gaixinh #boypho #xuhuong #gioitreviet",
            "play_cnt": 303003,
            "release_date": "1739336003",
            "video": {
              "duration": 176.589,
              "id": "v14025g50000cum2gcnog65hkske1940",
              "media_type": "video",
              "post_url": "https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/o0DI7ivGZmMYjYgEwIyVEklA8AXx6sppKoAiB~tplv-noop.image?x-expires=1740750978&x-signature=UvGE69y7K%2BD5CDx2HDA7agOoKOQ%3D",
              "video_infos": [
                {
                  "backup_url": "https://v16m.byteicdn.com/71d9b6b54cec58beaeb11192c81b2c3a/67c1c082/video/tos/alisg/tos-alisg-pve-0037/o8YAAKEZTplA6Iisp2jIovvCoQijMBybwgVxY/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=2532&bt=1266&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=NGczNzo6O2k5OGhpZ2c4O0BpMzxodms5cmY1eDMzODgzNEBiLl9fMS8yXzMxLl4yMDYvYSMxLmhoMmRrZGpgLS1kLzFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000&cc=10",
                  "bitrate": 1296711,
                  "file_hash": "b10e6a38a0edcd3b0b3655f1addc6408",
                  "format": "",
                  "height": 1024,
                  "main_url": "https://v16m-default.akamaized.net/71d9b6b54cec58beaeb11192c81b2c3a/67c1c082/video/tos/alisg/tos-alisg-pve-0037/o8YAAKEZTplA6Iisp2jIovvCoQijMBybwgVxY/?a=0&bti=ODc5NWYtLjE6&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&cv=1&br=2532&bt=1266&cs=0&ds=3&ft=.cwOVInz7ThAPY-OXq8Zmo&mime_type=video_mp4&qs=0&rc=NGczNzo6O2k5OGhpZ2c4O0BpMzxodms5cmY1eDMzODgzNEBiLl9fMS8yXzMxLl4yMDYvYSMxLmhoMmRrZGpgLS1kLzFzcw%3D%3D&vvpl=1&l=202502280753170A0BF2E7E633100299AD&btag=e00090000",
                  "size": 28623129,
                  "url_expire": 1740750978,
                  "video_quality": "normal",
                  "width": 576
                }
              ]
            }
          }
        ],
        "units_sold": "1263",
        "units_sold_range": null,
        "video_avg_view_cnt": null,
        "video_engagement": 239,
        "video_gmv": {
          "format": "132.5M₫",
          "symbol": "₫",
          "value": "132545906.60"
        },
        "video_med_comment_cnt": "0",
        "video_med_like_cnt": "36",
        "video_med_share_cnt": "0",
        "video_med_view_cnt": "2212",
        "video_play_cnt_med": "2212",
        "video_publish_cnt_30d": "72"
      },
      "creator_profile_trend_data": [
        {
          "filter": null,
          "stats": [
            {
              "end_timestamp": 1738108800,
              "profile": {
                "trend_ec_video_engagement_rate": 316,
                "trend_ec_video_play_cnt": "44454",
                "trend_follower": "103545",
                "trend_gmv": {
                  "format": "1.7M₫",
                  "symbol": "₫",
                  "value": "1738821.88"
                },
                "trend_units_sold": "14",
                "trend_video_engagement_rate": 469,
                "trend_video_play_cnt": "922162"
              },
              "start_timestamp": 1738022400,
              "stats": null
            },
            {
              "end_timestamp": 1738195200,
              "profile": {
                "trend_ec_video_engagement_rate": 252,
                "trend_ec_video_play_cnt": "37317",
                "trend_follower": "104721",
                "trend_gmv": {
                  "format": "1.9M₫",
                  "symbol": "₫",
                  "value": "1859455.34"
                },
                "trend_units_sold": "17",
                "trend_video_engagement_rate": 475,
                "trend_video_play_cnt": "735793"
              },
              "start_timestamp": 1738108800,
              "stats": null
            },
            {
              "end_timestamp": 1738281600,
              "profile": {
                "trend_ec_video_engagement_rate": 266,
                "trend_ec_video_play_cnt": "51027",
                "trend_follower": "105803",
                "trend_gmv": {
                  "format": "4.7M₫",
                  "symbol": "₫",
                  "value": "4690628.96"
                },
                "trend_units_sold": "34",
                "trend_video_engagement_rate": 465,
                "trend_video_play_cnt": "821830"
              },
              "start_timestamp": 1738195200,
              "stats": null
            },
            {
              "end_timestamp": 1738368000,
              "profile": {
                "trend_ec_video_engagement_rate": 316,
                "trend_ec_video_play_cnt": "56908",
                "trend_follower": "106913",
                "trend_gmv": {
                  "format": "4.1M₫",
                  "symbol": "₫",
                  "value": "4141801.34"
                },
                "trend_units_sold": "31",
                "trend_video_engagement_rate": 433,
                "trend_video_play_cnt": "736005"
              },
              "start_timestamp": 1738281600,
              "stats": null
            },
            {
              "end_timestamp": 1738454400,
              "profile": {
                "trend_ec_video_engagement_rate": 296,
                "trend_ec_video_play_cnt": "55198",
                "trend_follower": "107854",
                "trend_gmv": {
                  "format": "5.5M₫",
                  "symbol": "₫",
                  "value": "5540888.34"
                },
                "trend_units_sold": "44",
                "trend_video_engagement_rate": 439,
                "trend_video_play_cnt": "533834"
              },
              "start_timestamp": 1738368000,
              "stats": null
            },
            {
              "end_timestamp": 1738540800,
              "profile": {
                "trend_ec_video_engagement_rate": 291,
                "trend_ec_video_play_cnt": "59791",
                "trend_follower": "108511",
                "trend_gmv": {
                  "format": "7.9M₫",
                  "symbol": "₫",
                  "value": "7927898.81"
                },
                "trend_units_sold": "52",
                "trend_video_engagement_rate": 376,
                "trend_video_play_cnt": "634834"
              },
              "start_timestamp": 1738454400,
              "stats": null
            },
            {
              "end_timestamp": 1738627200,
              "profile": {
                "trend_ec_video_engagement_rate": 238,
                "trend_ec_video_play_cnt": "82124",
                "trend_follower": "109593",
                "trend_gmv": {
                  "format": "5.3M₫",
                  "symbol": "₫",
                  "value": "5328824.87"
                },
                "trend_units_sold": "46",
                "trend_video_engagement_rate": 337,
                "trend_video_play_cnt": "467418"
              },
              "start_timestamp": 1738540800,
              "stats": null
            },
            {
              "end_timestamp": 1738713600,
              "profile": {
                "trend_ec_video_engagement_rate": 294,
                "trend_ec_video_play_cnt": "54543",
                "trend_follower": "111352",
                "trend_gmv": {
                  "format": "4.5M₫",
                  "symbol": "₫",
                  "value": "4535239.83"
                },
                "trend_units_sold": "37",
                "trend_video_engagement_rate": 403,
                "trend_video_play_cnt": "235463"
              },
              "start_timestamp": 1738627200,
              "stats": null
            },
            {
              "end_timestamp": 1738800000,
              "profile": {
                "trend_ec_video_engagement_rate": 264,
                "trend_ec_video_play_cnt": "89353",
                "trend_follower": "111877",
                "trend_gmv": {
                  "format": "4.9M₫",
                  "symbol": "₫",
                  "value": "4877414.84"
                },
                "trend_units_sold": "45",
                "trend_video_engagement_rate": 373,
                "trend_video_play_cnt": "292130"
              },
              "start_timestamp": 1738713600,
              "stats": null
            },
            {
              "end_timestamp": 1738886400,
              "profile": {
                "trend_ec_video_engagement_rate": 248,
                "trend_ec_video_play_cnt": "51032",
                "trend_follower": "112900",
                "trend_gmv": {
                  "format": "3.8M₫",
                  "symbol": "₫",
                  "value": "3796153.28"
                },
                "trend_units_sold": "31",
                "trend_video_engagement_rate": 375,
                "trend_video_play_cnt": "173279"
              },
              "start_timestamp": 1738800000,
              "stats": null
            },
            {
              "end_timestamp": 1738972800,
              "profile": {
                "trend_ec_video_engagement_rate": 300,
                "trend_ec_video_play_cnt": "42617",
                "trend_follower": "113239",
                "trend_gmv": {
                  "format": "4.0M₫",
                  "symbol": "₫",
                  "value": "4008349.16"
                },
                "trend_units_sold": "37",
                "trend_video_engagement_rate": 379,
                "trend_video_play_cnt": "160020"
              },
              "start_timestamp": 1738886400,
              "stats": null
            },
            {
              "end_timestamp": 1739059200,
              "profile": {
                "trend_ec_video_engagement_rate": 508,
                "trend_ec_video_play_cnt": "84893",
                "trend_follower": "113517",
                "trend_gmv": {
                  "format": "6.4M₫",
                  "symbol": "₫",
                  "value": "6422731.45"
                },
                "trend_units_sold": "89",
                "trend_video_engagement_rate": 413,
                "trend_video_play_cnt": "227537"
              },
              "start_timestamp": 1738972800,
              "stats": null
            },
            {
              "end_timestamp": 1739145600,
              "profile": {
                "trend_ec_video_engagement_rate": 379,
                "trend_ec_video_play_cnt": "78370",
                "trend_follower": "113799",
                "trend_gmv": {
                  "format": "5.1M₫",
                  "symbol": "₫",
                  "value": "5129205.13"
                },
                "trend_units_sold": "58",
                "trend_video_engagement_rate": 375,
                "trend_video_play_cnt": "232635"
              },
              "start_timestamp": 1739059200,
              "stats": null
            },
            {
              "end_timestamp": 1739232000,
              "profile": {
                "trend_ec_video_engagement_rate": 231,
                "trend_ec_video_play_cnt": "65218",
                "trend_follower": "114234",
                "trend_gmv": {
                  "format": "4.9M₫",
                  "symbol": "₫",
                  "value": "4943857.83"
                },
                "trend_units_sold": "55",
                "trend_video_engagement_rate": 325,
                "trend_video_play_cnt": "235493"
              },
              "start_timestamp": 1739145600,
              "stats": null
            },
            {
              "end_timestamp": 1739318400,
              "profile": {
                "trend_ec_video_engagement_rate": 313,
                "trend_ec_video_play_cnt": "60364",
                "trend_follower": "114773",
                "trend_gmv": {
                  "format": "5.6M₫",
                  "symbol": "₫",
                  "value": "5629387.03"
                },
                "trend_units_sold": "52",
                "trend_video_engagement_rate": 364,
                "trend_video_play_cnt": "217355"
              },
              "start_timestamp": 1739232000,
              "stats": null
            },
            {
              "end_timestamp": 1739404800,
              "profile": {
                "trend_ec_video_engagement_rate": 252,
                "trend_ec_video_play_cnt": "63414",
                "trend_follower": "115182",
                "trend_gmv": {
                  "format": "4.3M₫",
                  "symbol": "₫",
                  "value": "4324774.01"
                },
                "trend_units_sold": "45",
                "trend_video_engagement_rate": 316,
                "trend_video_play_cnt": "424452"
              },
              "start_timestamp": 1739318400,
              "stats": null
            },
            {
              "end_timestamp": 1739491200,
              "profile": {
                "trend_ec_video_engagement_rate": 134,
                "trend_ec_video_play_cnt": "279422",
                "trend_follower": "115828",
                "trend_gmv": {
                  "format": "5.1M₫",
                  "symbol": "₫",
                  "value": "5098072.94"
                },
                "trend_units_sold": "57",
                "trend_video_engagement_rate": 258,
                "trend_video_play_cnt": "636950"
              },
              "start_timestamp": 1739404800,
              "stats": null
            },
            {
              "end_timestamp": 1739577600,
              "profile": {
                "trend_ec_video_engagement_rate": 348,
                "trend_ec_video_play_cnt": "47099",
                "trend_follower": "116398",
                "trend_gmv": {
                  "format": "4.2M₫",
                  "symbol": "₫",
                  "value": "4224532.31"
                },
                "trend_units_sold": "37",
                "trend_video_engagement_rate": 358,
                "trend_video_play_cnt": "315005"
              },
              "start_timestamp": 1739491200,
              "stats": null
            },
            {
              "end_timestamp": 1739664000,
              "profile": {
                "trend_ec_video_engagement_rate": 365,
                "trend_ec_video_play_cnt": "65225",
                "trend_follower": "116756",
                "trend_gmv": {
                  "format": "4.3M₫",
                  "symbol": "₫",
                  "value": "4279381.24"
                },
                "trend_units_sold": "37",
                "trend_video_engagement_rate": 366,
                "trend_video_play_cnt": "403076"
              },
              "start_timestamp": 1739577600,
              "stats": null
            },
            {
              "end_timestamp": 1739750400,
              "profile": {
                "trend_ec_video_engagement_rate": 202,
                "trend_ec_video_play_cnt": "210729",
                "trend_follower": "117242",
                "trend_gmv": {
                  "format": "5.6M₫",
                  "symbol": "₫",
                  "value": "5620341.91"
                },
                "trend_units_sold": "54",
                "trend_video_engagement_rate": 332,
                "trend_video_play_cnt": "682919"
              },
              "start_timestamp": 1739664000,
              "stats": null
            },
            {
              "end_timestamp": 1739836800,
              "profile": {
                "trend_ec_video_engagement_rate": 290,
                "trend_ec_video_play_cnt": "73999",
                "trend_follower": "118788",
                "trend_gmv": {
                  "format": "5.7M₫",
                  "symbol": "₫",
                  "value": "5733162.34"
                },
                "trend_units_sold": "56",
                "trend_video_engagement_rate": 330,
                "trend_video_play_cnt": "620523"
              },
              "start_timestamp": 1739750400,
              "stats": null
            },
            {
              "end_timestamp": 1739923200,
              "profile": {
                "trend_ec_video_engagement_rate": 281,
                "trend_ec_video_play_cnt": "101523",
                "trend_follower": "120266",
                "trend_gmv": {
                  "format": "2.8M₫",
                  "symbol": "₫",
                  "value": "2775596.57"
                },
                "trend_units_sold": "26",
                "trend_video_engagement_rate": 334,
                "trend_video_play_cnt": "438846"
              },
              "start_timestamp": 1739836800,
              "stats": null
            },
            {
              "end_timestamp": 1740009600,
              "profile": {
                "trend_ec_video_engagement_rate": 253,
                "trend_ec_video_play_cnt": "103943",
                "trend_follower": "121077",
                "trend_gmv": {
                  "format": "4.6M₫",
                  "symbol": "₫",
                  "value": "4572086.54"
                },
                "trend_units_sold": "48",
                "trend_video_engagement_rate": 328,
                "trend_video_play_cnt": "413126"
              },
              "start_timestamp": 1739923200,
              "stats": null
            },
            {
              "end_timestamp": 1740096000,
              "profile": {
                "trend_ec_video_engagement_rate": 228,
                "trend_ec_video_play_cnt": "122320",
                "trend_follower": "121672",
                "trend_gmv": {
                  "format": "4.7M₫",
                  "symbol": "₫",
                  "value": "4732621.28"
                },
                "trend_units_sold": "50",
                "trend_video_engagement_rate": 306,
                "trend_video_play_cnt": "289620"
              },
              "start_timestamp": 1740009600,
              "stats": null
            },
            {
              "end_timestamp": 1740182400,
              "profile": {
                "trend_ec_video_engagement_rate": 327,
                "trend_ec_video_play_cnt": "43685",
                "trend_follower": "122048",
                "trend_gmv": {
                  "format": "2.8M₫",
                  "symbol": "₫",
                  "value": "2788935.51"
                },
                "trend_units_sold": "27",
                "trend_video_engagement_rate": 349,
                "trend_video_play_cnt": "211486"
              },
              "start_timestamp": 1740096000,
              "stats": null
            },
            {
              "end_timestamp": 1740268800,
              "profile": {
                "trend_ec_video_engagement_rate": 387,
                "trend_ec_video_play_cnt": "54380",
                "trend_follower": "122337",
                "trend_gmv": {
                  "format": "3.6M₫",
                  "symbol": "₫",
                  "value": "3634414.71"
                },
                "trend_units_sold": "35",
                "trend_video_engagement_rate": 367,
                "trend_video_play_cnt": "230980"
              },
              "start_timestamp": 1740182400,
              "stats": null
            },
            {
              "end_timestamp": 1740355200,
              "profile": {
                "trend_ec_video_engagement_rate": 294,
                "trend_ec_video_play_cnt": "68056",
                "trend_follower": "122666",
                "trend_gmv": {
                  "format": "5.2M₫",
                  "symbol": "₫",
                  "value": "5225145.25"
                },
                "trend_units_sold": "49",
                "trend_video_engagement_rate": 321,
                "trend_video_play_cnt": "272726"
              },
              "start_timestamp": 1740268800,
              "stats": null
            },
            {
              "end_timestamp": 1740441600,
              "profile": {
                "trend_ec_video_engagement_rate": 270,
                "trend_ec_video_play_cnt": "55491",
                "trend_follower": "123013",
                "trend_gmv": {
                  "format": "4.3M₫",
                  "symbol": "₫",
                  "value": "4330219.59"
                },
                "trend_units_sold": "43",
                "trend_video_engagement_rate": 320,
                "trend_video_play_cnt": "341368"
              },
              "start_timestamp": 1740355200,
              "stats": null
            },
            {
              "end_timestamp": 1740528000,
              "profile": {
                "trend_ec_video_engagement_rate": 279,
                "trend_ec_video_play_cnt": "49278",
                "trend_follower": "123524",
                "trend_gmv": {
                  "format": "3.0M₫",
                  "symbol": "₫",
                  "value": "3007382.67"
                },
                "trend_units_sold": "30",
                "trend_video_engagement_rate": 300,
                "trend_video_play_cnt": "636043"
              },
              "start_timestamp": 1740441600,
              "stats": null
            },
            {
              "end_timestamp": 1740614400,
              "profile": {
                "trend_ec_video_engagement_rate": 222,
                "trend_ec_video_play_cnt": "48411",
                "trend_follower": "124062",
                "trend_gmv": {
                  "format": "2.8M₫",
                  "symbol": "₫",
                  "value": "2821034.58"
                },
                "trend_units_sold": "27",
                "trend_video_engagement_rate": 317,
                "trend_video_play_cnt": "556160"
              },
              "start_timestamp": 1740528000,
              "stats": null
            }
          ],
          "time_selector": null
        }
      ]
    }
  },
  // ...
]
```

**Response:**

*   **Status Code:** `200 OK`

## 3. Submit Crawl Errors

**Request:**

*   **Method:** `POST`
*   **Content Type:** `application/json`

**Body (JSON - Example):**

```json
[
  {
    "data": {
      "creator_id": "creator_id_1"
    },
    "code": "affiliate.creator_not_found",
    "message": "Creator not found in affiliate system"
  },
  {
    "data": {
      "creator_id": "creator_id_2"
    },
    "code": "affiliate.creator_has_no_profiles",
    "message": "Creator 'creator_id_2' has no profiles."
  },
  // ...
]
```

**Response:**

*   **Status Code:** `200 OK`
