# Browser Testing Guide for Analytics Dashboard

## Dev Server Status

The development server is running at: **http://localhost:5173**

## Testing Checklist

### 1. Basic Functionality
- [ ] App loads without errors
- [ ] Navigation includes "Analytics" button
- [ ] Clicking "Analytics" tab shows dashboard

### 2. Empty State Testing
- [ ] With no entries: Shows "No Data Available" message
- [ ] With no collective data: Still works with user entries only
- [ ] Word cloud handles empty data gracefully

### 3. With User Entries Only
- [ ] Create a journal entry (Day 1)
- [ ] Go to Analytics tab
- [ ] Verify:
  - Total responses shows 1
- [ ] Personal stats show your journey
- [ ] Word appears in top words list
- [ ] Word cloud displays your word

### 4. With Multiple Entries
- [ ] Create entries for multiple days (Days 1-3)
- [ ] Verify:
  - Journey timeline shows all days
  - Streak counter works
  - Unique vs repeated words counted correctly

### 5. With Collective Data
- [ ] Go to Collective tab
- [ ] Import a signature via QR code or file
- [ ] Go to Analytics tab
- [ ] Verify:
  - Total responses includes imported data
  - Top words include words from collective data
  - Unity score appears if multiple days of data
  - Comparative metrics show day-over-day changes

### 6. Real-Time Updates
- [ ] Add a new journal entry
- [ ] Switch to Analytics tab
- [ ] Verify metrics update immediately
- [ ] Import new collective data
- [ ] Verify analytics update

### 7. Edge Cases
- [ ] Empty word field (should handle gracefully)
- [ ] Invalid timestamps (should not crash)
- [ ] Missing entry properties (should not crash)
- [ ] Very large word count (performance check)

### 8. Visual Checks
- [ ] Word cloud renders correctly
- [ ] Unity score gauge displays properly
- [ ] Top words list is styled correctly
- [ ] Personal stats cards are readable
- [ ] Comparative metrics charts render

### 9. Performance
- [ ] With 100+ entries, page remains responsive
- [ ] Word cloud renders within 1-2 seconds
- [ ] Switching between tabs is smooth

## Common Issues to Check

1. **Console Errors**: Check browser console for:
   - TypeScript errors
   - Runtime errors
   - Missing dependencies

2. **Canvas Rendering**: Word cloud uses canvas - verify:
   - Canvas element is created
   - Words are rendered
   - Colors are visible

3. **Date Handling**: Verify:
   - Today's date is calculated correctly
   - Yesterday's date is correct
   - Date filtering works properly

4. **Memoization**: Check that:
   - Metrics don't recalculate unnecessarily
   - Updates happen when data changes

## Test Data Suggestions

### Sample Entry 1:
- Word: "love"
- Day: 1
- Timestamp: Today

### Sample Entry 2:
- Word: "peace"
- Day: 2
- Timestamp: Today

### Sample Entry 3:
- Word: "love" (repeat)
- Day: 3
- Timestamp: Today

This will test:
- Word frequency counting
- Unique vs repeated words
- Journey tracking
- Ranking

## Browser Compatibility

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (if available)
- Edge (if available)

## Reporting Issues

If you find issues:
1. Check browser console for errors
2. Note which browser/version
3. Describe steps to reproduce
4. Include any error messages

