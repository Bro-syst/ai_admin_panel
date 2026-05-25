<?php

declare(strict_types=1);

return [
    'site' => [
        'skip_link' => 'Saltar al contenido principal',
        'descriptor' => 'AI Agents Platform for Business Operations',
        'nav' => [
            'platform' => 'Plataforma',
            'agents' => 'Agentes',
            'pilot' => 'Piloto',
            'contact' => 'Contacto',
        ],
        'cta' => [
            'primary' => 'Request Demo',
            'secondary' => 'Discuss Pilot',
            'use_case' => 'Discuss Your Use Case',
            'explore_platform' => 'Explore Platform',
            'view_agents' => 'View Agent Scenarios',
        ],
        'footer' => [
            'line' => 'AI Agents Platform for Business Operations',
            'description' => 'Una plataforma gestionada para lanzar agentes de AI en ventas, soporte y operaciones.',
        ],
        'language_label' => 'Idioma del sitio',
        'menu_label' => 'Abrir menú',
    ],
    'meta' => [
        'home' => [
            'title' => 'Core AI Platform - AI Agents Platform for Business Operations',
            'description' => 'Plataforma para lanzar agentes de AI gestionados para ventas, soporte y operaciones sobre una base unificada de conocimiento, control y escala.',
        ],
        'platform' => [
            'title' => 'Plataforma - Core AI Platform',
            'description' => 'Una base unificada de AI para agentes, conocimiento, canales, control y operaciones empresariales a escala.',
        ],
        'agents' => [
            'title' => 'Agentes de AI - Core AI Platform',
            'description' => 'Escenarios de ventas, soporte, procesamiento de solicitudes, operaciones, back-office y conocimiento sobre una sola plataforma.',
        ],
        'pilot' => [
            'title' => 'Piloto y contacto - Core AI Platform',
            'description' => 'Empiece con un piloto controlado: elija un escenario, conecte conocimiento, lance un agente y amplíe desde ahí.',
        ],
    ],
    'pages' => [
        'home' => [
            'hero' => [
                'eyebrow' => 'Base unificada de AI para operaciones empresariales',
                'title' => 'Core AI Platform',
                'statement' => 'AI Agents Platform for Business Operations',
                'body' => 'Core AI Platform convierte procesos manuales en escenarios AI gestionados: documentos, verificaciones, operaciones internas, servicios al cliente y tareas sectoriales. El agente trabaja con materiales de la empresa, sigue reglas y entrega casos complejos a una persona.',
                'supporting' => 'Del primer website agent a una línea escalable de servicios de AI sobre una misma base.',
                'visual_title' => 'Plataforma de agentes AI',
                'visual_badge' => 'Lanzamiento piloto',
                'visual_core_label' => 'Proceso de negocio',
                'visual_items' => ['Knowledge', 'Channels', 'Control', 'Trace', 'Expansion'],
                'visual_columns' => ['input' => 'Entrada del proceso', 'output' => 'Resultado'],
                'visual_sources' => ['Documentos', 'Solicitudes', 'Reglas'],
                'visual_outputs' => ['Verificacion', 'Respuesta', 'Siguiente paso'],
                'visual_signal' => ['Entrada', 'Reglas', 'Control humano', 'Resultado de negocio'],
            ],
            'trust_strip' => ['Base unificada de AI', 'Múltiples tipos de agentes', 'Conocimiento gestionado', 'Lanzamiento controlado', 'Operaciones listas para negocio'],
            'scenario_showcase' => [
                'label' => 'Donde se aplica',
                'title' => 'Los agentes AI ayudan donde el proceso depende de datos, reglas y trabajo repetido',
                'body' => 'La plataforma convierte puntos claros de automatizacion en servicios AI de trabajo: entrada del proceso, ayuda del agente, control humano y resultado de negocio.',
                'link' => 'Ver todos los escenarios',
                'cards' => [
                    ['code' => 'DOC', 'tag' => 'Materiales de empresa', 'title' => 'Documentos y reglas', 'text' => 'El agente lee materiales, encuentra reglas relevantes y prepara un resultado para revision humana.', 'flow_label' => 'Flujo de documentos', 'steps' => ['extraer datos', 'verificar reglas', 'preparar salida'], 'result' => 'Resultado: el equipo recibe un borrador revisado mas rapido.'],
                    ['code' => 'OPS', 'tag' => 'Proceso interno', 'title' => 'Operaciones internas', 'text' => 'Los pasos repetidos del proceso se aceleran con menos busqueda manual, verificacion y transferencia de contexto.', 'flow_label' => 'Flujo de operaciones', 'steps' => ['recibir tarea', 'verificar condiciones', 'avanzar'], 'result' => 'Resultado: el equipo dedica menos tiempo a la rutina.'],
                    ['code' => 'CX', 'tag' => 'Contacto cliente', 'title' => 'Servicios al cliente', 'text' => 'AI ayuda con preguntas tipicas, aclara detalles y entrega casos complejos a una persona.', 'flow_label' => 'Flujo de servicio al cliente', 'steps' => ['entender solicitud', 'encontrar respuesta', 'escalar lo complejo'], 'result' => 'Resultado: el cliente recibe respuesta antes y lo complejo queda controlado.'],
                    ['code' => 'AML', 'tag' => 'Control y verificaciones', 'title' => 'Control y AML', 'text' => 'Los procesos con reglas y verificaciones reciben una capa AI precisa sin perder el control humano.', 'flow_label' => 'Flujo de control', 'steps' => ['reunir hechos', 'verificar senales', 'marcar riesgo'], 'result' => 'Resultado: el riesgo aparece antes y la decision queda en el equipo.'],
                ],
            ],
            'business_effect' => [
                'label' => 'Efecto para negocio',
                'title' => 'El objetivo es acelerar procesos y reducir trabajo manual',
                'body' => 'Los agentes AI son utiles donde el equipo repite pasos: buscar informacion, verificar reglas, preparar respuestas, revisar documentos o mover una tarea.',
                'cards' => [
                    ['metric' => '01', 'title' => 'Reducir carga manual', 'text' => 'Los pasos rutinarios pasan a un escenario AI y las personas atienden casos complejos.'],
                    ['metric' => '02', 'title' => 'Acelerar la ejecucion', 'text' => 'El proceso avanza mas rapido por entrada, reglas, verificacion y resultado.'],
                    ['metric' => '03', 'title' => 'Lanzar siguientes escenarios con menor costo', 'text' => 'Tras el primer piloto, nuevas areas usan la misma base de plataforma.'],
                ],
            ],
            'launch_path' => [
                'label' => 'Como empezamos',
                'title' => 'No lanzamos todo a la vez. Empezamos con un proceso claro',
                'body' => 'Asi el negocio ve valor antes, revisa calidad con calma y escala sin riesgo innecesario.',
                'steps' => [
                    ['title' => 'Elegir la tarea', 'text' => 'Encontrar un area con trabajo manual, documentos, reglas o pasos repetidos.'],
                    ['title' => 'Crear el escenario AI', 'text' => 'Conectar materiales de la empresa, definir limites y entrega a una persona.'],
                    ['title' => 'Medir el efecto', 'text' => 'Lanzar el piloto, revisar calidad y elegir los siguientes procesos.'],
                ],
            ],
            'confidence' => [
                'label' => 'Por que no es solo un bot',
                'title' => 'La plataforma importa cuando AI debe trabajar dentro de un proceso real',
                'body' => 'La pagina principal mantiene el mensaje corto. Los detalles de plataforma, agentes y piloto estan en paginas separadas para no sobrecargar la primera visita.',
                'platform_link' => 'Ver plataforma',
                'pilot_link' => 'Proceso piloto',
                'points' => [
                    ['title' => 'Materiales bajo control', 'text' => 'AI trabaja con documentos, instrucciones y reglas de la empresa, no improvisa.'],
                    ['title' => 'Responsabilidad clara', 'text' => 'Cada escenario define que hace el agente y cuando interviene una persona.'],
                    ['title' => 'Crecimiento sin reconstruir', 'text' => 'El primer escenario se convierte en base para los siguientes servicios AI.'],
                ],
            ],
            'why_now' => [
                'label' => 'Por qué ahora',
                'title' => 'Las empresas pasan de experimentos aislados a operaciones de AI gestionadas',
                'body' => [
                    'Un primer escenario de AI puede lanzarse rápido. La complejidad real aparece cuando llegan nuevos casos de uso, clientes, requisitos de datos, calidad, integraciones y escala.',
                    'El siguiente paso después de bots aislados y scripts de automatización es una plataforma donde los agentes puedan ejecutar tareas repetibles y expandirse sin reconstruir la base.',
                ],
            ],
            'platform' => [
                'label' => 'Plataforma',
                'title' => 'No un backend nuevo para cada tarea, sino una base común para agentes de AI',
                'body' => 'Core AI Platform reúne gestión de agentes, modelos, runtime basado en conocimiento, canales públicos e internos, control de comportamiento, observabilidad y base para escalar.',
                'features' => [
                    ['title' => 'Gestión de agentes', 'text' => 'Configure diferentes perfiles de agente sobre un modelo común de plataforma.'],
                    ['title' => 'Conocimiento gestionado', 'text' => 'Conecte fuentes de conocimiento que pueden actualizarse, indexarse y vincularse a agentes.'],
                    ['title' => 'Ejecución controlada', 'text' => 'Los agentes funcionan en un camino de ejecución donde importan reglas, fallback, trazabilidad y predictibilidad.'],
                    ['title' => 'Base para escalar', 'text' => 'Empiece con un escenario y amplíe a ventas, soporte, operaciones y procesos internos.'],
                ],
            ],
            'agents' => [
                'label' => 'Agentes',
                'title' => 'Una plataforma, distintos tipos de agentes de AI',
                'intro' => 'Core AI Platform no está limitada a un único escenario de bot. Soporta diferentes clases de agentes según la tarea de negocio.',
                'cards' => [
                    ['title' => 'AI Sales Agent', 'text' => 'Responde preguntas sobre el producto, califica interés, recoge contexto y guía al siguiente paso.'],
                    ['title' => 'AI Support Agent', 'text' => 'Atiende solicitudes típicas, usa la base de conocimiento y entrega casos complejos a una persona.'],
                    ['title' => 'AI Request Processing Agent', 'text' => 'Recibe tareas, valida datos, elige el camino adecuado y prepara el siguiente paso.'],
                    ['title' => 'AI Operations Agent', 'text' => 'Apoya procesos operativos repetibles y hace la ejecución más estable y transparente.'],
                    ['title' => 'AI Back-office Assistant', 'text' => 'Ayuda a equipos internos con solicitudes, documentos y workflows de servicio.'],
                    ['title' => 'AI Knowledge / Compliance Agent', 'text' => 'Trabaja con conocimiento curado y respuestas grounded en lugar de improvisación libre.'],
                ],
            ],
            'first_service' => [
                'label' => 'Primer lanzamiento',
                'title' => 'Un primer camino claro: Website Sales & Support Knowledge Agent',
                'body' => 'Un agente web responde a visitantes con la knowledge base del cliente, califica intención de ventas o soporte y entrega casos complejos de forma segura.',
                'checks' => ['public widget channel', 'customer / tenant setup', 'agent configuration', 'managed knowledge', 'runtime quality', 'support reconstruction', 'controlled rollout path'],
                'supporting' => 'El sitio del cliente obtiene un servicio de AI gestionado, no un chat por el chat.',
            ],
            'different' => [
                'label' => 'Diferencia',
                'title' => 'No es un chatbot builder ni un prompt-wrapper alrededor de un modelo',
                'body' => 'Core AI Platform se construye como foundation layer: una base para modelos, agentes, conocimiento, canales, trazabilidad y expansión.',
                'points' => ['No un solo bot, sino una plataforma para distintos agentes', 'No lógica solo de prompt, sino modelo de conocimiento gestionado', 'No integraciones dispersas, sino una base operativa', 'No crecimiento caótico, sino expansión controlada'],
            ],
            'trust' => [
                'label' => 'Confianza',
                'title' => 'Una plataforma seria de AI necesita control, no solo una interfaz agradable',
                'body' => 'El negocio debe entender cómo trabaja el agente, qué conocimiento usa, cómo se aíslan clientes, cómo se lanza y cómo se mantiene la calidad.',
                'points' => [
                    ['title' => 'Multi-tenant foundation', 'text' => 'La plataforma considera la separación de datos y configuraciones de cada cliente.'],
                    ['title' => 'Managed knowledge', 'text' => 'La knowledge base es una capa de producto gestionada, no texto oculto en un system prompt.'],
                    ['title' => 'Controlled rollout', 'text' => 'Los agentes y configuraciones pasan por un camino de lanzamiento claro.'],
                    ['title' => 'Observability and trace', 'text' => 'La plataforma ayuda a reconstruir el execution path y entender cómo se obtuvo un resultado.'],
                ],
            ],
            'pilot' => [
                'label' => 'Piloto',
                'title' => 'Empiece con un escenario y amplíe la plataforma después',
                'body' => 'Elija un escenario claro, conecte conocimiento, configure el canal, lance un piloto controlado y después amplíe a nuevos use cases.',
                'steps' => ['Definir el escenario prioritario.', 'Configurar el perfil del agente y límites de negocio.', 'Conectar fuentes de conocimiento y canal.', 'Lanzar el piloto controlado.', 'Analizar calidad y planificar la siguiente ola.'],
            ],
            'final_cta' => [
                'title' => 'Construya el primer servicio de AI sobre una plataforma preparada para el siguiente paso',
                'body' => 'Si necesita más que un experimento rápido, Core AI Platform puede ser la base para escalar agentes gestionados.',
            ],
        ],
        'platform' => [
            'hero' => ['label' => 'Plataforma', 'title' => 'Una base unificada para agentes de AI gestionados', 'body' => 'Core AI Platform conecta perfiles de agente, conocimiento, canales, control de lanzamiento y observabilidad en una base para operaciones empresariales.'],
            'sections' => [
                ['title' => 'Por qué importa una base unificada', 'text' => 'Los bots aislados crean dispersión: conocimiento, reglas, canales y calidad separados. La plataforma aporta una capa común de control.'],
                ['title' => 'Controlled AI execution', 'text' => 'Los agentes necesitan límites claros: conocimiento gestionado, fallback, handoff, trazabilidad y rollout disciplinado.'],
                ['title' => 'Escala y expansión', 'text' => 'Después del primer escenario, el equipo puede lanzar nuevos perfiles y canales sobre la misma base.'],
            ],
        ],
        'agents' => [
            'hero' => ['label' => 'Agentes', 'title' => 'Distintos tipos de agentes sobre una sola base', 'body' => 'La plataforma soporta ventas, soporte, solicitudes, operaciones, back-office y escenarios de knowledge/compliance.'],
            'spotlight' => ['title' => 'Primer escenario de servicio', 'text' => 'Website Sales & Support Knowledge Agent es un punto de entrada práctico antes de ampliar a operaciones más profundas.'],
        ],
        'pilot' => [
            'hero' => ['label' => 'Piloto', 'title' => 'Un primer lanzamiento controlado en lugar de una gran implementación riesgosa', 'body' => 'El piloto valida escenario, calidad del conocimiento, canal y reglas de handoff antes de escalar.'],
            'needs' => ['title' => 'Qué necesitamos del cliente', 'items' => ['Escenario prioritario', 'Materiales de knowledge base', 'Límites de respuesta', 'Equipo de feedback']],
            'setup' => ['title' => 'Qué configura el platform team', 'items' => ['Agent profile', 'Knowledge connection', 'Canal público o interno', 'Fallback y handoff rules', 'Pilot quality review']],
            'success' => ['title' => 'Cómo se ve el éxito del piloto', 'text' => 'Un escenario claro funciona en un canal controlado, el equipo ve la calidad y el siguiente use case puede lanzarse sin nueva base.'],
            'form' => ['title' => 'Hablemos de qué escenario de AI conviene lanzar primero', 'text' => 'Describa su caso y ayudaremos a definir el piloto sobre Core AI Platform.', 'fields' => ['name' => 'Name', 'company' => 'Company', 'email' => 'Email', 'use_case' => 'Use Case', 'message' => 'Message'], 'submit' => 'Start Pilot Discussion', 'sent' => 'Solicitud guardada. El equipo puede procesarla desde el registro local.', 'error' => 'Revise el email y los campos obligatorios, luego envíe la solicitud otra vez.'],
        ],
    ],
];
