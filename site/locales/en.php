<?php

declare(strict_types=1);

return [
    'site' => [
        'skip_link' => 'Skip to main content',
        'descriptor' => 'AI Agents Platform for Business Operations',
        'nav' => [
            'platform' => 'Platform',
            'agents' => 'Agents',
            'solutions' => 'Solutions',
            'pilot' => 'Pilot',
            'contact' => 'Contact',
        ],
        'cta' => [
            'primary' => 'Request Demo',
            'secondary' => 'Discuss Pilot',
            'use_case' => 'Discuss Your Use Case',
            'explore_platform' => 'Explore Platform',
            'view_agents' => 'View Agent Scenarios',
            'view_solutions' => 'All Solutions',
        ],
        'footer' => [
            'line' => 'AI Agents Platform for Business Operations',
            'description' => 'A managed platform for launching AI agents across sales, support and operational workflows.',
        ],
        'language_label' => 'Site language',
        'menu_label' => 'Open menu',
    ],
    'meta' => [
        'home' => [
            'title' => 'Core AI Platform - AI Agents Platform for Business Operations',
            'description' => 'A platform for launching managed AI agents for sales, support and operations on a unified foundation for knowledge, control and scale.',
        ],
        'platform' => [
            'title' => 'Platform - Core AI Platform',
            'description' => 'A unified AI foundation for managed agents, knowledge, channels, control and business operations at scale.',
        ],
        'agents' => [
            'title' => 'AI Agents - Core AI Platform',
            'description' => 'Sales, support, request processing, operations, back-office and knowledge scenarios on one platform foundation.',
        ],
        'solutions' => [
            'title' => 'Ready Solutions - Core AI Platform',
            'description' => 'Ready AI-enabled solutions: syn0rix.dc for AI Data Center operations, syn0rix.billing for billing and crypto operations, and syn0rix.HSM for PCI DSS-compliant cryptographic infrastructure.',
        ],
        'solution_dc' => [
            'title' => 'syn0rix.dc - AI Data Center operations software',
            'description' => 'Software for AI Data Center operations: GPU bare metal capacity, clients, orders, resources, payments, incidents and operational workflows.',
        ],
        'solution_billing' => [
            'title' => 'syn0rix.billing - billing, ledger and crypto operations',
            'description' => 'A flexible billing solution for services, payments, FX, balances, reports and cryptocurrency operations.',
        ],
        'solution_hsm' => [
            'title' => 'syn0rix.HSM - PCI DSS HSM-first platform',
            'description' => 'A PCI DSS-compliant HSM-first platform for protected keys, signing, key lifecycle, administration and audit.',
        ],
        'pilot' => [
            'title' => 'Pilot and Contact - Core AI Platform',
            'description' => 'Start with one controlled pilot: choose a scenario, connect knowledge, launch an agent and expand from there.',
        ],
    ],
    'pages' => [
        'home' => [
            'hero' => [
                'eyebrow' => 'Unified AI foundation for business operations',
                'title' => 'Core AI Platform',
                'statement' => 'AI Agents Platform for Business Operations',
                'body' => 'Core AI Platform turns manual business processes into managed AI scenarios: documents, checks, internal operations, customer services and industry tasks. The agent works with company materials, follows rules and hands complex cases to a person.',
                'supporting' => 'From the first website agent to a scalable AI service line on one platform foundation.',
                'visual_title' => 'AI agent platform',
                'visual_badge' => 'Pilot launch',
                'visual_core_label' => 'Business process',
                'visual_items' => ['Knowledge', 'Channels', 'Control', 'Trace', 'Expansion'],
                'visual_columns' => ['input' => 'Process input', 'output' => 'Result'],
                'visual_sources' => ['Documents', 'Requests', 'Rules'],
                'visual_outputs' => ['Check', 'Answer', 'Next step'],
                'visual_signal' => ['Input', 'Rules', 'Human control', 'Business result'],
            ],
            'trust_strip' => ['Unified AI foundation', 'Multiple agent types', 'Managed knowledge', 'Controlled rollout', 'Business-ready operations'],
            'scenario_showcase' => [
                'label' => 'Where it applies',
                'title' => 'AI agents help where processes depend on data, rules and repeated work',
                'body' => 'The platform turns clear automation points into working AI services: process input, agent assistance, human control and business result.',
                'link' => 'View all scenarios',
                'cards' => [
                    ['code' => 'DOC', 'tag' => 'Company materials', 'title' => 'Documents and policies', 'text' => 'The agent reads materials, finds relevant rules and prepares a result for human review.', 'flow_label' => 'Document scenario flow', 'steps' => ['extract data', 'check rules', 'prepare output'], 'result' => 'Result: the team gets a reviewed draft faster.'],
                    ['code' => 'OPS', 'tag' => 'Internal process', 'title' => 'Internal operations', 'text' => 'Repeated process steps become faster with less manual search, checking and context transfer.', 'flow_label' => 'Operations scenario flow', 'steps' => ['receive task', 'check conditions', 'move forward'], 'result' => 'Result: the team spends less time on routine work.'],
                    ['code' => 'CX', 'tag' => 'Customer contact', 'title' => 'Customer services', 'text' => 'AI helps with typical questions, clarifies details and passes complex cases to a person.', 'flow_label' => 'Customer service scenario flow', 'steps' => ['understand request', 'find answer', 'escalate complex'], 'result' => 'Result: customers get answers faster while complex cases stay controlled.'],
                    ['code' => 'AML', 'tag' => 'Checks and control', 'title' => 'Control and AML', 'text' => 'Rule-heavy checks get an accurate AI layer while important decisions remain under human control.', 'flow_label' => 'Control scenario flow', 'steps' => ['collect facts', 'check signals', 'highlight risk'], 'result' => 'Result: risk is visible faster and decisions stay with the team.'],
                ],
            ],
            'business_effect' => [
                'label' => 'Business effect',
                'title' => 'The goal is faster processes and less manual work',
                'body' => 'AI agents are useful where teams repeat the same steps: search, check rules, prepare answers, review documents or move work forward.',
                'cards' => [
                    ['metric' => '01', 'title' => 'Reduce manual load', 'text' => 'Routine steps move into an AI scenario while people handle complex cases.'],
                    ['metric' => '02', 'title' => 'Speed up execution', 'text' => 'The process moves faster through input, rules, checks and result.'],
                    ['metric' => '03', 'title' => 'Launch next scenarios cheaper', 'text' => 'After the first pilot, new areas can use the same platform base.'],
                ],
            ],
            'launch_path' => [
                'label' => 'How we start',
                'title' => 'We do not launch everything at once. We start with one clear process',
                'body' => 'This lets the business see value faster, check quality calmly and scale without unnecessary risk.',
                'steps' => [
                    ['title' => 'Choose the task', 'text' => 'Find an area with manual work, documents, rules or repeated steps.'],
                    ['title' => 'Build the AI scenario', 'text' => 'Connect company materials, define boundaries and handoff to a person.'],
                    ['title' => 'Measure the effect', 'text' => 'Run the pilot, review quality and choose the next processes.'],
                ],
            ],
            'confidence' => [
                'label' => 'Why it is not just a bot',
                'title' => 'A platform matters when AI has to work inside a real business process',
                'body' => 'The home page keeps the story short. Platform, agent and pilot details live on separate pages so the first visit is not overloaded.',
                'platform_link' => 'Explore platform',
                'pilot_link' => 'Pilot process',
                'points' => [
                    ['title' => 'Controlled materials', 'text' => 'AI works with company documents, instructions and rules instead of improvising.'],
                    ['title' => 'Clear responsibility', 'text' => 'Each scenario defines what the agent can do and when a person takes over.'],
                    ['title' => 'Growth without rebuilding', 'text' => 'The first scenario becomes a base for the next AI services.'],
                ],
            ],
            'why_now' => [
                'label' => 'Why Now',
                'title' => 'Business is moving from isolated AI experiments to managed AI operations',
                'body' => [
                    'A first AI scenario can be launched quickly. The real complexity appears when new use cases, customers, data requirements, quality controls, integrations and scale arrive.',
                    'The next step after isolated bots and automation scripts is one platform where AI agents can perform repeatable tasks, work around the clock and expand into new business scenarios without rebuilding the foundation.',
                ],
            ],
            'platform' => [
                'label' => 'Platform',
                'title' => 'Not a new backend for every task, but one foundation for AI agents',
                'body' => 'Core AI Platform brings together agent management, model usage, knowledge-driven runtime, public and internal channels, behavior control, observability and a foundation for scale.',
                'features' => [
                    ['title' => 'Agent management', 'text' => 'Configure different agent profiles on one platform model instead of maintaining disconnected custom solutions.'],
                    ['title' => 'Managed knowledge', 'text' => 'Connect knowledge sources that can be updated, indexed and attached to agents without turning the system into prompt-only chaos.'],
                    ['title' => 'Controlled execution', 'text' => 'Agents run through a managed execution path where rules, fallback, trace and predictable behavior matter.'],
                    ['title' => 'Foundation for scale', 'text' => 'Start with one scenario and expand into sales, support, operations and internal workflows without rebuilding the core.'],
                ],
            ],
            'agents' => [
                'label' => 'Agents',
                'title' => 'One platform, multiple AI agent types',
                'intro' => 'Core AI Platform is not tied to a single bot-only scenario. It supports different classes of agents for different business tasks.',
                'cards' => [
                    ['title' => 'AI Sales Agent', 'text' => 'Answers product questions, qualifies interest, collects context and moves prospects to the next step.'],
                    ['title' => 'AI Support Agent', 'text' => 'Handles common requests, uses the knowledge base, clarifies the issue and hands complex cases to a human.'],
                    ['title' => 'AI Request Processing Agent', 'text' => 'Receives an incoming task, validates data, chooses the right path and prepares the next process step.'],
                    ['title' => 'AI Operations Agent', 'text' => 'Supports repeatable operational workflows, reduces manual load and makes execution more transparent.'],
                    ['title' => 'AI Back-office Assistant', 'text' => 'Helps internal teams process routine requests, documents and service workflows faster.'],
                    ['title' => 'AI Knowledge / Compliance Agent', 'text' => 'Works with curated domain knowledge and grounded responses instead of free-form improvisation.'],
                ],
            ],
            'first_service' => [
                'label' => 'First Launch Scenario',
                'title' => 'A clear first launch path: Website Sales & Support Knowledge Agent',
                'body' => 'A website agent answers visitor questions using the client knowledge base, helps qualify sales or support intent and safely hands complex cases to a human.',
                'checks' => ['public widget channel', 'customer / tenant setup', 'agent configuration', 'managed knowledge', 'runtime quality', 'support reconstruction', 'controlled rollout path'],
                'supporting' => 'The client site gets a managed AI service, not chat for the sake of chat.',
            ],
            'different' => [
                'label' => 'Why It Is Different',
                'title' => 'This is not a chatbot builder or a prompt wrapper around a model',
                'body' => 'Core AI Platform is built as a foundation layer: one base for models, agents, knowledge, channels, trace and further scenario expansion.',
                'points' => ['Not one bot, but a platform for different agent types', 'Not prompt-only logic, but a managed knowledge model', 'Not scattered integrations, but one operational foundation', 'Not chaotic growth, but a controlled expansion path'],
            ],
            'trust' => [
                'label' => 'Trust',
                'title' => 'A serious AI platform needs control, not only a polished interface',
                'body' => 'Business teams need to understand how an agent works, what knowledge it uses, how customers are isolated, how launches happen and how quality is maintained as scenarios grow.',
                'points' => [
                    ['title' => 'Multi-tenant foundation', 'text' => 'The platform is designed around isolation of customer data and configuration.'],
                    ['title' => 'Managed knowledge', 'text' => 'The knowledge base is treated as a managed product layer, not hidden text inside a system prompt.'],
                    ['title' => 'Controlled rollout', 'text' => 'New agents and configurations follow a clear launch path before production use.'],
                    ['title' => 'Observability and trace', 'text' => 'The platform helps reconstruct the execution path and understand how an agent reached a result.'],
                ],
            ],
            'pilot' => [
                'label' => 'Pilot',
                'title' => 'Start with one scenario and expand the platform from there',
                'body' => 'Choose one clear scenario, connect knowledge, configure the channel, launch a controlled pilot and then expand into new use cases.',
                'steps' => ['Define the priority scenario.', 'Configure the agent profile and business boundaries.', 'Connect knowledge sources and the interaction channel.', 'Launch the controlled pilot.', 'Review quality and plan the next wave of scenarios.'],
            ],
            'final_cta' => [
                'title' => 'Build the first AI service on a platform designed for the next step',
                'body' => 'If you need more than a quick AI experiment, Core AI Platform can become the foundation for scaling managed agents.',
            ],
        ],
        'platform' => [
            'hero' => ['label' => 'Platform', 'title' => 'A unified foundation for managed AI agents', 'body' => 'Core AI Platform connects agent profiles, knowledge sources, channels, launch control and observability into one foundation layer for business operations.'],
            'sections' => [
                ['title' => 'Why a unified foundation matters', 'text' => 'Isolated AI bots quickly create architectural sprawl: separate knowledge, rules, channels and quality processes. A platform gives teams one control layer.'],
                ['title' => 'Controlled AI execution', 'text' => 'Agents need clear boundaries: managed knowledge, fallback, handoff, trace and disciplined rollout.'],
                ['title' => 'Scalability and expansion', 'text' => 'After the first scenario, teams can launch new agent profiles and channels on the same base.'],
            ],
        ],
        'agents' => [
            'hero' => ['label' => 'Agents', 'title' => 'Different agent types on one platform base', 'body' => 'The platform supports sales, support, request processing, operations, back-office and knowledge/compliance scenarios.'],
            'spotlight' => ['title' => 'First service scenario', 'text' => 'Website Sales & Support Knowledge Agent is a practical public-channel starting point before expanding into deeper operations.'],
        ],
        'solutions' => [
            'hero' => ['label' => 'Ready solutions', 'title' => 'The platform can be expanded into serious B2B solutions', 'body' => 'This section does not replace the platform story. It adds a practical product layer: ready solutions for infrastructure, billing and secure operations with AI agents inside the workflow.'],
            'overview' => ['label' => 'Solution line', 'title' => 'Three directions where AI agents support operational systems', 'body' => 'Each solution has its own data, roles, statuses, reports and control points.'],
            'cards' => [
                ['code' => 'syn0rix.dc', 'tag' => 'AI Data Center', 'title' => 'AI DC operations', 'text' => 'Software for GPU bare metal capacity, clients, orders, resources, payments, incidents and operations.', 'points' => ['clients, capacity and orders', 'resources, payments and incidents', 'AI assistance for operators'], 'page' => 'solution_dc', 'link' => 'Explore syn0rix.dc'],
                ['code' => 'syn0rix.billing', 'tag' => 'Billing core', 'title' => 'Billing, ledger and crypto operations', 'text' => 'A billing platform for services, payments, FX logic, reports and cryptocurrency operations.', 'points' => ['accounts, documents and transactions', 'currencies, rates and exchange', 'wallets, transfers and indexer'], 'page' => 'solution_billing', 'link' => 'Explore syn0rix.billing'],
                ['code' => 'syn0rix.HSM', 'tag' => 'Secure crypto', 'title' => 'HSM-first crypto contour', 'text' => 'A PCI DSS-compliant platform for protected keys, signing, lifecycle operations, administration, audit and HSM backend integration.', 'points' => ['PCI DSS compliance', 'LMK, KEK and cryptograms', 'SoftHSM, Thales and Cloud HSM', 'admin, CLI, audit and portal'], 'page' => 'solution_hsm', 'link' => 'Explore syn0rix.HSM'],
            ],
            'proof' => ['label' => 'Why it matters', 'title' => 'Ready solutions show that AI agents can work inside real operations', 'body' => 'These are not separate demos. They show how the platform approach applies to infrastructure, billing, payments and security.', 'checks' => ['productized directions', 'clear business contours', 'AI agents inside operations', 'less manual work', 'fewer heavy external systems', 'better launch economics']],
            'cta' => ['title' => 'Start with one solution or one process inside it', 'body' => 'We can help choose the first operational area to automate.'],
        ],
        'solution_details' => [
            'dc' => [
                'label' => 'Ready solution',
                'title' => 'syn0rix.dc - AI Data Center operations software',
                'body' => 'A solution for AI Data Center operators selling GPU bare metal capacity, LLM access or infrastructure services without adopting a heavy external platform.',
                'summary' => ['label' => 'Business value', 'title' => 'AI DC needs an operational layer around capacity', 'body' => 'syn0rix.dc brings clients, orders, capacity, resources, payments, incidents and operations into one managed contour.', 'facts' => [['metric' => '01', 'title' => 'Lower payback threshold', 'text' => 'Less external platform cost and less manual operational assembly.'], ['metric' => '02', 'title' => 'Less manual work', 'text' => 'AI agents assist with monitoring, statuses, notifications and summaries.'], ['metric' => '03', 'title' => 'Faster controlled start', 'text' => 'Resources, orders and incidents become visible in one process.']]],
                'capabilities' => ['label' => 'Key blocks', 'title' => 'What syn0rix.dc covers', 'body' => 'A concise product view for investors, partners and early customers.', 'blocks' => [['title' => 'Clients and orders', 'text' => 'Client records, orders, service states and operational steps.'], ['title' => 'Capacity and resources', 'text' => 'GPU bare metal servers, available capacity, hardware statuses and resource utilization.'], ['title' => 'Payments and commercial logic', 'text' => 'Services, orders, payments, tariffs and units of consumption.'], ['title' => 'Incidents and operations', 'text' => 'Incident control, notifications, ownership, statuses and management summaries.']]],
                'agents' => ['label' => 'AI agents', 'title' => 'Agents help run the data center with a leaner team', 'body' => 'They do not replace the team completely, but reduce repetitive control and operator load.', 'checks' => ['health monitoring', 'resource accounting', 'hardware statuses', 'operation control', 'notifications', 'operator assistance', 'management summaries']],
                'cta' => ['title' => 'Discuss the first AI DC contour to automate', 'body' => 'Start with capacity, client orders, equipment statuses or operator control.'],
            ],
            'billing' => [
                'label' => 'Ready solution',
                'title' => 'syn0rix.billing - billing, ledger and crypto operations',
                'body' => 'A universal billing solution for services, payments, online products, FX calculations, exchange differences and cryptocurrency operations.',
                'summary' => ['label' => 'Business value', 'title' => 'Billing becomes the center of accounting, not just payments UI', 'body' => 'The model is built around documents, transactions, ledger effects, balances, holds, reports and crypto operations.', 'facts' => [['metric' => '01', 'title' => 'Ledger core', 'text' => 'Documents, transactions, revisions, statuses, balances and audit trail.'], ['metric' => '02', 'title' => 'FX and exchange', 'text' => 'Currencies, rates, exchange documents and cross-currency accounting.'], ['metric' => '03', 'title' => 'Crypto operations', 'text' => 'Wallets, transfers, indexer and crypto-agent contours.']]],
                'capabilities' => ['label' => 'Solution blocks', 'title' => 'Short view of syn0rix.billing', 'body' => 'The solution covers accounting, posting, control, reporting and crypto operations.', 'blocks' => [['title' => 'Billing core', 'text' => 'Accounts, clients, documents, transactions, fees, revisions, statuses and integration API.'], ['title' => 'Balances and holds', 'text' => 'Online balances, reservations, daily history and balance snapshots.'], ['title' => 'Currencies and rates', 'text' => 'Atomic units, currency directories, rates, exchange documents and credit/debit legs.'], ['title' => 'Reports and statements', 'text' => 'JSON statements, XLSX exports, balance reports and export jobs.'], ['title' => 'Wallets and addresses', 'text' => 'Crypto profiles, deposit addresses and billing account to network/token mapping.'], ['title' => 'Transfers and Indexer', 'text' => 'Withdrawals, signing, broadcast, confirmations, finality and reorg handling.']]],
                'agents' => ['label' => 'AI in billing', 'title' => 'AI reduces staff load in accounting operations', 'body' => 'Agents can help with exceptions, statuses, reconciliation, reports and operator support.', 'checks' => ['document status control', 'exception hints', 'payment reconciliation', 'report preparation', 'operator assistance', 'FX control', 'operational alerts']],
                'cta' => ['title' => 'Discuss how syn0rix.billing fits your model', 'body' => 'Suitable for subscriptions, usage-based services, FX, crypto payments or complex service accounting.'],
            ],
            'hsm' => [
                'label' => 'Ready solution',
                'title' => 'syn0rix.HSM - PCI DSS-compliant HSM-first platform',
                'body' => 'A PCI DSS-compliant solution for protected key storage, signing, key lifecycle, audit and HSM backend integration.',
                'summary' => ['label' => 'Business value', 'title' => 'Key material must stay inside a PCI DSS-compliant protected contour', 'body' => 'External systems receive public data or crypto operation results, not plaintext private keys.', 'facts' => [['metric' => '01', 'title' => 'PCI DSS', 'text' => 'Architecture aligned with PCI DSS requirements for protected cryptographic and payment contours.'], ['metric' => '02', 'title' => 'HSM-first model', 'text' => 'LMK, KEK, cryptograms, key ceremony, rotation and signing path.'], ['metric' => '03', 'title' => 'Admin/Ops contour', 'text' => 'Admin API, hsmctl, portal/BFF, self-test, incidents and audit.']]],
                'capabilities' => ['label' => 'Key blocks', 'title' => 'What syn0rix.HSM includes', 'body' => 'A concise commercial view without deep cryptographic detail.', 'blocks' => [['title' => 'PCI DSS compliance', 'text' => 'A PCI DSS-compliant HSM contour for payment, financial and regulated scenarios where key control, audit and access separation matter.'], ['title' => 'Key hierarchy', 'text' => 'LMK -> KEK -> encrypted private keys / cryptograms.'], ['title' => 'Business RPC over UDS', 'text' => 'Local business contour for key generation, public derivation, address creation and signing.'], ['title' => 'Admin and operator tools', 'text' => 'Runtime state, unlock/lock, self-test, key ceremony, incidents and rotation.'], ['title' => 'Pluggable HSM backend', 'text' => 'A unified HSM Manager hides vendor-specific details.']]],
                'agents' => ['label' => 'AI and control', 'title' => 'AI helps operators understand secure-contour state faster', 'body' => 'The AI layer supports diagnostics, runbooks, incidents and reporting without replacing crypto policies.', 'checks' => ['operator summaries', 'incident highlighting', 'runbook support', 'audit summaries', 'runtime state control', 'status explanations', 'management information']],
                'cta' => ['title' => 'Discuss a protected contour for your payment or crypto process', 'body' => 'Start with design review, a SoftHSM pilot or an enterprise hardware HSM profile.'],
            ],
        ],
        'pilot' => [
            'hero' => ['label' => 'Pilot', 'title' => 'A controlled first launch instead of a large risky implementation', 'body' => 'A pilot validates the scenario, knowledge quality, interaction channel and handoff rules before wider scaling.'],
            'needs' => ['title' => 'What we need from the client', 'items' => ['Priority scenario', 'Knowledge base materials', 'Response boundaries', 'Feedback contact team']],
            'setup' => ['title' => 'What the platform team sets up', 'items' => ['Agent profile', 'Knowledge connection', 'Public or internal channel', 'Fallback and handoff rules', 'Pilot quality review']],
            'success' => ['title' => 'What pilot success looks like', 'text' => 'A clear scenario works in a controlled channel, the team can review response quality and the next use case can launch without a new foundation.'],
            'form' => ['title' => 'Let us discuss which AI scenario should launch first', 'text' => 'Describe your use case and we will help define the right pilot path on Core AI Platform.', 'fields' => ['name' => 'Name', 'company' => 'Company', 'email' => 'Email', 'use_case' => 'Use Case', 'message' => 'Message'], 'submit' => 'Start Pilot Discussion', 'sent' => 'Request sent. We will contact you and suggest the next pilot step.', 'error' => 'Check the email and required fields, then send the request again.'],
        ],
    ],
];
