import { createClient } from '@supabase/supabase-js'

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

  const { error } = await supabase
    .from('iletisim_mesajlari')
    .insert([{ ad_soyad, telefon, mesaj }])

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ error: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.' })
  }

  return res.status(200).json({ success: true })
}
