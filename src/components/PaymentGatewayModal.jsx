import React, { useState } from 'react'
import { X, ShieldCheck, CreditCard, Smartphone, CheckCircle, Lock, ArrowRight } from 'lucide-react'

export const PaymentGatewayModal = ({ project, rewardTier, amount, onClose, onConfirmPayment }) => {
  const [paymentMethod, setPaymentMethod] = useState('yape') // 'yape' | 'card'
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleProcessPayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulación de procesamiento de la pasarela de pagos (Webhook transaccional)
    setTimeout(async () => {
      const res = await onConfirmPayment()
      setIsProcessing(false)
      if (res?.success) {
        setPaymentSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    }, 1500)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card sm" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--color-border)', background: 'linear-gradient(180deg, #FFF8F5 0%, #FFFFFF 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
            <Lock size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}>PASARELA TRANSACCIONAL CULTURAL (MODO MOCK)</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--color-neutral)', marginTop: '4px' }}>
            Confirmar Aporte a {project?.title}
          </h2>
        </div>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Resumen del Pago */}
          <div style={{ background: '#F9F6F0', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Monto a Aportar:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)' }}>S/ {amount}</span>
            </div>
            {rewardTier && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: '700' }}>
                Recompensa Seleccionada: {rewardTier.title}
              </div>
            )}
          </div>

          {paymentSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', background: '#D1FAE5', borderRadius: '14px', color: '#065F46' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '1.2rem' }}>¡Transacción Confirmada!</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Tu aporte ha sido registrado en la tabla <code>contributions</code>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>
                SELECCIONA EL MÉTODO DE PAGO SIMULADO
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '14px',
                    borderRadius: '12px',
                    border: paymentMethod === 'yape' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: paymentMethod === 'yape' ? '#FFF5F2' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPaymentMethod('yape')}
                >
                  <Smartphone size={24} color="#7C3AED" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Yape / Plin</span>
                </button>

                <button
                  type="button"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '14px',
                    borderRadius: '12px',
                    border: paymentMethod === 'card' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: paymentMethod === 'card' ? '#FFF5F2' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={24} color="#D34B26" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Tarjeta de Débito/Crédito</span>
                </button>
              </div>

              <div style={{ background: '#FFFDF9', border: '1px dashed var(--color-tertiary)', padding: '12px 14px', borderRadius: '10px', fontSize: '0.775rem', color: 'var(--color-text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--color-tertiary)" style={{ flexShrink: 0 }} />
                <span>Simulador de Pasarela Transaccional (Culqi/Yape). No requiere datos bancarios reales.</span>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={isProcessing}>
                {isProcessing ? 'Procesando Pago Seguro...' : 'Confirmar & Finalizar Donación'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
