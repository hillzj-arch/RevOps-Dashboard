import { Deal } from "../data/schema"

export interface GeoResult {
  byRegion: { region: string; count: number; amount: number; won: number }[]
  byCountry: { country: string; region: string; count: number; amount: number; won: number }[]
  topCountries: { country: string; count: number; amount: number }[]
}

export function calcGeographic(deals: Deal[]): GeoResult {
  const regionMap: Record<string, { count: number; amount: number; won: number }> = {}
  const countryMap: Record<string, { region: string; count: number; amount: number; won: number }> = {}

  for (const deal of deals) {
    const region = deal.region || "Unknown"
    const country = deal.country || "Unknown"
    const isWon = deal.dealStage.toLowerCase().includes("won")

    if (!regionMap[region]) regionMap[region] = { count: 0, amount: 0, won: 0 }
    regionMap[region].count++
    regionMap[region].amount += deal.amount
    if (isWon) regionMap[region].won++

    if (!countryMap[country]) countryMap[country] = { region, count: 0, amount: 0, won: 0 }
    countryMap[country].count++
    countryMap[country].amount += deal.amount
    if (isWon) countryMap[country].won++
  }

  const byRegion = Object.entries(regionMap)
    .map(([region, v]) => ({ region, ...v }))
    .sort((a, b) => b.count - a.count)

  const byCountry = Object.entries(countryMap)
    .map(([country, v]) => ({ country, ...v }))
    .sort((a, b) => b.count - a.count)

  return {
    byRegion,
    byCountry,
    topCountries: byCountry.slice(0, 10),
  }
}
