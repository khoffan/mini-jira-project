import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Mini-Jira</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            เริ่มใช้งานฟรี
          </Link>
        </div>
      </nav> */}

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto pt-20 pb-16 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          จัดการงานให้ <span className="text-blue-600">เป็นระเบียบ</span> <br />
          และรวดเร็วกว่าที่เคย
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Mini-Jira ช่วยให้คุณและทีมจัดการโปรเจกต์ผ่านระบบ Kanban ที่เรียบง่าย
          ติดตามทุกขั้นตอนของการทำงานได้แบบ Real-time บน Next.js 15
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1"
          >
            สร้างบอร์ดของคุณเลย
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
          >
            ดูฟีเจอร์ทั้งหมด
          </Link>
        </div>

        {/* Dashboard Preview Overlay */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
            {/* จำลองหน้า Kanban Board คร่าวๆ */}
            <div className="flex gap-4 p-8 w-full h-full overflow-hidden opacity-40 grayscale">
              {[1, 2, 3].map((col) => (
                <div key={col} className="w-64 bg-slate-200 rounded-lg flex-shrink-0 p-4 space-y-4">
                  <div className="h-4 w-24 bg-slate-300 rounded"></div>
                  <div className="h-20 w-full bg-white rounded shadow-sm"></div>
                  <div className="h-20 w-full bg-white rounded shadow-sm"></div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
              <p className="text-slate-800 font-bold bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100">
                Kanban Board Interface
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5-3.75h16.5m-16.5 7.5h16.5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Drag & Drop</h3>
            <p className="text-slate-500">เคลื่อนย้ายงานได้อย่างอิสระตามขั้นตอนการทำงานของคุณด้วยระบบ Drag and Drop ลื่นๆ</p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">User Profile</h3>
            <p className="text-slate-500">จัดการข้อมูลส่วนตัวและซิงค์ข้อมูลผ่าน Supabase Auth ที่มีความปลอดภัยสูง</p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 1.035-.84 1.875-1.875 1.875H5.625c-1.035 0-1.875-.84-1.875-1.875V6.375c0-1.035.84-1.875 1.875-1.875h12.75c1.035 0 1.875.84 1.875 1.875v0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Prisma & Postgres</h3>
            <p className="text-slate-500">เก็บข้อมูลอย่างแม่นยำด้วย Prisma ORM และ Postgres Database รันเร็วบน Local และ Cloud</p>
          </div>
        </div>
      </section>
    </div>
  );
}