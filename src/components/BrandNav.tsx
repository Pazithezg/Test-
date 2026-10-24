import Link from 'next/link';

export interface BrandNavProps {
  active?: 'discover' | 'map' | 'places';
}

export default function BrandNav({ active = 'discover' }: BrandNavProps) {
  return (
    <nav className="brand-nav" aria-label="เมนูหลัก">
      <Link href="/" className="brand-mark">Near<span>Trip</span></Link>
      <div className="brand-nav-links">
        <Link className={active === 'discover' ? 'active' : ''} href="/">ค้นพบใกล้ตัว</Link>
        <Link className={active === 'map' ? 'active' : ''} href="/map">แผนที่</Link>
        <Link className={active === 'places' ? 'active' : ''} href="/places">สถานที่ทั้งหมด</Link>
      </div>
      <Link href="/#discover" className="brand-nav-cta">เริ่มค้นหา</Link>
    </nav>
  );
}
