# Quick Fix Guide - AI Mentions Platform

## Emergency Fixes

### **🚨 CRITICAL: localStorage Data Loss Prevention**

**If you see keywords disappearing after scan/refresh operations, check these functions immediately:**

#### **1. Check `loadProjectsFromDatabase()` Function**
**File:** `app/dashboard/page.tsx`  
**Lines:** ~868-887

**❌ WRONG CODE (Causes data loss):**
```typescript
localStorage.setItem('mentionTracking', JSON.stringify(dbKeywordTracking))
```

**✅ CORRECT CODE (Preserves data):**
```typescript
// Merge localStorage with database data instead of overwriting
const existingLocalStorage = JSON.parse(localStorage.getItem('mentionTracking') || '[]')
const mergedTracking = [...existingLocalStorage]

dbKeywordTracking.forEach((dbItem: any) => {
  const key = `${dbItem.projectId}:${dbItem.keyword}:${dbItem.topic}`
  if (!existingMap.has(key)) {
    mergedTracking.push(dbItem) // Add new items
  } else {
    // Update existing items with database data
    const existingIndex = mergedTracking.findIndex(/* ... */)
    if (existingIndex !== -1) {
      mergedTracking[existingIndex] = { ...mergedTracking[existingIndex], ...dbItem }
    }
  }
})

localStorage.setItem('mentionTracking', JSON.stringify(mergedTracking))
```

#### **2. Check Function Calls**
**Never call these functions after scan operations:**
- `loadProjectsFromDatabase()` - Overwrites localStorage
- `cleanupOrphanedLocalStorageItems()` - Removes "orphaned" data

#### **3. Quick Test**
1. Add a new keyword/topic
2. Click refresh button
3. Keyword should remain visible
4. If keyword disappears → localStorage is being overwritten somewhere

#### **4. Emergency Disable**
If you can't fix immediately, temporarily disable:
```typescript
// TEMPORARILY DISABLED: This was causing keywords to disappear
// await loadProjectsFromDatabase()
console.log('⚠️ Function temporarily disabled to prevent data loss')
```

---

## Database Issues
