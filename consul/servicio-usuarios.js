// servicio-usuarios.js
const express = require('express')
const ConsulService = require('./consul-client')
const app = express()

app.use(express.json())

const consul = new ConsulService()
const PUERTO = 3001
const NOMBRE_SERVICIO = 'servicio-usuarios'
let serviceId

// Datos simulados
const usuarios = {
    1: { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', edad: 30, departamento: 'IT' },
    2: { id: 2, nombre: 'María García', email: 'maria@email.com', edad: 25, departamento: 'Marketing' },
    3: { id: 3, nombre: 'Carlos López', email: 'carlos@email.com', edad: 35, departamento: 'Ventas' }
}

// Endpoints del servicio
app.get('/usuario/:id', (req, res) => {
    const { id } = req.params
    const usuario = usuarios[id]

    if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({
        ...usuario,
        timestamp: new Date().toISOString(),
        servidoPor: NOMBRE_SERVICIO
    })
})

app.get('/usuarios', (req, res) => {
    res.json({
        usuarios: Object.values(usuarios),
        total: Object.keys(usuarios).length,
        servidoPor: NOMBRE_SERVICIO
    })
})

// Health check endpoint
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
        // Registrar en Consul
        serviceId = await consul.registrarServicio(
            NOMBRE_SERVICIO,
            PUERTO,
            'localhost',
            '/health'
        )

        app.listen(PUERTO, () => {
            console.log(`🚀 ${NOMBRE_SERVICIO} ejecutándose en puerto ${PUERTO}`)
        })

        // Graceful shutdown
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

