import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRegisteredVersionsForTests, registerSvelteDrawLibraryVersion } from './version'

describe('version utilities', () => {
	let mockConsoleLog: ReturnType<typeof vi.fn<(...args: any[]) => any>>

	beforeEach(() => {
		mockConsoleLog = vi.fn()
		vi.stubGlobal('console', { log: mockConsoleLog })
		vi.useFakeTimers()
		clearRegisteredVersionsForTests()
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
		vi.useRealTimers()
		clearRegisteredVersionsForTests()
	})

	describe('clearRegisteredVersionsForTests', () => {
		it('should clear all registered versions', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')

			clearRegisteredVersionsForTests()

			// After clearing, registering the same versions should not trigger warnings
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).not.toHaveBeenCalled()
		})

		it('should reset warning state', () => {
			// Register conflicting versions to trigger warning
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			mockConsoleLog.mockClear()

			clearRegisteredVersionsForTests()

			// After clearing, same conflicting versions should trigger warning again
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
		})

		it('should clear scheduled timeout', () => {
			const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			clearRegisteredVersionsForTests()

			expect(clearTimeoutSpy).toHaveBeenCalled()
		})

		it('should handle multiple calls without error', () => {
			clearRegisteredVersionsForTests()
			clearRegisteredVersionsForTests()
			clearRegisteredVersionsForTests()

			expect(() => clearRegisteredVersionsForTests()).not.toThrow()
		})

		it('should handle clearing when no timeout is scheduled', () => {
			const _clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
			clearRegisteredVersionsForTests()

			// Should not throw when clearing empty state
			expect(() => clearRegisteredVersionsForTests()).not.toThrow()
		})
	})

	describe('registerSvelteDrawLibraryVersion', () => {
		it('should register a library version with valid parameters', () => {
			expect(() => registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')).not.toThrow()

			// Should schedule a timeout check
			expect(vi.getTimerCount()).toBeGreaterThan(0)
		})

		it('should handle missing name parameter', () => {
			expect(() => registerSvelteDrawLibraryVersion(undefined, '2.0.0', 'esm')).not.toThrow()

			// Should not schedule timeout when parameters are missing
			expect(vi.getTimerCount()).toBe(0)
		})

		it('should handle missing version parameter', () => {
			expect(() => registerSvelteDrawLibraryVersion('@svelte-draw/editor', undefined, 'esm')).not.toThrow()

			expect(vi.getTimerCount()).toBe(0)
		})

		it('should handle missing modules parameter', () => {
			expect(() => registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', undefined)).not.toThrow()

			expect(vi.getTimerCount()).toBe(0)
		})

		it('should handle all missing parameters', () => {
			expect(() => registerSvelteDrawLibraryVersion()).not.toThrow()

			expect(vi.getTimerCount()).toBe(0)
		})

		it('should throw error in build environment when parameters missing', () => {
			const originalBuildFlag = (globalThis as any).SVELTE_DRAW_LIBRARY_IS_BUILD
			;(globalThis as any).SVELTE_DRAW_LIBRARY_IS_BUILD = true

			expect(() => registerSvelteDrawLibraryVersion(undefined, '2.0.0', 'esm')).toThrow(
				'Missing name/version/module system in built version of svelte-draw library'
			)
			;(globalThis as any).SVELTE_DRAW_LIBRARY_IS_BUILD = originalBuildFlag
		})

		it('should schedule timeout check on first registration', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			expect(vi.getTimerCount()).toBe(1)
		})

		it('should not schedule multiple timeouts for multiple registrations', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')

			expect(vi.getTimerCount()).toBe(1)
		})

		it('should handle setTimeout failure gracefully', () => {
			vi.spyOn(global, 'setTimeout').mockImplementation(() => {
				throw new Error('setTimeout not available')
			})

			// Should call check immediately when setTimeout fails
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.9.0', 'esm')

			expect(mockConsoleLog).toHaveBeenCalled()
		})
	})

	describe('version conflict detection', () => {
		it('should detect version conflicts between different versions', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			expect(logMessage).toContain('multiple versions of svelte-draw libraries')
		})

		it('should not warn for identical versions', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).not.toHaveBeenCalled()
		})

		it('should detect module type conflicts', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'cjs')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			expect(logMessage).toContain('multiple instances')
		})

		it('should warn only once per session', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalledTimes(1)

			// Register more conflicting versions
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '1.8.0', 'esm')

			// Should not trigger another warning since didWarn is true
			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
		})

		it('should handle complex version scenarios', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/store', '1.9.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/validate', '2.0.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			expect(logMessage).toContain('multiple versions')
			expect(logMessage).toContain('v2.0.0')
			expect(logMessage).toContain('@svelte-draw/store')
		})

		it('should handle pre-release versions', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0-alpha.1', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0-beta.1', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
		})

		it('should sort versions correctly', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.5.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			// Latest version should be 2.0.0
			expect(logMessage).toContain('v2.0.0')
		})

		it('should handle invalid version formats gracefully', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', 'invalid-version', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', 'also-invalid', 'esm')

			expect(() => vi.runAllTimers()).not.toThrow()
		})

		it('should handle empty version list', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			// Clear versions but let timer run
			clearRegisteredVersionsForTests()

			expect(() => vi.runAllTimers()).not.toThrow()
		})

		it('should format console output with colors', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			// Check for ANSI color codes
			expect(logMessage).toContain('\x1B[')
		})

		it('should show both version mismatches and module duplicates in output', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			expect(logMessage).toContain('latest version')
			expect(logMessage).toContain('not on the latest version')
		})
	})

	describe('integration scenarios', () => {
		it('should handle typical multi-package setup', () => {
			const packages = [
				{ name: '@svelte-draw/editor', version: '2.0.0', modules: 'esm' },
				{ name: '@svelte-draw/svelte-draw', version: '2.0.0', modules: 'esm' },
				{ name: '@svelte-draw/store', version: '2.0.0', modules: 'esm' },
				{ name: '@svelte-draw/validate', version: '2.0.0', modules: 'esm' },
			]

			packages.forEach((pkg) => {
				registerSvelteDrawLibraryVersion(pkg.name, pkg.version, pkg.modules)
			})

			vi.runAllTimers()

			// All same version - should not warn
			expect(mockConsoleLog).not.toHaveBeenCalled()
		})

		it('should ignore duplicate registrations in Next.js dev mode', () => {
			// In Next.js dev mode, Fast Refresh re-executes module-level code which causes
			// the same library to register multiple times, producing a false positive warning.
			vi.stubGlobal('__NEXT_DATA__', {})
			const originalNodeEnv = process.env.NODE_ENV
			process.env.NODE_ENV = 'development'

			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).not.toHaveBeenCalled()

			process.env.NODE_ENV = originalNodeEnv
		})

		it('should detect duplicate registrations outside Next.js dev mode', () => {
			// Outside Next.js dev, duplicate exact registrations should still be
			// tracked and trigger the multiple instances warning
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			expect(logMessage).toContain('multiple instances')
		})

		it('should handle bundler misconfiguration scenario', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'cjs')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			expect(logMessage).toContain('bundler is misconfigured')
			expect(logMessage).toContain('ES Modules')
			expect(logMessage).toContain('CommonJS')
		})

		it('should handle mixed version and module conflicts', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'cjs')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
			const logMessage = mockConsoleLog.mock.calls[0][0]
			// Should show version conflict first (higher priority)
			expect(logMessage).toContain('multiple versions')
		})

		it('should handle gradual package registration', () => {
			// Register packages over time
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).not.toHaveBeenCalled()

			// Clear warning state and add conflicting version
			clearRegisteredVersionsForTests()
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '1.9.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalled()
		})
	})

	describe('edge cases and error handling', () => {
		it('should handle extremely long package names', () => {
			const longName = '@svelte-draw/' + 'x'.repeat(1000)

			expect(() => registerSvelteDrawLibraryVersion(longName, '2.0.0', 'esm')).not.toThrow()
		})

		it('should handle special characters in package names', () => {
			const specialName = '@svelte-draw/test-特殊字符-🎨'

			expect(() => registerSvelteDrawLibraryVersion(specialName, '2.0.0', 'esm')).not.toThrow()
		})

		it('should handle unusual version strings', () => {
			const versions = [
				'2.0.0-alpha.1',
				'2.0.0-beta.1+build.123',
				'2.0.0-rc.1',
				'0.0.0',
				'999.999.999',
			]

			versions.forEach((version) => {
				expect(() => registerSvelteDrawLibraryVersion('@svelte-draw/test', version, 'esm')).not.toThrow()
			})
		})

		it('should handle unusual module system values', () => {
			const moduleSystems = ['esm', 'cjs', 'umd', 'amd', 'custom']

			moduleSystems.forEach((modules) => {
				expect(() => registerSvelteDrawLibraryVersion('@svelte-draw/test', '2.0.0', modules)).not.toThrow()
			})
		})

		it('should handle very large number of registrations', () => {
			for (let i = 0; i < 100; i++) {
				registerSvelteDrawLibraryVersion(`@svelte-draw/package-${i}`, '2.0.0', 'esm')
			}

			expect(() => vi.runAllTimers()).not.toThrow()
		})

		it('should handle global object pollution', () => {
			// This test checks that the system is robust against different global contexts
			// We can't easily pollute the global object due to property descriptors,
			// but we can test that the system works with different global contexts
			expect(() => registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')).not.toThrow()

			// Register a different library to verify state tracking works
			expect(() => registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')).not.toThrow()

			vi.runAllTimers()

			// Should not warn for same versions
			expect(mockConsoleLog).not.toHaveBeenCalled()
		})
	})

	describe('timeout behavior', () => {
		it('should use 100ms delay for setTimeout', () => {
			const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100)
		})

		it('should clear timeout after execution', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			vi.runAllTimers()

			// The timeout should be nulled after execution
			// This is internal behavior but we can test by checking that scheduling works again
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')

			expect(vi.getTimerCount()).toBe(1)
		})

		it('should not schedule new timeout if one is already pending', () => {
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/svelte-draw', '2.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/store', '2.0.0', 'esm')

			expect(vi.getTimerCount()).toBe(1)
		})

		it('should handle timeout clearing correctly', () => {
			const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '2.0.0', 'esm')

			clearRegisteredVersionsForTests()

			expect(clearTimeoutSpy).toHaveBeenCalled()
		})
	})

	describe('original test cases (updated)', () => {
		it('doesnt log anything if all versions are the same', () => {
			registerSvelteDrawLibraryVersion('svelte-draw', '1.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/utils', '1.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/tlschema', '1.0.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalledTimes(0)
		})

		it('logs if not all versions match', () => {
			registerSvelteDrawLibraryVersion('svelte-draw', '1.0.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.1.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/utils', '1.1.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/utils', '1.2.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/tlschema', '1.2.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			expect(mockConsoleLog.mock.calls[0]).toMatchInlineSnapshot(`
				[
				  "[1;41;97m[svelte-draw][m [31;1mYou have multiple versions of svelte-draw libraries installed. This can lead to bugs and unexpected behavior.[m

				The latest version you have installed is [1;94mv1.2.0[m. The following libraries are on the latest version:
				  • ✅ [1m@svelte-draw/tlschema[m

				The following libraries are not on the latest version, or have multiple versions installed:
				  • ❌ [1msvelte-draw[m ([31mv1.0.0[m)
				  • ❌ [1m@svelte-draw/editor[m ([31mv1.1.0[m)
				  • ❌ [1m@svelte-draw/utils[m ([31mv1.1.0[m, [32mv1.2.0[m)",
				]
			`)
		})

		it('logs if multiple versions of the same library are installed', () => {
			registerSvelteDrawLibraryVersion('svelte-draw', '1.1.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.1.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/editor', '1.1.0', 'cjs')
			registerSvelteDrawLibraryVersion('@svelte-draw/utils', '1.1.0', 'esm')
			registerSvelteDrawLibraryVersion('@svelte-draw/utils', '1.1.0', 'cjs')
			registerSvelteDrawLibraryVersion('@svelte-draw/tlschema', '1.1.0', 'esm')

			vi.runAllTimers()

			expect(mockConsoleLog).toHaveBeenCalledTimes(1)
			expect(mockConsoleLog.mock.calls[0]).toMatchInlineSnapshot(`
				[
				  "[1;41;97m[svelte-draw][m [31;1mYou have multiple instances of some svelte-draw libraries active. This can lead to bugs and unexpected behavior. [m

				This usually means that your bundler is misconfigured, and is importing the same library multiple times - usually once as an ES Module, and once as a CommonJS module.

				The following libraries have been imported multiple times:
				  • ❌ [1m@svelte-draw/editor[m v1.1.0: 
				      1. ES Modules
				      2. CommonJS
				  • ❌ [1m@svelte-draw/utils[m v1.1.0: 
				      1. ES Modules
				      2. CommonJS

				You should configure your bundler to only import one version of each library.",
				]
			`)
		})
	})
})
