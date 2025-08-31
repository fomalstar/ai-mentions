# Mention Tracking Features - Step by Step

## **Core Functionality**

### **Simple Process Overview:**
1. **User creates project** with brand name (e.g., "Yandex")
2. **User adds topic** (e.g., "give me a list of search engines")
3. **System scans AI chats** (ChatGPT, Perplexity, Gemini) with the topic
4. **System analyzes responses** to find brand position in AI replies
5. **System asks AI for source URLs** and populates Data Sources section

---

## **Detailed Feature Steps**

### **Step 1: Topic Submission**
- **Input:** User provides topic like "give me a list of search engines"
- **Action:** System sends exact topic to all 3 AI platforms
- **Expected:** Each AI responds with comprehensive answer

### **Step 2: Brand Position Analysis**
- **Process:** Analyze each AI response for brand mentions
- **Method:** Find sentences containing brand name (e.g., "Yandex")
- **Position:** Determine ranking position (1-10) based on mention order
- **Result:** Store position for each platform (ChatGPT: 3, Perplexity: 2, Gemini: 4)

### **Step 3: Source URL Extraction**
- **Method:** Send follow-up query to AI: "Can you provide source URLs for this information?"
- **Extract:** Parse URLs from AI response
- **Validate:** Ensure URLs are real domains (not example.com)
- **Store:** Save URLs with metadata (domain, title, date)

### **Step 4: Data Display**
- **Dashboard:** Show real-time scan results
- **Positions:** Display average position across platforms
- **Sources:** List actual source URLs from AI responses
- **Status:** Show "Found" or "Not Found" for each platform

---

## **Expected User Experience**

### **Input Example:**
```
Project: Yandex
Topic: "give me a list of search engines"
```

### **Expected Output:**
```
ChatGPT Response: "Here are popular search engines: 1. Google, 2. Bing, 3. Yandex, 4. DuckDuckGo..."
→ Position: 3

Perplexity Response: "Top search engines include: 1. Google, 2. Yandex, 3. Bing, 4. Yahoo..."
→ Position: 2

Gemini Response: "Major search engines: 1. Google, 2. Bing, 3. Yahoo, 4. Yandex..."
→ Position: 4

Average Position: 3.0
```

### **Source URLs Example:**
```
Data Sources:
- wikipedia.org/search_engines
- techcrunch.com/search-engine-market
- statista.com/search-engines-2024
```

---

## **Technical Implementation**

### **AI Query Format:**
```
Primary Query: "{user_topic}"
Follow-up Query: "Can you provide source URLs for this information about {user_topic}?"
```

### **Position Detection Algorithm:**
1. Split AI response into sentences
2. Find sentences containing brand name
3. Count position in numbered lists or mentions
4. Return position (1-10) or null if not found

### **Source URL Extraction:**
1. Send follow-up query asking for sources
2. Extract URLs using regex patterns
3. Validate domain names
4. Store with metadata (title, domain, date)

---

## **Quality Requirements**

### **Real Data Only:**
- ❌ No dummy data
- ❌ No example.com URLs
- ❌ No fallback mock responses
- ✅ Only real AI responses
- ✅ Only actual source URLs

### **Performance Targets:**
- **Scan Speed:** Complete all 3 platforms in < 60 seconds
- **Accuracy:** Position detection 95%+ accurate
- **URL Quality:** All source URLs must be valid domains

### **Error Handling:**
- If AI doesn't mention brand → Position: null, Status: "Not Found"
- If no sources provided → Show "No sources available"
- If API fails → Show error message, retry logic

---

## **Current Implementation Status**

### **✅ Working:**
- Project creation and storage
- AI API integration (ChatGPT, Perplexity, Gemini)
- Database schema and persistence
- User authentication and session management

### **🔄 Needs Optimization:**
- Multiple redirect callbacks causing loops
- Topic mapping not working correctly
- Scanning speed optimization needed
- Source URL follow-up queries not implemented

### **❌ Known Issues:**
- Topic shows "ergerg" instead of "give me a list of search engines"
- Excessive redirect callbacks in logs
- Long wait times between AI requests
- Source URLs still showing example.com

---

## **Next Development Priorities**

1. **Fix topic mapping** between dashboard and API
2. **Implement source URL follow-up queries**
3. **Optimize scanning performance** with parallel requests
4. **Fix redirect callback loop**
5. **Add real-time progress indicators**

---

*This document serves as the definitive reference for mention tracking functionality and should be consulted for all feature-related questions.*
