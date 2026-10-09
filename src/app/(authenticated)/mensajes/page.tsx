'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { MessageSquare, PlusCircle, Send } from 'lucide-react'
import type { HRTicket, TicketMessage } from '@/lib/types'

export default function MensajesPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { showToast } = useToast()
  const [tickets, setTickets] = useState<HRTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<HRTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [ticketForm, setTicketForm] = useState({ category: 'Horas extra', subject: '' })

  useEffect(() => {
    if (profile) loadTickets()
  }, [profile])

  const loadTickets = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('hr_tickets')
      .select('*')
      .eq('employee_id', profile!.id)
      .order('created_at', { ascending: false })
    if (data) setTickets(data)
    setLoading(false)
  }

  const loadMessages = async (ticket: HRTicket) => {
    setSelectedTicket(ticket)
    const { data } = await supabase
      .from('ticket_messages')
      .select('*, profiles(name)')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const createTicket = async () => {
    if (!profile) return
    const code = `RRHH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`
    const { error } = await supabase.from('hr_tickets').insert({
      code,
      employee_id: profile.id,
      category: ticketForm.category,
      subject: ticketForm.subject || 'Consulta general',
    })
    if (error) { showToast('Error', error.message, 'error'); return }
    showToast('Ticket Creado', `Su caso ${code} fue abierto correctamente.`, 'info')
    setShowNewTicket(false)
    setTicketForm({ category: 'Horas extra', subject: '' })
    loadTickets()
  }

  const sendMessage = async () => {
    if (!profile || !selectedTicket || !newMessage.trim()) return
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: selectedTicket.id,
      sender_id: profile.id,
      message: newMessage.trim(),
    })
    if (error) { showToast('Error', error.message, 'error'); return }
    setNewMessage('')
    loadMessages(selectedTicket)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-white flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-emerald-400" /> Contacto con RRHH & Tickets
        </h1>
        <button onClick={() => setShowNewTicket(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center">
          <PlusCircle className="w-4 h-4 mr-1.5" /> Nuevo Caso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ticket list */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-slate-400 text-sm animate-pulse">Cargando...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sin tickets</p>
            </div>
          ) : tickets.map(t => (
            <button key={t.id} onClick={() => loadMessages(t)} className={`w-full text-left bg-slate-800 border rounded-xl p-3.5 space-y-1 transition-all ${selectedTicket?.id === t.id ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700/60 hover:border-slate-600'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-emerald-400">{t.code}</span>
                <Badge status={t.status} />
              </div>
              <p className="text-xs font-bold text-white truncate">{t.subject}</p>
              <p className="text-[10px] text-slate-400">{t.category}</p>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="md:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex flex-col min-h-[400px]">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-mono text-emerald-400">{selectedTicket.code}</span>
                    <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                  </div>
                  <Badge status={selectedTicket.status} size="md" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map(m => (
                  <div key={m.id} className={`p-3 rounded-xl text-xs max-w-[80%] ${m.sender_id === profile?.id ? 'bg-emerald-950/50 border border-emerald-500/20 ml-auto' : 'bg-slate-700/50 border border-slate-600'}`}>
                    <p className="font-bold text-slate-200 mb-1">{m.profiles?.name || 'Usuario'}</p>
                    <p className="text-slate-300">{m.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(m.created_at).toLocaleString('es-AR')}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-slate-500 text-xs text-center py-8">Sin mensajes aún</p>}
              </div>
              <div className="p-4 border-t border-slate-700 flex space-x-2">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Escribir mensaje..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                <button onClick={sendMessage} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl"><Send className="w-4 h-4" /></button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">Seleccione un ticket para ver los mensajes</div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal isOpen={showNewTicket} onClose={() => setShowNewTicket(false)} title="Nuevo Caso RRHH" icon={<MessageSquare className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Categoría</label>
            <select value={ticketForm.category} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
              <option>Horas extra</option>
              <option>Liquidación</option>
              <option>Licencias</option>
              <option>Fichadas</option>
              <option>Consulta general</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Asunto</label>
            <input value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" placeholder="Describa su consulta..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button onClick={() => setShowNewTicket(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancelar</button>
            <button onClick={createTicket} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow">Crear Ticket</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
