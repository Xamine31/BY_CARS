import { getSupabase, isSupabaseConfigured } from './supabase-client.js'

const config = window.BY_CARS_CONFIG || {}
export const defaultSettings = Object.freeze({
  phone_display: config.phoneDisplay || '06 18 17 59 11',
  phone_intl: config.phoneIntl || '33618175911',
  form_whatsapp_intl: config.formWhatsappIntl || '33615100628',
  email: '',
  address: '54 Rue de la Joliette, Marseille',
  instagram_url: '', facebook_url: '', tiktok_url: '',
  youtube_url: '', linkedin_url: '',
  hero_image_url: ''
})
let pending
export function loadSiteSettings(){
  if(!pending) pending=(async()=>{
    if(!isSupabaseConfigured()) return {...defaultSettings}
    try{
      const client=await getSupabase()
      const { data, error }=await client.from('site_settings').select('*').eq('id',1).maybeSingle()
      if(error) throw error
      return {...defaultSettings,...(data||{})}
    }catch(error){
      console.warn('Configuration publique non disponible.',error)
      return {...defaultSettings}
    }
  })()
  return pending
}
export function digits(value){return String(value||'').replace(/\D/g,'')}
export function externalWebUrl(value){
  try{const u=new URL(String(value||''));return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}
}
export function safeEmail(value){return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(String(value||''))?String(value).trim():''}
