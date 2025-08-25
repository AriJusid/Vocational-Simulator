import readline from "readline";
import fs from "fs";

// Preguntas abiertas sobre intereses
const preguntas = [
  "¿Qué temas te interesan más? Ejemplo: tecnología, salud, arte, negocios.",
  "¿Prefieres trabajar resolviendo problemas, comunicando ideas o ayudando a otros?",
  "¿Te gustan más las actividades prácticas o teóricas?",
];

// Lista de posibles carreras (simplificada para ejemplo)
const opcionesCarreras = [
  { intereses: ["tecnología", "problemas", "prácticas"], carreras: ["Ingeniería en Sistemas", "Analista Programador"] },
  { intereses: ["salud", "ayudando", "prácticas"], carreras: ["Medicina", "Enfermería"] },
  { intereses: ["arte", "comunicando", "teóricas"], carreras: ["Diseño Gráfico", "Comunicación Social"] },
  { intereses: ["negocios", "problemas", "teóricas"], carreras: ["Administración de Empresas", "Contador Público"] },
];

// Estructura para almacenar el historial de conversación
const conversacion = {
  usuario: "AriJusid",
  fecha: "2025-08-25 12:42:31",
  mensajes: []
};

// Función para guardar mensaje en el historial
function guardarMensaje(rol, contenido) {
  conversacion.mensajes.push({
    rol: rol,
    contenido: contenido,
    timestamp: new Date().toISOString()
  });
  
  // Guardar historial en archivo (opcional)
  try {
    fs.writeFileSync(
      `historial_${conversacion.usuario}_${conversacion.fecha.replace(/[: ]/g, "_")}.json`, 
      JSON.stringify(conversacion, null, 2)
    );
  } catch (err) {
    console.error("Error al guardar historial:", err);
  }
}

function sugerirCarreras(respuestas) {
  // Busca coincidencias simples con los intereses del usuario
  let sugeridas = [];
  for (const opcion of opcionesCarreras) {
    let coincidencias = opcion.intereses.filter((int) =>
      respuestas.join(" ").toLowerCase().includes(int)
    );
    if (coincidencias.length > 1) {
      sugeridas.push(...opcion.carreras);
    }
  }
  // Si no hubo coincidencias suficientes, sugiere opciones generales
  if (sugeridas.length < 2) {
    sugeridas = ["Administración de Empresas", "Ingeniería en Sistemas"];
  }
  // Elimina duplicados
  return [...new Set(sugeridas)];
}

// Función para personalizar respuesta basada en historial
function personalizarRespuesta(mensaje) {
  // Si el usuario ha mencionado algún tema específico antes, lo referenciamos
  const todosLosMensajesUsuario = conversacion.mensajes
    .filter(m => m.rol === "usuario")
    .map(m => m.contenido.toLowerCase());
  
  if (todosLosMensajesUsuario.some(m => m.includes("programación") || m.includes("programar"))) {
    return mensaje + " Por cierto, recuerdo que mencionaste la programación antes, ¡es un excelente campo!";
  }
  
  if (todosLosMensajesUsuario.some(m => m.includes("arte") || m.includes("diseño"))) {
    return mensaje + " Ya que mencionaste interés en temas creativos anteriormente, estas carreras podrían ser ideales.";
  }
  
  return mensaje;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🤖 ¡Hola! Soy tu bot orientador vocacional.");
  console.log("Te haré tres preguntas para conocerte mejor y sugerirte carreras. Podés escribir 'salir' en cualquier momento.\n");
  
  // Guardar mensaje de inicio
  guardarMensaje("bot", "¡Hola! Soy tu bot orientador vocacional.");

  let respuestas = [];
  let preguntaActual = 0;

  function hacerPregunta() {
    if (preguntaActual < preguntas.length) {
      // Guardar la pregunta en el historial
      guardarMensaje("bot", preguntas[preguntaActual]);
      
      rl.question(preguntas[preguntaActual] + "\n> ", (respuesta) => {
        if (respuesta.trim().toLowerCase() === "salir") {
          guardarMensaje("usuario", "salir");
          guardarMensaje("bot", "Sesión finalizada");
          rl.close();
          return;
        }
        
        // Guardar respuesta del usuario
        guardarMensaje("usuario", respuesta.trim());
        respuestas.push(respuesta.trim());
        preguntaActual++;
        hacerPregunta();
      });
    } else {
      // Sugerencia de carreras basada en las respuestas
      const carreras = sugerirCarreras(respuestas);
      const mensajeBase = `\nGracias por tus respuestas. Según lo que me contaste, te podrían interesar estas carreras:\n - ${carreras.join("\n - ")}`;
      const mensajePersonalizado = personalizarRespuesta(mensajeBase);
      
      console.log(mensajePersonalizado);
      guardarMensaje("bot", mensajePersonalizado);
      
      console.log("Si querés saber más sobre alguna carrera, escribilo, o poné 'salir' para terminar.");
      guardarMensaje("bot", "Si querés saber más sobre alguna carrera, escribilo, o poné 'salir' para terminar.");
      
      rl.on("line", (input) => {
        // Guardar input del usuario
        guardarMensaje("usuario", input.trim());
        
        if (input.trim().toLowerCase() === "salir") {
          const mensajeDespedida = "¡Gracias por usar el bot! Te deseo mucho éxito 😊";
          console.log(mensajeDespedida);
          guardarMensaje("bot", mensajeDespedida);
          rl.close();
        } else {
          // Personalizar respuesta basada en historial
          let respuesta = "Podés buscar más información en la web de universidades o consultarme otra carrera.";
          
          // Verificar si el usuario ha preguntado por una carrera específica
          const carreraConsultada = input.trim().toLowerCase();
          if (carreraConsultada.includes("ingeniería") || carreraConsultada.includes("sistemas")) {
            respuesta = "La Ingeniería en Sistemas es una excelente opción si te gusta la tecnología. Tiene buena salida laboral.";
          } else if (carreraConsultada.includes("medicina") || carreraConsultada.includes("salud")) {
            respuesta = "Las carreras de salud como Medicina requieren mucha dedicación, pero son muy gratificantes.";
          }
          
          const respuestaPersonalizada = personalizarRespuesta(respuesta);
          console.log(respuestaPersonalizada);
          guardarMensaje("bot", respuestaPersonalizada);
        }
      });
    }
  }

  hacerPregunta();
}

main();