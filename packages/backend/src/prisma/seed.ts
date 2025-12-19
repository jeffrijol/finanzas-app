import prisma from '.'

async function main() {
    console.log('🌱 Iniciando seed de base de datos...')

    // Items por defecto
    const defaultItems = [
        {
            nombre: 'Nómina',
            descripcion: 'Ingresos por salario',
            color: '#10B981',
        },
        {
            nombre: 'Alquiler',
            descripcion: 'Pago de alquiler o hipoteca',
            color: '#EF4444',
        },
        {
            nombre: 'Servicios',
            descripcion: 'Agua, luz, gas, internet',
            color: '#3B82F6',
        },
        {
            nombre: 'Supermercado',
            descripcion: 'Compra de alimentos',
            color: '#8B5CF6',
        },
        {
            nombre: 'Transporte',
            descripcion: 'Gasolina, transporte público',
            color: '#F59E0B',
        },
        {
            nombre: 'Ocio',
            descripcion: 'Entretenimiento y restaurantes',
            color: '#EC4899',
        },
        {
            nombre: 'Salud',
            descripcion: 'Gastos médicos y farmacia',
            color: '#06B6D4',
        },
        {
            nombre: 'Inversiones',
            descripcion: 'Movimientos de inversión',
            color: '#84CC16',
        },
    ]

    for (const item of defaultItems) {
        await prisma.item.upsert({
            where: { nombre: item.nombre },
            update: {},
            create: item,
        })
    }

    console.log('✅ Seed completado!')
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })