import { Bell, Check, X } from 'lucide-react'
import { useEffect, useRef, useState } from "react"
import { API_BASE_URL } from '../../config'
import "./Toolbar.css"

const NotificationDropdown = ({ notifications, onClose, onMarkAllRead, onMarkRead }) => (
    <div className="notification-card">
        <div className="notification-card-header">
            <div className="notification-header-content">
                <h3 className="notification-title">Notificações</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onMarkAllRead} className="close-button" title="Marcar todas como lidas">
                        <Check className="close-icon" />
                    </button>
                    <button onClick={onClose} className="close-button" title="Fechar">
                        <X className="close-icon" />
                    </button>
                </div>
            </div>
        </div>
        <div className="notification-card-content">
            <div className="notification-scroll">
                {notifications.length === 0 ? (
                    <div className="notification-empty">Sem notificações</div>
                ) : (
                    <div className="notification-list">
                        {notifications.map((notification, index) => (
                            <div key={notification.id || index} className="notification-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <p className="notification-message">{notification.mensagem}</p>
                                <button
                                    className="close-button"
                                    title="Marcar como lida"
                                    onClick={() => onMarkRead(notification.id)}
                                >
                                    <Check className="close-icon" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
)

const Toolbar = () => {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const dropdownRef = useRef(null)
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")
    const token = userData?.token
    const markAllAsRead = async () => {
        if (!userData?.id || !token) return
        await fetch(`${API_BASE_URL}/notificacao/marcarTodasComoLidas/${userData.id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        })
        fetchNotifications()
    }

    const markAsRead = async (notificacaoId) => {
        if (!token) return
        await fetch(`${API_BASE_URL}/notificacao/marcarComoLida/${notificacaoId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        })
        fetchNotifications()
    }
    const fetchNotifications = async () => {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        const token = userData?.token
        if (!userData || !token) return

        try {
            const response = await fetch(`${API_BASE_URL}/notificacao/naoLidas/${userData.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
            if (response.ok) {
                const data = await response.json()
                setNotifications(data)
            }
        } catch (err) {
            // Silenciar erros de rede
        }
    }

    // Busca inicial e a cada 1 minuto
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open])

    return (
        <div className="toolbar">
            <div className="toolbar-content">

            </div>

            <div className="toolbar-actions" ref={dropdownRef}>
                <div className="notification-container">
                    <button
                        className="notification-trigger"
                        onClick={() => setOpen(!open)}
                    >
                        <Bell className="bell-icon" />
                        {notifications.length > 0 && (
                            <span className="notification-badge">
                                {notifications.length > 99 ? "99+" : notifications.length}
                            </span>
                        )}
                    </button>

                    {open && (
                        <div className="notification-popover">
                            <NotificationDropdown
                                notifications={notifications}
                                onClose={() => setOpen(false)}
                                onMarkAllRead={markAllAsRead}
                                onMarkRead={markAsRead}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Toolbar
