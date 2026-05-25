import { describe, expect, it } from 'vitest'
import type { AgentKnowledgeCatalog } from '@/modules/AgentKnowledgeBinding/api/agentKnowledgeBindingApi'
import {
  deriveAgentKnowledgeCanManage,
  normalizeAgentKnowledgeBindingInput,
  resolveAgentKnowledgeRetrievalModes,
} from '@/modules/AgentKnowledgeBinding/model/useAgentKnowledgeBindingManager'

const catalog = {
  relationToTemplate: 'required',
  requiredModes: ['product_knowledge_source'],
  optionalModes: [],
  sources: [
    {
      sourceId: 'source.faq.public_support_faq',
      sourceVersion: 'v1',
      label: 'Public support FAQ',
      sourceClass: 'faq',
      accessTier: 'global',
      storageClass: 'structured',
      allowedRetrievalModes: ['keyword_grounded', 'structured_lookup'],
      explainabilityTags: [],
    },
    {
      sourceId: 'source.catalog.reference_product_catalog',
      sourceVersion: 'v1',
      label: 'Reference product catalog',
      sourceClass: 'product_catalog',
      accessTier: 'global',
      storageClass: 'structured',
      allowedRetrievalModes: ['hybrid_curated', 'structured_lookup'],
      explainabilityTags: [],
    },
  ],
  sourceSets: [
    {
      sourceSetId: 'knowledge_set.public_grounding_default',
      label: 'Public grounding default',
      purposeMarker: 'public_grounding',
      sourceIds: ['source.faq.public_support_faq', 'source.catalog.reference_product_catalog'],
      sourceClassConstraints: [],
    },
  ],
} satisfies AgentKnowledgeCatalog

describe('deriveAgentKnowledgeCanManage', () => {
  it('requires both role/permission and backend knowledge action refs', () => {
    expect(deriveAgentKnowledgeCanManage(['knowledge.manage'], true)).toBe(true)
    expect(deriveAgentKnowledgeCanManage(['knowledge.binding.manage'], true)).toBe(true)
    expect(deriveAgentKnowledgeCanManage(['knowledge.sources.manage'], true)).toBe(true)
    expect(deriveAgentKnowledgeCanManage(['knowledge.documents.manage'], true)).toBe(true)
    expect(deriveAgentKnowledgeCanManage(['knowledge.indexing.manage'], true)).toBe(true)
    expect(deriveAgentKnowledgeCanManage(['agent_config.manage'], true)).toBe(false)
    expect(deriveAgentKnowledgeCanManage(['knowledge.manage'], false)).toBe(false)
  })
})

describe('resolveAgentKnowledgeRetrievalModes', () => {
  it('returns only modes allowed by selected direct sources', () => {
    expect(resolveAgentKnowledgeRetrievalModes(catalog, {
      bindingMode: 'sources',
      sourceSetId: null,
      sourceIds: ['source.faq.public_support_faq'],
      retrievalMode: 'hybrid_curated',
    })).toEqual(['keyword_grounded', 'structured_lookup'])
  })

  it('returns the intersection of source-set source modes', () => {
    expect(resolveAgentKnowledgeRetrievalModes(catalog, {
      bindingMode: 'source_set',
      sourceSetId: 'knowledge_set.public_grounding_default',
      sourceIds: [],
      retrievalMode: null,
    })).toEqual(['structured_lookup'])
  })
})

describe('normalizeAgentKnowledgeBindingInput', () => {
  it('replaces an incompatible retrieval mode before submit', () => {
    expect(normalizeAgentKnowledgeBindingInput(catalog, {
      bindingMode: 'sources',
      sourceSetId: null,
      sourceIds: ['source.faq.public_support_faq'],
      retrievalMode: 'hybrid_curated',
    })).toMatchObject({
      sourceSetId: null,
      sourceIds: ['source.faq.public_support_faq'],
      retrievalMode: 'keyword_grounded',
    })
  })

  it('clears inactive binding fields for disabled knowledge binding', () => {
    expect(normalizeAgentKnowledgeBindingInput(catalog, {
      bindingMode: 'no_knowledge',
      sourceSetId: 'knowledge_set.public_grounding_default',
      sourceIds: ['source.faq.public_support_faq'],
      retrievalMode: 'keyword_grounded',
    })).toEqual({
      bindingMode: 'no_knowledge',
      sourceSetId: null,
      sourceIds: [],
      retrievalMode: null,
    })
  })
})
