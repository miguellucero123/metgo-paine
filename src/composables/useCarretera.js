/**
 * Tramos y localidades Carretera Austral — Supabase Realtime + seed local.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase, supabaseConfigured } from '@/lib/supabase.js'
import {
  CA_LOCALIDADES,
  CA_TRAMOS,
  kmEquivPavimento,
  kmEquivRipio,
} from '@/data/carreteraAustral.js'

export function useCarretera() {
  const tramos = ref([])
  const localidades = ref([])
  const loading = ref(true)
  const error = ref(null)
  const source = ref('local')
  const filtroTipo = ref('todos')
  let channel = null

  const tramosFiltrados = computed(() => {
    if (filtroTipo.value === 'todos') return tramos.value
    return tramos.value.filter(
      (t) => String(t.tipo_camino).toLowerCase() === filtroTipo.value
    )
  })

  const stats = computed(() => {
    const list = tramos.value
    const totalKm = list.reduce((a, t) => a + (Number(t.distancia_km) || 0), 0)
    const pavimentoKm = list
      .filter((t) => t.tipo_camino === 'pavimento')
      .reduce((a, t) => a + (Number(t.distancia_km) || 0), 0)
    const ripioKm = list
      .filter((t) => t.tipo_camino === 'ripio')
      .reduce((a, t) => a + (Number(t.distancia_km) || 0), 0)
    const mixtoKm = list
      .filter((t) => t.tipo_camino === 'mixto')
      .reduce((a, t) => a + (Number(t.distancia_km) || 0), 0)
    return {
      totalKm,
      pavimentoKm,
      ripioKm,
      mixtoKm,
      equivPavimento: kmEquivPavimento(list),
      equivRipio: kmEquivRipio(list),
      count: list.length,
    }
  })

  function applyLocalSeed() {
    tramos.value = CA_TRAMOS.map((t) => ({ ...t }))
    localidades.value = CA_LOCALIDADES.map((l) => ({ ...l }))
    source.value = 'local'
  }

  async function fetchData() {
    loading.value = true
    error.value = null
    if (!supabaseConfigured || !supabase) {
      applyLocalSeed()
      loading.value = false
      return
    }
    try {
      const [tramosRes, locRes] = await Promise.all([
        supabase.from('ca_tramos').select('*').order('origen'),
        supabase.from('ca_localidades').select('*').order('nombre'),
      ])
      if (tramosRes.error) throw tramosRes.error
      if (locRes.error) throw locRes.error
      if (!tramosRes.data?.length) {
        applyLocalSeed()
      } else {
        tramos.value = tramosRes.data
        localidades.value = locRes.data?.length ? locRes.data : CA_LOCALIDADES
        source.value = 'supabase'
      }
    } catch (e) {
      console.warn('[useCarretera] fallback seed:', e)
      error.value = e?.message || String(e)
      applyLocalSeed()
    } finally {
      loading.value = false
    }
  }

  function subscribe() {
    if (!supabaseConfigured || !supabase) return
    channel = supabase
      .channel('ca-tramos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ca_tramos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            tramos.value = [...tramos.value, payload.new]
          } else if (payload.eventType === 'UPDATE') {
            const idx = tramos.value.findIndex((t) => t.id === payload.new.id)
            if (idx !== -1) {
              const next = [...tramos.value]
              next[idx] = payload.new
              tramos.value = next
            } else {
              tramos.value = [...tramos.value, payload.new]
            }
          } else if (payload.eventType === 'DELETE') {
            tramos.value = tramos.value.filter((t) => t.id !== payload.old.id)
          }
          source.value = 'supabase'
        }
      )
      .subscribe()
  }

  function unsubscribe() {
    if (channel && supabase) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  onMounted(() => {
    fetchData().then(() => subscribe())
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    tramos,
    localidades,
    tramosFiltrados,
    loading,
    error,
    source,
    filtroTipo,
    stats,
    fetchData,
  }
}
