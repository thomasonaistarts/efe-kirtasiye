import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ad_soyad, telefon, mesaj } = req.body

  if (!ad_soyad || !mesaj) {
    return res.status(400).json({ error: 'Ad soyad ve mesaj zorunludur.' })
  }

  const { error: dbError } = await supabase
    .from('iletisim_mesajlari')
    .insert([{ ad_soyad, telefon, mesaj }])

  if (dbError) {
    console.error('Supabase error:', dbError)
    return res.status(500).json({ error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Efe Kırtasiye <noreply@efe-kirtasiye.com>',
      to: 'info@efe-kirtasiye.com',
      subject: `Yeni İletişim Mesajı — ${ad_soyad}`,
      html: `
        <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:24px; border:1px solid #eee; border-radius:12px;">
          <h2 style="color:#1a1a2e; margin-top:0;">📬 Yeni İletişim Formu Mesajı</h2>
          <p><strong>Ad Soyad:</strong> ${ad_soyad}</p>
          <p><strong>Telefon:</strong> ${telefon || '—'}</p>
          <p><strong>Mesaj:</strong></p>
          <p style="background:#f5f5f5; padding:12px; border-radius:8px;">${mesaj}</p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
          <p style="font-size:0.8rem; color:#999;">efekirtasiye.com üzerinden gönderildi</p>
        </div>
      `
    })
  } catch (emailError) {
    console.error('Email error:', emailError)
  }

  return res.status(200).json({ success: true })
}
