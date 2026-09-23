export type Role = 'admin' | 'technicien' | 'caissier' | 'employe'

export interface RoleConfig {
  label: string
  color: string
  paths: string[]
}

export const ROLES: Record<Role, RoleConfig> = {
    admin: {
    label: 'Administrateur',
    color: 'bg-red-100 text-red-700',
    paths: [
      '/dashboard',
      '/clients',
      '/ventes',
      '/deblocage',
      '/stock',
      '/sav',
      '/factures',
      '/caisse',
      '/employes',
    ],
  },
     technicien: {
    label: 'Technicien',
    color: 'bg-purple-100 text-purple-700',
    paths: ['/dashboard', '/clients', '/deblocage', '/stock', '/sav'],
  },
  caissier: {
    label: 'Caissier',
    color: 'bg-green-100 text-green-700',
    paths: ['/dashboard', '/clients', '/ventes', '/factures', '/caisse'],
  },
  employe: {
    label: 'Employé',
    color: 'bg-blue-100 text-blue-700',
    paths: ['/dashboard', '/clients', '/ventes'],
  },
}

export function hasAccess(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false
  const config = ROLES[role as Role]
  if (!config) return false
  return config.paths.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export function getRoleConfig(role: string | undefined | null): RoleConfig | null {
  if (!role) return null
  return ROLES[role as Role] || null
}