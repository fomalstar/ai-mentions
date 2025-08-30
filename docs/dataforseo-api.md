# DataForSEO AI Keyword Search Volume API Documentation

## Endpoint
```
POST https://api.dataforseo.com/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live
```

## Authentication
```bash
# Instead of 'login' and 'password' use your credentials from https://app.dataforseo.com/api-access
login="login"
password="password"
cred="$(printf ${login}:${password} | base64)"
curl --location --request POST "https://api.dataforseo.com/v3/ai_optimization/ai_keyword_data/keywords_search_volume/live" \
--header "Authorization: Basic ${cred}" \
--header "Content-Type: application/json" \
--data-raw '[
  {
    "language_name": "English",
    "location_code": 2840,
    "keywords": [
      "iphone",
      "seo"
    ]
  }
]'
```

## Request Parameters

| Field Name | Type | Description | Required |
|------------|------|-------------|----------|
| `keywords` | array | keywords (max 1000) | ✅ |
| `location_name` | string | full name of the location | Required if no location_code |
| `location_code` | integer | unique location identifier | Required if no location_name |
| `language_name` | string | full name of the language | Required if no language_code |
| `language_code` | string | language code | Required if no language_name |
| `tag` | string | user-defined task identifier (optional) | ❌ |

## Response Structure

```json
{
  "version": "0.1.20250526",
  "status_code": 20000,
  "status_message": "Ok.",
  "time": "0.3281 sec.",
  "cost": 0,
  "tasks_count": 1,
  "tasks_error": 0,
  "tasks": [
    {
      "id": "07091646-1535-0619-0000-34aa8225bd23",
      "status_code": 20000,
      "status_message": "Ok.",
      "time": "0.2683 sec.",
      "cost": 0,
      "result_count": 1,
      "path": [
        "v3",
        "ai_optimization",
        "ai_keyword_data",
        "keywords_search_volume",
        "live"
      ],
      "data": {
        "api": "ai_optimization",
        "function": "keywords_search_volume",
        "language_name": "English",
        "location_code": 2840,
        "keywords": [
          "iphone",
          "seo"
        ]
      },
      "result": [
        {
          "location_code": 2840,
          "language_code": "en",
          "items_count": 2,
          "items": [
            {
              "keyword": "iphone",
              "ai_search_volume": 407838,
              "ai_monthly_searches": [
                {
                  "year": 2025,
                  "month": 5,
                  "ai_search_volume": 407838
                },
                {
                  "year": 2025,
                  "month": 4,
                  "ai_search_volume": 413611
                }
                // ... more monthly data
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Key Features

- **AI Search Volume**: Current AI search volume rate for keywords
- **Monthly Trends**: Up to 12 months of historical data
- **Location Support**: Country-specific data (location_code 2840 = US)
- **Language Support**: Multiple language support
- **Batch Processing**: Up to 1000 keywords per request
- **Rate Limiting**: 2000 API calls per minute, max 30 simultaneous requests

## Cost Information
- Your account will be charged for each request
- Cost can be calculated on the Pricing page
- All POST data should be sent in JSON format (UTF-8 encoding)

## Usage Examples

### Single Keyword
```json
[
  {
    "language_name": "English",
    "location_code": 2840,
    "keywords": ["iphone"]
  }
]
```

### Multiple Keywords
```json
[
  {
    "language_name": "English",
    "location_code": 2840,
    "keywords": ["iphone", "seo", "ai tools", "machine learning"]
  }
]
```

### With Tag for Tracking
```json
[
  {
    "language_name": "English",
    "location_code": 2840,
    "keywords": ["iphone"],
    "tag": "my-analysis-001"
  }
]
```

## Error Handling
- Check `status_code` for success (20000 = Ok)
- Handle rate limiting (2000 calls/minute)
- Monitor costs per request
- Keywords are converted to lowercase automatically
