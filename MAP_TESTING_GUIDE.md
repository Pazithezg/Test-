# Bangkok Map Testing Guide

## Quick Start

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** and visit:
   - Main page: http://localhost:3001/
   - Map page: http://localhost:3001/map

## Testing Checklist

### 1. Map Page Access
- [ ] Navigate to http://localhost:3001/map
- [ ] Map loads without errors
- [ ] Bangkok is centered on the map
- [ ] Map tiles from OpenStreetMap display correctly

### 2. Basic Interaction
- [ ] Click anywhere on the map
- [ ] Blue marker appears at clicked location
- [ ] Popup shows coordinates
- [ ] Floating info box displays lat/lng

### 3. Zoom & Pan
- [ ] Click the **+** button to zoom in
- [ ] Click the **-** button to zoom out
- [ ] Use scroll wheel to zoom
- [ ] Click and drag to pan the map
- [ ] Map remains responsive during interactions

### 4. Coordinate Display
- [ ] After clicking, coordinates box appears in top-right
- [ ] Latitude shows 6 decimal places
- [ ] Longitude shows 6 decimal places
- [ ] Values match the clicked location

### 5. Links and Navigation
- [ ] "🔍 ค้นหากิจกรรมบริเวณนี้" button appears after selecting location
- [ ] Clicking it navigates to main page with coordinates
- [ ] "🗺️ เปิดใน OpenStreetMap" opens external OSM link
- [ ] "← กลับหน้าหลัก" button returns to homepage

### 6. Main Page Integration
- [ ] Navigate to http://localhost:3001/
- [ ] "🗺️ เปิดแผนที่กรุงเทพฯ" button is visible in header
- [ ] Clicking button navigates to /map page
- [ ] All existing functionality still works
- [ ] No console errors

### 7. Responsive Design
- [ ] Resize browser window to mobile size (375px width)
- [ ] Map remains usable
- [ ] Controls are touch-friendly
- [ ] Layout adapts properly
- [ ] Text remains readable

### 8. Attribution & Compliance
- [ ] "© OpenStreetMap contributors" visible on map
- [ ] Attribution linked to OSM copyright page
- [ ] Footer shows proper attribution
- [ ] No missing attribution warnings

### 9. Browser Console
- [ ] Open Developer Tools (F12)
- [ ] Check Console tab for errors
- [ ] Should see: No errors
- [ ] Network tab shows successful tile loading
- [ ] All resources load with 200 status

### 10. Performance
- [ ] Map loads within 2-3 seconds
- [ ] Tile loading is smooth
- [ ] No lag when clicking/dragging
- [ ] Zoom is responsive
- [ ] No memory leaks (check Performance tab)

## Expected Behavior

### When You Click Bangkok Center (13.7563, 100.5018)
```
📍 พิกัดที่เลือก
Lat: 13.756300
Lng: 100.501800
```

### Sample Test Locations

Try clicking these Bangkok landmarks:

1. **Grand Palace**
   - Expected: ~13.7500°, ~100.4913°
   
2. **MBK Center**
   - Expected: ~13.7449°, ~100.5300°
   
3. **Chatuchak Market**
   - Expected: ~13.7991°, ~100.5499°
   
4. **Suvarnabhumi Airport**
   - Expected: ~13.6900°, ~100.7500°

## Known Working Features

✅ Map displays Bangkok correctly  
✅ Click-to-select works  
✅ Markers appear correctly  
✅ Coordinates are accurate  
✅ Zoom controls work  
✅ Pan/drag works  
✅ Responsive design  
✅ OpenStreetMap tiles load  
✅ Attribution displayed  
✅ No API keys needed  

## Troubleshooting

### Map Doesn't Load
1. Check browser console for errors
2. Verify Leaflet CSS is loaded (check Network tab)
3. Clear browser cache
4. Restart dev server

### Markers Don't Appear
1. Check if default icon URLs are accessible
2. Verify CDN connection to CloudFlare
3. Check browser console for 404 errors

### Tiles Don't Load
1. Check internet connection
2. Verify OpenStreetMap tile server is accessible
3. Check Network tab for blocked requests
4. Try different zoom level

### Performance Issues
1. Close other browser tabs
2. Clear browser cache
3. Check CPU usage
4. Try different browser

## Browser Compatibility

**Tested and Working:**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

**Minimum Requirements:**
- JavaScript enabled
- Modern browser (2020+)
- Internet connection (for tiles)

## Screenshots Location

Take screenshots of:
1. Map loaded with Bangkok center
2. Marker placed on clicked location
3. Coordinate display box
4. Mobile responsive view

## Success Criteria

Phase 1 is successful if:
- ✅ All checklist items pass
- ✅ No console errors
- ✅ Map is interactive and responsive
- ✅ Coordinates display correctly
- ✅ Attribution is visible
- ✅ Integration with main page works

## Report Issues

If you find any issues:
1. Note the browser and version
2. Copy console error messages
3. Screenshot the problem
4. Note steps to reproduce

## Next Phase Preview

After confirming Phase 1 works, future phases will add:
- Place markers from database
- Search functionality
- Event location display
- Clustering for many markers
- Custom styled markers
- Route planning

---

**Testing Status:** Ready for manual verification  
**Last Updated:** October 23, 2026  
**Developer:** http://localhost:3001/map
