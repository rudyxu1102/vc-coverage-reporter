import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JSONReporter } from '../../src/reporter/JsonReporter'
import { promises as fs } from 'fs'
import path from 'path'

describe('json-reporter', () => {
  const testOutputDir = 'test-coverage'
  let reporter: JSONReporter

  beforeEach(() => {
    reporter = new JSONReporter(testOutputDir)
  })

  afterEach(async () => {
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore error if directory doesn't exist
    }
  })

  it('should generate JSON report with coverage data', async () => {
    const coverageData = [{
      name: 'MyComponent',
      file: 'src/components/MyComponent.vue',
      total: 0,
      covered: 0,
      props: {
        total: 2,
        covered: 2,
        details: [
          { name: 'title', covered: true },
          { name: 'count', covered: true }
        ]
      },
      emits: {
        total: 2,
        covered: 1,
        details: [
          { name: 'change', covered: true },
          { name: 'submit', covered: false }
        ]
      },
      slots: {
        total: 1,
        covered: 1,
        details: [
          { name: 'default', covered: true }
        ]
      },
      exposes: {
        total: 0,
        covered: 0,
        details: []
      }
    }]

    reporter.setCoverageData(coverageData)
    await reporter.generateReport()

    const jsonPath = path.join(testOutputDir, 'coverage.json')
    const jsonContent = JSON.parse(await fs.readFile(jsonPath, 'utf-8'))

    expect(jsonContent).toEqual({
      summary: {
        totalComponents: 1,
        totalProps: 2,
        coveredProps: 2,
        totalSlots: 1,
        coveredSlots: 1,
        totalExposes: 0,
        coveredExposes: 0
      },
      stats: {
        props: 100,
        slots: 100,
        methods: 100,
        total: 100
      },
      components: coverageData
    })
  })

  it('should generate JSON report with empty coverage data', async () => {
    const coverageData = [{
      name: 'EmptyComponent',
      file: 'src/components/EmptyComponent.vue',
      total: 0,
      covered: 0,
      props: {
        total: 0,
        covered: 0,
        details: []
      },
      slots: {
        total: 0,
        covered: 0,
        details: []
      },
      exposes: {
        total: 0,
        covered: 0,
        details: []
      }
    }]

    reporter.setCoverageData(coverageData)
    await reporter.generateReport()

    const jsonPath = path.join(testOutputDir, 'coverage.json')
    const jsonContent = JSON.parse(await fs.readFile(jsonPath, 'utf-8'))

    expect(jsonContent).toEqual({
      summary: {
        totalComponents: 1,
        totalProps: 0,
        coveredProps: 0,
        totalSlots: 0,
        coveredSlots: 0,
        totalExposes: 0,
        coveredExposes: 0
      },
      stats: {
        props: 100,
        slots: 100,
        methods: 100,
        total: 100
      },
      components: coverageData
    })
  })

  it('should handle multiple components in report', async () => {
    const coverageData = [
      {
        name: 'ComponentA',
        file: 'src/components/ComponentA.vue',
        total: 0,
        covered: 0,
        props: {
          total: 2,
          covered: 2,
          details: [
            { name: 'propA', covered: true },
            { name: 'propB', covered: true }
          ]
        },
        slots: { total: 0, covered: 0, details: [] },
        exposes: { total: 0, covered: 0, details: [] }
      },
      {
        name: 'ComponentB',
        file: 'src/components/ComponentB.vue',
        total: 0,
        covered: 0,
        props: { total: 0, covered: 0, details: [] },
        slots: { total: 0, covered: 0, details: [] },
        exposes: { total: 0, covered: 0, details: [] }
      }
    ]

    reporter.setCoverageData(coverageData)
    await reporter.generateReport()

    const jsonPath = path.join(testOutputDir, 'coverage.json')
    const jsonContent = JSON.parse(await fs.readFile(jsonPath, 'utf-8'))

    expect(jsonContent).toEqual({
      summary: {
        totalComponents: 2,
        totalProps: 2,
        coveredProps: 2,
        totalSlots: 0,
        coveredSlots: 0,
        totalExposes: 0,
        coveredExposes: 0
      },
      stats: {
        props: 100,
        slots: 100,
        methods: 100,
        total: 100
      },
      components: coverageData
    })
  })
}) 