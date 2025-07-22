// servicio-pedidos.js
const express = require('express')
const axios = require('axios')
const ConsulService = require('./consul-client')
const app = express()

app.use(express.json())

const consul = new ConsulService()
const PUERTO = 3002
const NOMBRE_SERVICIO = 'servicio-pedidos'
let serviceId

// Datos simulados de pedidos
const pedidos = {
    1: { id: 1, usuarioId: 1, producto: 'Laptop', precio: 1200, estado: 'enviado' },
    2: { id: 2, usuarioId: 2, producto: 'Mouse', precio: 25, estado: 'pendiente' },
    3: { id: 3, usuarioId: 1, producto: 'Teclado', precio: 80, estado: 'entregado' }
}

// Endpoint que combina datos de usuarios y pedidos
app.get('/pedido/:id/completo', async (req, res) => {
    try {
        const { id } = req.params
        const pedido = pedidos[id]

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        // ✅ Descubrir servicio de usuarios dinámicamente
        const urlUsuarios = await consul.obtenerUrlServicio('servicio-usuarios')

        // Obtener datos del usuario
        const responseUsuario = await axios.get(`${urlUsuarios}/usuario/${pedido.usuarioId}`)

        res.json({
            pedido: pedido,
            usuario: responseUsuario.data,
            consultadoEn: urlUsuarios,
            timestamp: new Date().toISOString(),
            servidoPor: NOMBRE_SERVICIO
        })

    } catch (error) {
        console.error('Error obteniendo pedido completo:', error.message)
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: error.message
        })
    }
})

// Obtener pedidos de un usuario
app.get('/pedidos/usuario/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params

        // Filtrar pedidos del usuario
        const pedidosUsuario = Object.values(pedidos).filter(
            pedido => pedido.usuarioId == usuarioId
        )

        if (pedidosUsuario.length === 0) {
            return res.json({ pedidos: [], mensaje: 'No hay pedidos para este usuario' })
        }

        // Obtener datos del usuario desde Consul
        const urlUsuarios = await consul.obtenerUrlServicio('servicio-usuarios')
        const responseUsuario = await axios.get(`${urlUsuarios}/usuario/${usuarioId}`)

        res.json({
            usuario: responseUsuario.data,
            pedidos: pedidosUsuario,
            total: pedidosUsuario.length,
            consultadoEn: urlUsuarios,
            servidoPor: NOMBRE_SERVICIO
        })

    } catch (error) {
        console.error('Error obteniendo pedidos de usuario:', error.message)
        res.status(500).json({
            error: 'Error interno del servidor',
            detalle: error.message
        })
    }
})

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        servicio: NOMBRE_SERVICIO,
        puerto: PUERTO,
        timestamp: new Date().toISOString()
    })
})

// Inicializar servicio
async function iniciar() {
    try {
        serviceId = await consul.registrarServicio(
            NOMBRE_SERVICIO,
            PUERTO,
            'localhost',
            '/health'
        )

        app.listen(PUERTO, () => {
            console.log(`🚀 ${NOMBRE_SERVICIO} ejecutándose en puerto ${PUERTO}`)
        })

        process.on('SIGINT', async () => {
            console.log('\n🔄 Cerrando servicio...')
            await consul.desregistrarServicio(serviceId)
            process.exit(0)
        })

    } catch (error) {
        console.error('❌ Error iniciando servicio:', error)
        process.exit(1)
    }
}

iniciar()
