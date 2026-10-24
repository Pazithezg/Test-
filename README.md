# ทำไรดี

วางแผนเวลาว่างให้คุ้มค่าที่สุด - ค้นหาสถานที่ท่องเที่ยวและกิจกรรมใกล้คุณ

## คุณสมบัติ

- 🗺️ **ค้นหาตามตำแหน่ง** - ใช้ GPS หรือปักหมุดแผนที่
- 🚗 **เลือกยานพาหนะ** - รถยนต์, เดิน, ขนส่งสาธารณะ
- ⏰ **คำนวณเวลาท่องเที่ยว** - เวลาเดินทาง, เวลาที่สถานที่, เวลากลับ
- 💰 **คำนวณค่าใช้จ่าย** - ค่าเดินทาง + ค่าใช้จ่ายในสถานที่
- 🏨 **สถานที่ใกล้เคียง** - แสดงโรงแรมและสวนสาธารณะจาก OpenStreetMap
- 🎨 **Clean Design** - Noto Sans Thai, สีฟ้า, ไม่ AI slop

## ข้อมูล

- **12,207+ สถานที่ในกรุงเทพฯ** - จาก OpenStreetMap
- **ข้อมูลจำลอง 10 จังหวัด** - สำหรับ prototype

## เทคโนโลยี

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **OpenStreetMap** - แผนที่และข้อมูลสถานที่ (ฟรี)
- **Overpass API** - Query สถานที่ใกล้เคียง
- **OSRM** - Route calculation
- **Vitest** - Testing (59 tests)

## การติดตั้ง

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## การทดสอบ

```bash
npm test
```

## Deploy บน Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/thamrai-dee)

1. Push โปรเจกต์ไปยัง GitHub
2. Import ใน Vercel Dashboard
3. Deploy!

## Environment Variables

ไม่จำเป็นต้องตั้งค่า - ทำงานได้ทันทีโดยไม่ต้อง API keys

(Optional: `.env.local` สำหรับ Supabase/Gemini ถ้าต้องการใช้)

## License

MIT
