import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de ejemplo para poblar la base de datos
const cursosData = [
  {
    nombre: 'Matemáticas Avanzadas',
    descripcion: 'Curso completo de matemáticas para nivel avanzado incluyendo cálculo, álgebra y geometría analítica',
    categoria: 'Ciencias'
  },
  {
    nombre: 'Física Cuántica',
    descripcion: 'Introducción a los principios fundamentales de la física cuántica y sus aplicaciones',
    categoria: 'Ciencias'
  },
  {
    nombre: 'Química Orgánica',
    descripcion: 'Estudio de los compuestos orgánicos, sus estructuras, propiedades y reacciones',
    categoria: 'Ciencias'
  },
  {
    nombre: 'Historia Universal',
    descripcion: 'Recorrido completo por la historia mundial desde la antigüedad hasta la era moderna',
    categoria: 'Humanidades'
  },
  {
    nombre: 'Literatura Clásica',
    descripcion: 'Análisis profundo de las obras literarias más importantes de la historia',
    categoria: 'Humanidades'
  },
  {
    nombre: 'Filosofía Contemporánea',
    descripcion: 'Estudio del pensamiento filosófico moderno y contemporáneo',
    categoria: 'Humanidades'
  },
  {
    nombre: 'Programación Web Full Stack',
    descripcion: 'Desarrollo completo de aplicaciones web modernas con tecnologías actuales',
    categoria: 'Tecnología'
  },
  {
    nombre: 'Inteligencia Artificial',
    descripcion: 'Introducción a la IA, machine learning y deep learning con aplicaciones prácticas',
    categoria: 'Tecnología'
  },
  {
    nombre: 'Ciberseguridad',
    descripcion: 'Fundamentos de seguridad informática y protección de sistemas digitales',
    categoria: 'Tecnología'
  },
  {
    nombre: 'Economía Global',
    descripcion: 'Análisis de los sistemas económicos mundiales y sus interconexiones',
    categoria: 'Ciencias Sociales'
  },
  {
    nombre: 'Psicología del Desarrollo',
    descripcion: 'Estudio del desarrollo humano desde la infancia hasta la edad adulta',
    categoria: 'Ciencias Sociales'
  },
  {
    nombre: 'Arte Contemporáneo',
    descripcion: 'Exploración de las corrientes artísticas del siglo XX y XXI',
    categoria: 'Artes'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Verificar conexión
    const { data: testData, error: testError } = await supabase
      .from('cursos_materias')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión a Supabase:', testError.message);
      return;
    }

    console.log('✅ Conexión a Supabase establecida');

    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    const { error: deleteError } = await supabase
      .from('cursos_materias')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos excepto un ID imposible

    if (deleteError) {
      console.warn('⚠️ Advertencia al limpiar datos:', deleteError.message);
    }

    // Insertar nuevos datos
    console.log('📚 Insertando cursos de ejemplo...');
    const { data, error } = await supabase
      .from('cursos_materias')
      .insert(cursosData)
      .select();

    if (error) {
      console.error('❌ Error al insertar datos:', error.message);
      return;
    }

    console.log(`✅ Se insertaron ${data.length} cursos exitosamente:`);
    
    // Mostrar resumen por categoría
    const categorias = {};
    data.forEach(curso => {
      categorias[curso.categoria] = (categorias[curso.categoria] || 0) + 1;
    });

    Object.entries(categorias).forEach(([categoria, count]) => {
      console.log(`   📖 ${categoria}: ${count} cursos`);
    });

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('💡 Ahora puedes usar la aplicación con datos reales de Supabase');

  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Ejecutar el seed
seedDatabase();