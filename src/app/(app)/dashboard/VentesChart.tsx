'use client'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const data = [
  { mois: 'Jan', ventes: 4200 },
  { mois: 'Fév', ventes: 6100 },
  { mois: 'Mar', ventes: 5400 },
  { mois: 'Avr', ventes: 8200 },
  { mois: 'Mai', ventes: 7100 },
  { mois: 'Juin', ventes: 9300 },
  { mois: 'Juil', ventes: 11200 },
  { mois: 'Août', ventes: 10450 },
  { mois: 'Sep', ventes: 12450 },
]

export default function VentesChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[#1e3c72]">
          Évolution du chiffre d&apos;affaires
        </h2>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          9 derniers mois
        </span>
      </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a5298" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2a5298" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="mois"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                background: '#1e3c72',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
              }}
              formatter={(value) =>
                [`${Number(value).toLocaleString('fr-FR')} F`, 'Ventes'] as [string, string]
              }
            />
            <Area
              type="monotone"
              dataKey="ventes"
              stroke="#2a5298"
              strokeWidth={3}
              fill="url(#grad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}