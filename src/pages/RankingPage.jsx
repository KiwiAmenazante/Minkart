import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Crown, Heart, Sparkles, User, ExternalLink, ShieldCheck } from 'lucide-react'
import { getTopDonors } from '../services/minkaService'
import { useNavigate } from 'react-router-dom'
import { UserAvatar } from '../components/UserAvatar'

export const RankingPage = () => {
  const navigate = useNavigate()
  const [donors, setDonors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true)
      const res = await getTopDonors()
      setDonors(res.data || [])
      setIsLoading(false)
    }
    fetchRanking()
  }, [])

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: <Crown size={22} color="#F59E0B" />, bg: '#FEF3C7', color: '#B45309', border: '#FCD34D', text: '1° Lugar — Mecenas Diamante' }
    if (rank === 2) return { icon: <Medal size={20} color="#94A3B8" />, bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', text: '2° Lugar — Gran Mecenas Oro' }
    if (rank === 3) return { icon: <Medal size={20} color="#B45309" />, bg: '#FFEDD5', color: '#C2410C', border: '#FDBA74', text: '3° Lugar — Gran Mecenas Plata' }
    return { icon: <Trophy size={16} color="var(--color-primary)" />, bg: '#FDF8F6', color: 'var(--color-primary)', border: '#FDE2DB', text: `${rank}° Lugar` }
  }

  return (
    <main className="app-container" style={{ maxWidth: '960px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1C1917 0%, #292524 50%, #431407 100%)',
        borderRadius: '24px',
        padding: '40px 32px',
        color: '#FFFFFF',
        marginBottom: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(199, 81, 42, 0.25)'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 16px',
            borderRadius: '100px',
            fontSize: '0.8rem',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '14px',
            color: '#FED7AA'
          }}>
            <Sparkles size={14} /> Salón de Honor Cultural
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: '#FFFFFF' }}>
            Top 10 Mecenas de Mink@rt
          </h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem', color: '#E7E5E4', lineHeight: 1.6 }}>
            Reconocimiento público a las personas e instituciones que más impulsan y financian el cine, teatro, cómic y narrativas independientes peruanas.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
          <p>Cargando ranking de mecenas...</p>
        </div>
      ) : donors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <Trophy size={48} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
          <h3>Aún no hay aportes registrados</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '6px' }}>¡Sé el primer mecenas en figurar en el Salón de Honor!</p>
          <button className="btn-primary mt-3" onClick={() => navigate('/')}>Explorar Catálogo</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top 3 Podium Highlights si hay al menos 3 */}
          {donors.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {donors.slice(0, 3).map((donor, idx) => {
                const badgeInfo = getRankBadge(idx + 1)
                return (
                  <div
                    key={donor.user_id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '24px',
                      border: `2px solid ${badgeInfo.border}`,
                      boxShadow: idx === 0 ? '0 12px 30px rgba(245, 158, 11, 0.15)' : 'var(--shadow-soft)',
                      textAlign: 'center',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: badgeInfo.bg,
                      color: badgeInfo.color,
                      borderRadius: '100px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {badgeInfo.icon} #{idx + 1}
                    </div>

                    <div style={{ marginBottom: '12px', marginTop: '8px' }}>
                      <UserAvatar name={donor.profile?.full_name} avatarUrl={donor.profile?.avatar_url} size={72} fontSize="1.8rem" />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>
                      {donor.profile?.full_name || 'Mecenas Anónimo'}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px', minHeight: '36px' }}>
                      {donor.profile?.bio || 'Mecenas cultural comprometido.'}
                    </p>

                    <div style={{
                      width: '100%',
                      background: '#F9F6F0',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-around',
                      border: '1px solid var(--color-border)'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>TOTAL DONADO</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: '800' }}>
                          S/ {donor.total_donated?.toLocaleString()}
                        </strong>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '12px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>APORTES</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--color-neutral)', fontWeight: '800' }}>
                          {donor.contributions_count}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tabla / Lista Completa del Ranking */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', background: '#FAF8F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="var(--color-primary)" />
                Tabla Completa del Ranking
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Top 10 Histórico</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#FFFFFF', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '14px 20px', width: '80px' }}>PUESTO</th>
                    <th style={{ padding: '14px 20px' }}>MECENAS</th>
                    <th style={{ padding: '14px 20px' }}>INSIGNIA</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>PROYECTOS</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>TOTAL APORTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor, idx) => {
                    const badgeInfo = getRankBadge(idx + 1)
                    return (
                      <tr
                        key={donor.user_id}
                        style={{
                          borderBottom: idx < donors.length - 1 ? '1px solid var(--color-border)' : 'none',
                          background: idx % 2 === 0 ? '#FFFFFF' : '#FCFAF7',
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: badgeInfo.bg,
                            color: badgeInfo.color,
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            border: `1px solid ${badgeInfo.border}`
                          }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <UserAvatar name={donor.profile?.full_name} avatarUrl={donor.profile?.avatar_url} size={40} fontSize="0.95rem" />
                            <div>
                              <strong style={{ display: 'block', color: 'var(--color-neutral)', fontSize: '0.95rem' }}>
                                {donor.profile?.full_name || 'Mecenas Anónimo'}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {donor.profile?.bio ? (donor.profile.bio.length > 50 ? `${donor.profile.bio.substring(0, 50)}...` : donor.profile.bio) : 'Mecenas activo de Mink@rt'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            padding: '4px 10px',
                            borderRadius: '100px',
                            background: badgeInfo.bg,
                            color: badgeInfo.color,
                            border: `1px solid ${badgeInfo.border}`,
                            whiteSpace: 'nowrap'
                          }}>
                            {donor.badge || badgeInfo.text}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '700', color: 'var(--color-neutral)' }}>
                          {donor.contributions_count}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--color-primary)', fontWeight: '800' }}>
                            S/ {donor.total_donated?.toLocaleString()}
                          </strong>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
