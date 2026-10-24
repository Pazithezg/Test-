# วิธี Deploy "ทำไรดี" บน Vercel

## ขั้นตอนที่ 1: เตรียม Git Repository

```bash
# Initialize git (ถ้ายังไม่ได้ทำ)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# สร้าง repo บน GitHub แล้ว push
git remote add origin https://github.com/YOUR_USERNAME/thamrai-dee.git
git branch -M main
git push -u origin main
```

## ขั้นตอนที่ 2: Deploy บน Vercel

### วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)

1. ไปที่ [vercel.com](https://vercel.com)
2. Login ด้วย GitHub account
3. คลิก **"Add New Project"**
4. เลือก repository **"thamrai-dee"**
5. กด **"Import"**
6. ตั้งค่า:
   - **Framework Preset**: Next.js (auto-detect)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
7. คลิก **"Deploy"**

### วิธีที่ 2: ผ่าน Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables (Optional)

ถ้าต้องการใช้ Supabase หรือ Gemini AI:

1. ไปที่ Vercel Dashboard > Project Settings > Environment Variables
2. เพิ่มตัวแปรต่อไปนี้:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_GENAI_API_KEY=your_gemini_key
```

3. คลิก **"Save"**
4. Redeploy: Deployments tab > เลือก latest > คลิก **"Redeploy"**

## ขั้นตอนที่ 4: ตั้งค่า Custom Domain (Optional)

1. ไปที่ Project Settings > Domains
2. เพิ่ม domain ของคุณ เช่น `thamraidee.com`
3. ตั้งค่า DNS records ตามที่ Vercel แนะนำ

## หลังจาก Deploy สำเร็จ

เว็บจะพร้อมใช้งานทันทีที่:
- URL: `https://thamrai-dee.vercel.app` (หรือ custom domain)

✅ **ไม่ต้องตั้งค่าอะไรเพิ่มเติม** - ทำงานได้ทันทีโดยไม่ต้อง API keys

## การ Update

```bash
# แก้ไขโค้ด
# ...

# Commit และ push
git add .
git commit -m "Update features"
git push

# Vercel จะ auto-deploy ทันที!
```

## Troubleshooting

### Build Failed

ตรวจสอบ:
```bash
# ลอง build ใน local ก่อน
npm run build

# ถ้า build สำเร็จใน local แต่ fail บน Vercel
# ตรวจสอบ Node.js version
```

### Environment Variables ไม่ทำงาน

- ตรวจสอบว่าใส่ prefix `NEXT_PUBLIC_` สำหรับตัวแปรที่ใช้ใน client
- Redeploy หลังจากเพิ่มตัวแปร

### Map ไม่แสดง

- Map ใช้ OpenStreetMap (ฟรี) ไม่ต้อง API key
- ถ้าไม่แสดง ตรวจสอบ Console สำหรับ errors

## Performance Tips

- ✅ **ใช้ Vercel Edge Network** - Response time < 100ms
- ✅ **Static Generation** - หน้าหลักถูก pre-render
- ✅ **Image Optimization** - Auto optimize โดย Vercel
- ✅ **Serverless Functions** - APIs ทำงานแบบ serverless

## Monitoring

ดู Analytics ได้ที่:
- Vercel Dashboard > Analytics
- ดู: Visitors, Page views, Load time

---

🎉 **เสร็จแล้ว!** เว็บ "ทำไรดี" พร้อมใช้งาน
