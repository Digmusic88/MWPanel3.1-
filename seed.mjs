import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing environment variables');
  console.log('Please ensure you have the following in your .env file:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Seed data for cursos_materias
const cursosData = [
  {
    nombre: 'Matemáticas Avanzadas',
    descripcion: 'Curso completo de matemáticas para nivel avanzado incluyendo cálculo, álgebra y geometría analítica',
    categoria: 'Ciencias'
  },
  {
    nombre: 'Álgebra Lineal',
    descripcion: 'Fundamentos de álgebra lineal, matrices, vectores y transformaciones lineales',
    categoria: 'Ciencias'
  },
  {
    nombre: 'Cálculo Diferencial e Integral',
    descripcion: 'Introducción al cálculo diferencial e integral con aplicaciones prácticas',
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
    nombre: 'Arte y Cultura',
    descripcion: 'Exploración de las manifestaciones artísticas y culturales a través de la historia',
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
    nombre: 'Desarrollo de Aplicaciones Móviles',
    descripcion: 'Creación de aplicaciones nativas y multiplataforma para dispositivos móviles',
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
      console.log('');
      console.log('Verifica que:');
      console.log('1. Las variables de entorno estén configuradas correctamente');
      console.log('2. La tabla cursos_materias exista en tu base de datos');
      console.log('3. Las políticas RLS permitan insertar datos');
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
      console.log('');
      console.log('Posibles causas:');
      console.log('1. Políticas RLS muy restrictivas');
      console.log('2. Tabla no existe o tiene estructura diferente');
      console.log('3. Permisos insuficientes');
      console.log('');
      console.log('Puedes ejecutar el script fixSupabaseWarnings.mjs para simplificar las políticas RLS');
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

    console.log('');
    console.log('🎉 ¡Seed completado exitosamente!');
    console.log('Ahora puedes abrir la sección "Cursos y Materias" en la aplicación');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

// Ejecutar seed
seedDatabase();