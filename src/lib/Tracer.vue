<template>
  <section class="w-full p-0">
    <header class="mb-4 print:hidden">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Tracer</h2>
          <p class="text-sm text-gray-600">
            Type a function of <span class="font-mono text-gray-800">x</span> (example:
            <span class="font-mono text-gray-800">x^2 + A - C</span>)
          </p>
        </div>

        <div class="flex gap-2">
          <button
              type="button"
              class="shrink-0 rounded-lg px-3 py-2 border border-gray-300 bg-white
                 text-sm text-gray-800 hover:bg-gray-50 transition print:hidden"
              @click="resetView"
              title="Reset view"
          >
            Reset view
          </button>
          <button
              type="button"
              class="shrink-0 rounded-lg px-3 py-2 border border-gray-300 bg-white
                 text-sm text-gray-800 hover:bg-gray-50 transition print:hidden flex items-center gap-1.5"
              @click="printPlot"
              title="Print plot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print
          </button>
          <button
              type="button"
              class="shrink-0 rounded-lg px-3 py-2 border border-gray-300 bg-white
                 text-sm text-gray-800 hover:bg-gray-50 transition print:hidden flex items-center gap-1.5"
              @click="exportAsPng"
              title="Export as PNG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-col gap-6 print:gap-2">
      <div class="hidden print:block mb-2">
        <h1 class="text-2xl font-bold text-gray-900">{{ activeFunctionName || 'Plot' }}</h1>
        <div class="text-lg font-mono text-blue-600 mt-1">
          f(x) = {{ substitutedExpression }}
        </div>
        <div v-if="zeros.length > 0" class="mt-4 border-t border-gray-100 pt-2">
          <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Zeros</div>
          <div class="text-lg font-mono text-blue-700 break-all">
            {{ zerosFormatted }}
          </div>
        </div>
        <div v-if="extrema.length > 0" class="mt-4 border-t border-gray-100 pt-2">
          <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max / Min</div>
          <div class="text-lg font-mono text-emerald-700 break-all">
            {{ extremaFormatted }}
          </div>
        </div>
        <div v-if="integralResult !== null" class="mt-4 border-t border-gray-100 pt-2">
          <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Integral</div>
          <div class="text-lg font-mono text-orange-700">
            Integral [{{ integralX1 }}, {{ integralX2 }}] ~= {{ integralResult }}
          </div>
        </div>
      </div>

      <!-- Functions -->
      <div v-if="props.evals && props.evals.length > 0" class="flex flex-wrap gap-2 print:hidden">
        <button
            v-for="item in props.evals"
            :key="item.name"
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium border transition-colors"
            :class="activeFunctionName === item.name
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
            @click="setExpr(item.f, item.name)"
        >
          {{ item.name }}
        </button>
      </div>

      <!-- Expression input -->
      <div class="border border-gray-200 rounded-xl bg-white overflow-hidden print:hidden">
        <button
            @click="isExpressionOpen = !isExpressionOpen"
            class="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <span class="text-sm font-semibold text-gray-700">Expression Input</span>
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-transform duration-200"
              :class="{ 'rotate-180': isExpressionOpen }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div v-show="isExpressionOpen" class="p-4 space-y-2">
          <div class="flex flex-col sm:flex-row gap-2">
            <div class="flex-1 space-y-1">
              <div class="text-xs text-gray-600 ml-1">Name</div>
              <input
                  v-model="activeFunctionName"
                  class="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900
                       outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Function name"
                  autocomplete="off"
                  spellcheck="false"
              />
            </div>
            <div class="flex-[2] space-y-1">
              <div class="text-xs text-gray-600 ml-1">f(x)</div>
              <div class="flex gap-2">
                <input
                    v-model="expr"
                    class="flex-1 rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-900
                         outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="x^2 + A - C"
                    autocomplete="off"
                    spellcheck="false"
                />
                <button
                    type="button"
                    class="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white
                         hover:bg-blue-700 active:scale-[0.98] transition shadow-sm disabled:opacity-50"
                    @click="saveFunction"
                    :disabled="!expr.trim()"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
          >
            <div v-if="successMessage" class="text-xs font-medium text-green-600 ml-1">
              {{ successMessage }}
            </div>
          </transition>
        </div>
      </div>

      <!-- Variables -->
      <div class="border border-gray-200 rounded-xl bg-white overflow-hidden print:hidden">
        <button
            @click="isVariablesOpen = !isVariablesOpen"
            class="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
        >
          <span class="text-sm font-semibold text-gray-700">Axis Bounds & Variables</span>
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-transform duration-200"
              :class="{ 'rotate-180': isVariablesOpen }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div v-show="isVariablesOpen" class="p-4 space-y-4">

          <!-- Axis Bounds -->
          <div class="rounded-xl border border-gray-200 bg-slate-50 p-4">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              Axis Bounds
            </div>
            <div class="flex flex-wrap gap-x-8 gap-y-4">
              <div class="space-y-2">
                <div class="text-[10px] font-semibold text-gray-400 px-1 uppercase">X Axis</div>
                <div class="flex flex-wrap gap-2">
                  <label class="block">
                    <span class="text-[9px] text-gray-500 uppercase px-1">Min</span>
                    <input
                        v-model.number="bounds.x[0]"
                        type="number"
                        step="any"
                        class="w-24 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        @input="renderPlot"
                    />
                  </label>
                  <label class="block">
                    <span class="text-[9px] text-gray-500 uppercase px-1">Max</span>
                    <input
                        v-model.number="bounds.x[1]"
                        type="number"
                        step="any"
                        class="w-24 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        @input="renderPlot"
                    />
                  </label>
                </div>
              </div>
              <div class="space-y-2">
                <div class="text-[10px] font-semibold text-gray-400 px-1 uppercase">Y Axis</div>
                <div class="flex flex-wrap gap-2">
                  <label class="block">
                    <span class="text-[9px] text-gray-500 uppercase px-1">Min</span>
                    <input
                        v-model.number="bounds.y[0]"
                        type="number"
                        step="any"
                        class="w-24 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        @input="renderPlot"
                    />
                  </label>
                  <label class="block">
                    <span class="text-[9px] text-gray-500 uppercase px-1">Max</span>
                    <input
                        v-model.number="bounds.y[1]"
                        type="number"
                        step="any"
                        class="w-24 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        @input="renderPlot"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div
                v-for="(state, key) in vars"
                :key="key"
                class="rounded-xl border border-gray-200 bg-white p-3 relative group"
            >
              <button
                  @click="removeVariable(key as string)"
                  class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove variable"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div class="flex items-center gap-2 mb-2 px-2">
                <div class="font-semibold text-gray-900">{{ key }} ({{ state.value.toFixed(1) }})</div>
              </div>

              <div class="grid grid-cols-2 gap-2 mb-3 px-1">
                <label class="block">
                  <span class="text-[10px] text-gray-500 uppercase px-1">Min</span>
                  <input
                    v-model.number="state.min"
                    type="number"
                    class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 outline-none"
                    @input="onVarBoundsChange(key as string)"
                  />
                </label>
                <label class="block">
                  <span class="text-[10px] text-gray-500 uppercase px-1">Max</span>
                  <input
                    v-model.number="state.max"
                    type="number"
                    class="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 outline-none"
                    @input="onVarBoundsChange(key as string)"
                  />
                </label>
              </div>

              <input
                  class="w-full"
                  type="range"
                  :min="state.min"
                  :max="state.max"
                  :step="0.1"
                  v-model.number="state.value"
                  @input="onVarValueInput(key)"
              />
            </div>

            <!-- Add new variable -->
            <div v-if="nextVarKey" class="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-3">
              <div class="flex items-center justify-between mb-2 px-2">
                <div class="font-semibold text-gray-500">New ({{ nextVarKey }})</div>
              </div>

              <div class="grid grid-cols-2 gap-2 mb-2">
                <label class="block">
                  <span class="text-[10px] text-gray-500 uppercase px-1">Min</span>
                  <input v-model.number="newVarMin" type="number" class="w-full rounded border border-gray-200 px-2 py-1 text-xs" />
                </label>
                <label class="block">
                  <span class="text-[10px] text-gray-500 uppercase px-1">Max</span>
                  <input v-model.number="newVarMax" type="number" class="w-full rounded border border-gray-200 px-2 py-1 text-xs" />
                </label>
              </div>

              <button
                  @click="addVariable"
                  class="w-full rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition"
              >
                Add Variable {{ nextVarKey }}
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>

    <!-- Plot -->
    <div class="space-y-1 print:hidden">
      <div class="pt-3 text-[10px] text-gray-500 ml-1 uppercase font-semibold tracking-wider">Function</div>
      <input
          :value="'f(x) = ' + substitutedExpression"
          readonly
          class="w-full rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-md font-mono font-bold text-gray-900
                 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 cursor-text"
          title="Current substituted expression (copy-pasteable)"
          @click="($event.target as HTMLInputElement).select()"
      />
    </div>

    <div class="mt-4 rounded-xl border border-gray-200 bg-white p-2 print:border-none print:p-0 print:mt-0 print:translate-y-[-10%] flex justify-center">
      <div ref="plotEl" class="w-full select-none h-[462px] print:h-[880px] flex justify-center items-center"></div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-red-600">
      {{ error }}
    </p>

    <!-- Calculus -->
    <div class="mt-6 border border-gray-200 rounded-xl bg-white overflow-hidden print:hidden">
      <button
          @click="isCalculusOpen = !isCalculusOpen"
          class="w-full flex items-center justify-between px-4 py-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-gray-700">Calculus</span>
          <button
              v-if="highlightedPoint"
              @click.stop="clearHighlightedPoint"
              type="button"
              class="px-2 py-0.5 text-[10px] bg-red-50 text-red-600 border border-red-100 rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
              title="Clear highlighted point"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Clear Point
          </button>
        </div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform duration-200"
            :class="{ 'rotate-180': isCalculusOpen }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div v-show="isCalculusOpen" class="p-4 space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Find Zeros</h3>
            <button
                @click="findZeros"
                :disabled="isCalculatingZeros"
                class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white
                       hover:bg-blue-700 active:scale-[0.98] transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg v-if="isCalculatingZeros" class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isCalculatingZeros ? 'Calculating...' : 'Find Zeros' }}
            </button>
          </div>

          <div v-if="zeros.length > 0" class="space-y-3">
            <p class="text-[10px] text-gray-500 font-medium">Roots found in current X bounds [{{ bounds.x[0] }}, {{ bounds.x[1] }}]:</p>
            
            <!-- Copyable text element -->
            <div class="space-y-1">
              <input
                  :value="zerosFormatted"
                  readonly
                  class="w-full rounded-lg bg-blue-50/50 border border-blue-100 px-3 py-1.5 text-xs font-mono font-medium text-blue-700
                         outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 cursor-text"
                  title="Copyable zeros"
                  @click="($event.target as HTMLInputElement).select()"
              />
              <p class="text-[9px] text-gray-400 ml-1">Click to select all for easy copying</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <div
                  v-for="(z, idx) in zeros"
                  :key="idx"
                  @click="highlightPoint(z, 0, '#2563eb', `zero-${z}`)"
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-medium transition-colors bg-blue-50 text-blue-700 border border-blue-100 cursor-pointer hover:bg-blue-100 active:scale-95"
                  :class="{ 'ring-2 ring-blue-400 font-bold': highlightedPoint?.id === `zero-${z}` }"
              >
                <span class="font-bold uppercase text-[8px]">zero</span>
                <span>({{ z }}, 0)</span>
              </div>
            </div>
          </div>
          <div v-else-if="!isCalculatingZeros && zeros.length === 0" class="text-xs text-gray-400 italic">
            No zeros found or calculated yet.
          </div>
        </div>

        <div class="h-px bg-gray-100 my-4"></div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Find Max/Min</h3>
            <button
                @click="findExtrema"
                :disabled="isCalculatingExtrema"
                class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white
                       hover:bg-blue-700 active:scale-[0.98] transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg v-if="isCalculatingExtrema" class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isCalculatingExtrema ? 'Calculating...' : 'Find Max/Min' }}
            </button>
          </div>

          <div v-if="extrema.length > 0" class="space-y-3">
            <p class="text-[10px] text-gray-500 font-medium">Extrema found in current X bounds [{{ bounds.x[0] }}, {{ bounds.x[1] }}]:</p>

            <div class="space-y-1">
              <input
                  :value="extremaFormatted"
                  readonly
                  class="w-full rounded-lg bg-blue-50/50 border border-blue-100 px-3 py-1.5 text-xs font-mono font-medium text-blue-700
                         outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 cursor-text"
                  title="Copyable extrema"
                  @click="($event.target as HTMLInputElement).select()"
              />
              <p class="text-[9px] text-gray-400 ml-1">Click to select all for easy copying</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <div
                  v-for="(point, idx) in extrema"
                  :key="idx"
                  @click="highlightPoint(point.x, point.y, point.type === 'max' ? '#16a34a' : '#ea580c', `extrema-${point.x}-${point.type}`)"
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-medium transition-colors cursor-pointer active:scale-95"
                  :class="[
                    point.type === 'max' ? 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100',
                    highlightedPoint?.id === `extrema-${point.x}-${point.type}` ? (point.type === 'max' ? 'ring-2 ring-green-400 font-bold' : 'ring-2 ring-orange-400 font-bold') : ''
                  ]"
              >
                <p>
                  <span class="font-bold uppercase text-[8px]">{{ point.type }}</span>
                  <span>({{ point.x }}, {{ point.y }})</span>
                </p>
              </div>
            </div>
          </div>
          <div v-else-if="!isCalculatingExtrema && extrema.length === 0" class="text-xs text-gray-400 italic">
            No maxima or minima found or calculated yet.
          </div>
        </div>

        <div class="h-px bg-gray-100 my-4"></div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Approx Integral (Area)</h3>
            <button
                @click="findIntegral"
                :disabled="isCalculatingIntegral"
                class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white
                       hover:bg-blue-700 active:scale-[0.98] transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg v-if="isCalculatingIntegral" class="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isCalculatingIntegral ? 'Calculating...' : 'Approx Integral' }}
            </button>
          </div>

          <div class="flex flex-wrap gap-3 items-end">
            <label class="block">
              <span class="text-[10px] text-gray-500 uppercase px-1">X1</span>
              <input
                  v-model.number="integralX1"
                  type="number"
                  step="any"
                  class="w-28 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </label>
            <label class="block">
              <span class="text-[10px] text-gray-500 uppercase px-1">X2</span>
              <input
                  v-model.number="integralX2"
                  type="number"
                  step="any"
                  class="w-28 rounded border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </label>
          </div>

          <div v-if="integralResult !== null" class="space-y-1">
            <div class="text-[10px] text-gray-500 font-medium">
              Approximate integral between [{{ integralX1 }}, {{ integralX2 }}]:
            </div>
            <div class="text-sm font-mono font-semibold text-blue-700">
              {{ integralResult }}
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from "vue";
import functionPlot from "function-plot";
import type { EvalData } from "./types";

const props = withDefaults(defineProps<{
  evals?: EvalData[];
  demoMode?: boolean;
}>(), {
  evals: () => [
    {
      "name": "Function 1",
      "f": "A*Sin(B*x)"
    }
  ],
  demoMode: false
});

const emit = defineEmits<{
  (e: 'update:evals', value: EvalData[]): void;
}>();

type Bounds = { x: [number, number]; y: [number, number] };
type VarKey = string;
type VarState = { min: number; max: number; value: number };

const DEFAULT_BOUNDS: Bounds = { x: [-2, 5], y: [-5, 5] };

const STORAGE_KEY_EXPR = "tracer_expr";
const STORAGE_KEY_VARS = "tracer_vars";
const STORAGE_KEY_ACTIVE = "tracer_active_func";
const STORAGE_KEY_BOUNDS = "tracer_bounds";

// default
const savedExpr = localStorage.getItem(STORAGE_KEY_EXPR);
const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
const savedBounds = localStorage.getItem(STORAGE_KEY_BOUNDS);

const expr = ref(savedExpr || "A*sin(B*x - C)");
const activeFunctionName = ref(savedActive);
const lastActiveFunctionName = ref(savedActive);

const substitutedExpression = computed(() => substituteVars(expr.value));

const isExpressionOpen = ref(true);
const isVariablesOpen = ref(true);
const isCalculusOpen = ref(false);
const zeros = ref<number[]>([]);
const isCalculatingZeros = ref(false);
const extrema = ref<{ x: number, y: number, type: 'max' | 'min' }[]>([]);
const isCalculatingExtrema = ref(false);
const highlightedPoint = ref<{ x: number, y: number, color: string, id?: string } | null>(null);
const isPrinting = ref(false);
const integralX1 = ref<number | null>(null);
const integralX2 = ref<number | null>(null);
const integralResult = ref<number | null>(null);
const isCalculatingIntegral = ref(false);
const integralLines = ref<{ x1: number; x2: number } | null>(null);

const zerosFormatted = computed(() => {
  return zeros.value.map(z => `x = ${z}`).join(', ');
});

const extremaFormatted = computed(() => {
  return extrema.value.map(e => `${e.type === 'max' ? 'max' : 'min'} (${e.x}, ${e.y})`).join(', ');
});

const successMessage = ref<string | null>(null);
const error = ref<string | null>(null);
const plotEl = ref<HTMLDivElement | null>(null);

// If nothing in storage, default to first eval if available
onMounted(() => {
  if (!savedExpr && !savedActive && props.evals && props.evals.length > 0) {
    const first = props.evals[0];
    if (first) {
      expr.value = first.f;
      activeFunctionName.value = first.name;
      lastActiveFunctionName.value = first.name;
      
      // Persist immediately as requested "update storage"
      localStorage.setItem(STORAGE_KEY_EXPR, first.f);
      localStorage.setItem(STORAGE_KEY_ACTIVE, first.name);
    }
    
    renderPlot();
  } else {
    renderPlot();
  }
  window.addEventListener("resize", scheduleRender);

  if (integralX1.value === null || integralX2.value === null) {
    integralX1.value = bounds.value.x[0];
    integralX2.value = bounds.value.x[1];
  }
});

const savedVars = localStorage.getItem(STORAGE_KEY_VARS);
const vars = ref<Record<string, VarState>>(savedVars ? JSON.parse(savedVars) : {
  A: { min: -1, max: 6, value: 1 },
  B: { min: -1, max: 6, value: 1 },
  C: { min: -1, max: 6, value: 1 },
});

const newVarMin = ref(-1);
const newVarMax = ref(6);

const nextVarKey = computed(() => {
  const keys = Object.keys(vars.value).sort();
  const lastKey = keys[keys.length - 1];
  if (!lastKey) return "A";
  const charCode = lastKey.charCodeAt(0);
  if (charCode >= 90) return null; // Z is 90
  return String.fromCharCode(charCode + 1);
});

function addVariable() {
  const key = nextVarKey.value;
  if (!key) return;

  vars.value[key] = {
    min: newVarMin.value,
    max: newVarMax.value,
    value: (newVarMin.value + newVarMax.value) / 2,
  };
  renderPlot();
}

function removeVariable(key: string) {
  delete vars.value[key];
  renderPlot();
}

// Initialize bounds from storage or default
const initialBounds: Bounds = savedBounds 
  ? JSON.parse(savedBounds) 
  : { x: [...DEFAULT_BOUNDS.x], y: [...DEFAULT_BOUNDS.y] };

// ✅ we own bounds so zoom persists across redraws
const bounds = ref<Bounds>(initialBounds);

// Watch bounds and persist to localStorage
watch(bounds, (newBounds) => {
  localStorage.setItem(STORAGE_KEY_BOUNDS, JSON.stringify(newBounds));
}, { deep: true });

let debounceTimer: number | null = null;

watch(() => expr.value, () => {
  if (isPrinting.value) return;
  zeros.value = [];
  extrema.value = [];
  highlightedPoint.value = null;
  integralResult.value = null;
  integralLines.value = null;
});

watch(() => vars.value, () => {
  if (isPrinting.value) return;
  zeros.value = [];
  extrema.value = [];
  highlightedPoint.value = null;
  integralResult.value = null;
  integralLines.value = null;
}, { deep: true });

watch(() => bounds.value, () => {
  if (isPrinting.value) return;
  zeros.value = [];
  extrema.value = [];
  highlightedPoint.value = null;
  integralResult.value = null;
  integralLines.value = null;
}, { deep: true });

// wheel directly to function-plot's overlay rect.
let wheelTarget: SVGRectElement | null = null;

function clamp(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function normalizeVar(key: VarKey) {
  const v = vars.value[key];
  if (!v) return;

  if (v.min > v.max) {
    const tmp = v.min;
    v.min = v.max;
    v.max = tmp;
  }

  v.value = clamp(v.value, v.min, v.max);
}

function substituteVars(expression: string) {
  let res = expression;
  // Sort keys by length descending to avoid partial replacements (though A-Z are single chars)
  const keys = Object.keys(vars.value).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const v = vars.value[key];
    if (!v) continue;
    const val = v.value;
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    res = res.replace(regex, `(${val})`);
  }
  return res;
}

function zoomBounds(factor: number) {
  const [x0, x1] = bounds.value.x;
  const [y0, y1] = bounds.value.y;

  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const nx = (x1 - x0) * factor;
  const ny = (y1 - y0) * factor;

  const minSpan = 1e-6;

  bounds.value = {
    x: [
      Number((cx - Math.max(nx, minSpan) / 2).toFixed(2)),
      Number((cx + Math.max(nx, minSpan) / 2).toFixed(2))
    ],
    y: [
      Number((cy - Math.max(ny, minSpan) / 2).toFixed(2)),
      Number((cy + Math.max(ny, minSpan) / 2).toFixed(2))
    ],
  };
}

// IMPORTANT: use a stable handler ref for add/remove
let isDragging = false;
let startMousePos = { x: 0, y: 0 };
let lastMousePos = { x: 0, y: 0 };
let hasMoved = false;

function onMouseDown(e: MouseEvent) {
  // Prevent function-plot from seeing this as a click/drag start
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();

  isDragging = true;
  hasMoved = false;
  startMousePos = { x: e.clientX, y: e.clientY };
  lastMousePos = { x: e.clientX, y: e.clientY };
  // Set cursor to grabbing
  if (wheelTarget) wheelTarget.style.cursor = 'grabbing';
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || !plotEl.value) return;

  // Prevent default behavior (like text selection or other drags)
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation?.();

  const dx = e.clientX - lastMousePos.x;
  const dy = e.clientY - lastMousePos.y;
  
  // Threshold to distinguish click from drag
  if (Math.abs(e.clientX - startMousePos.x) > 3 || Math.abs(e.clientY - startMousePos.y) > 3) {
    hasMoved = true;
  }

  lastMousePos = { x: e.clientX, y: e.clientY };

  const width = plotEl.value.clientWidth || 800;
  const height = plotEl.value.clientHeight || 462;

  const [x0, x1] = bounds.value.x;
  const [y0, y1] = bounds.value.y;

  const rangeX = x1 - x0;
  const rangeY = y1 - y0;

  // Convert pixel delta to coordinate delta
  // Note: dy is inverted because screen Y goes down, plot Y goes up
  const deltaX = (dx / width) * rangeX;
  const deltaY = (dy / height) * rangeY;

  bounds.value = {
    x: [Number((x0 - deltaX).toFixed(2)), Number((x1 - deltaX).toFixed(2))],
    y: [Number((y0 + deltaY).toFixed(2)), Number((y1 + deltaY).toFixed(2))],
  };

  renderPlot();
}

function onMouseUp(e: MouseEvent) {
  if (isDragging) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    
    // If it was a click (not much movement), highlight the point
    if (!hasMoved && plotEl.value && wheelTarget) {
      const rect = wheelTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      const [x0, x1] = bounds.value.x;
      const [y0, y1] = bounds.value.y;
      
      const rangeX = x1 - x0;
      const rangeY = y1 - y0;
      
      const x = x0 + (mouseX / width) * rangeX;
      const y = y1 - (mouseY / height) * rangeY;
      
      highlightPoint(Number(x.toFixed(4)), Number(y.toFixed(4)), '#2563eb');
    }
  }
  isDragging = false;
  if (wheelTarget) wheelTarget.style.cursor = 'crosshair';
}

function onWheel(e: WheelEvent) {
  // Stop function-plot/d3 from swallowing the wheel
  e.preventDefault();
  e.stopPropagation();
  // stopImmediatePropagation exists on Event in browsers
  e.stopImmediatePropagation?.();

  // Normalize delta for trackpads
  const delta = Math.max(-120, Math.min(120, e.deltaY));
  const factor = delta < 0 ? 0.92 : 1.08;

  zoomBounds(factor);
  renderPlot();
}

function detachWheel() {
  if (wheelTarget) {
    wheelTarget.removeEventListener("wheel", onWheel as any, true);
    wheelTarget.removeEventListener("mousedown", onMouseDown as any, true);
    window.removeEventListener("mousemove", onMouseMove as any, true);
    window.removeEventListener("mouseup", onMouseUp as any, true);
    wheelTarget = null;
  }
}

async function attachWheelToPlotOverlay() {
  // Wait for DOM to be updated (SVG inserted)
  await nextTick();

  if (!plotEl.value) return;

  // function-plot uses this overlay to capture zoom/drag
  const rect = plotEl.value.querySelector("rect.zoom-and-drag") as SVGRectElement | null;
  if (!rect) return;

  // Remove any previous attachment
  detachWheel();

  wheelTarget = rect;
  wheelTarget.style.cursor = 'crosshair';

  // Capture phase so we intercept before any internal handlers
  rect.addEventListener("wheel", onWheel as any, { capture: true, passive: false } as any);
  
  // Drag handling
  rect.addEventListener("mousedown", onMouseDown as any, { capture: true });
  window.addEventListener("mousemove", onMouseMove as any, { capture: true });
  window.addEventListener("mouseup", onMouseUp as any, { capture: true });
}

function renderPlot() {
  if (!plotEl.value) return;

  error.value = null;

  // Clean old wheel handler before clearing DOM
  detachWheel();
  plotEl.value.innerHTML = "";

  const fn = substituteVars(expr.value);
  
  // Determine height based on whether we are likely in a print context or just measuring
  // However, clientHeight will give us the CSS height.
  const targetHeight = plotEl.value.clientHeight || 462;
  
  const data: any[] = [
    { fn, sampler: "builtIn", graphType: "polyline" }
  ];

  if (highlightedPoint.value) {
    data.push({
      points: [[highlightedPoint.value.x, highlightedPoint.value.y]],
      fnType: 'points',
      graphType: 'scatter',
      color: highlightedPoint.value.color,
      attr: {
        r: 5
      }
    });
  }
  
  if (integralLines.value) {
    const [yMin, yMax] = bounds.value.y;
    const lineColor = '#f97316';
    data.push({
      points: [[integralLines.value.x1, yMin], [integralLines.value.x1, yMax]],
      fnType: 'points',
      graphType: 'polyline',
      color: lineColor
    });
    data.push({
      points: [[integralLines.value.x2, yMin], [integralLines.value.x2, yMax]],
      fnType: 'points',
      graphType: 'polyline',
      color: lineColor
    });
  }
  
  try {
    functionPlot({
      target: plotEl.value,
      width: plotEl.value.clientWidth || 800,
      height: targetHeight,
      grid: true,
  
      // We zoom ourselves (bounds), so don't use built-in zoom
      disableZoom: true,
  
      xAxis: { domain: bounds.value.x },
      yAxis: { domain: bounds.value.y },
  
      data
    });

    // Re-attach wheel to the new overlay rect created by functionPlot
    attachWheelToPlotOverlay();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Could not render the expression.";
  }
}

function scheduleRender() {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => renderPlot(), 200);
}

function resetView() {
  bounds.value = {
    x: [Number(DEFAULT_BOUNDS.x[0].toFixed(2)), Number(DEFAULT_BOUNDS.x[1].toFixed(2))],
    y: [Number(DEFAULT_BOUNDS.y[0].toFixed(2)), Number(DEFAULT_BOUNDS.y[1].toFixed(2))]
  };
  highlightedPoint.value = null;
  renderPlot();
}

function highlightPoint(x: number, y: number, color: string, id?: string) {
  highlightedPoint.value = { x, y, color, id };
  renderPlot();
}

function clearHighlightedPoint() {
  highlightedPoint.value = null;
  renderPlot();
}

function findZeros() {
  isCalculatingZeros.value = true;
  zeros.value = [];
  
  const fnStr = substituteVars(expr.value);
  const [xMin, xMax] = bounds.value.x;
  
  try {
    // We use a simplified version of what function-plot uses internally to evaluate
    // or we can use a basic numerical approach.
    // Since we don't have mathjs, we'll use a simple sampling + bisection.
    
    // 1. Sample the function to find intervals where the sign changes
    const samples = 1000;
    const step = (xMax - xMin) / samples;
    const foundZeros: number[] = [];
    
    // Helper to evaluate the expression
    const evaluate = (x: number): number => {
      try {
        // Simple substitution of x and eval
        // Note: this is a bit risky but we are in a controlled environment
        // We replace 'x' with the value, but we need to be careful with word boundaries
        const substituted = fnStr.replace(/\bx\b/g, `(${x})`);
        // We need to handle common math functions for eval
        // function-plot uses a built-in evaluator that supports sin, cos, etc.
        // For now let's use a very basic approach or try to use a more robust one if possible.
        // actually function-plot's built-in evaluator is not exposed easily.
        
        // We'll wrap common math functions to be available in the eval context
        const context = {
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan,
          asin: Math.asin,
          acos: Math.acos,
          atan: Math.atan,
          abs: Math.abs,
          sqrt: Math.sqrt,
          log: Math.log,
          exp: Math.exp,
          pow: Math.pow,
          pi: Math.PI,
          e: Math.E,
          PI: Math.PI,
          E: Math.E
        };
        
        // Create a function from the expression
        // We replace ^ with ** for JS power operator
        let jsExpr = substituted.replace(/\^/g, '**');
        
        // Use a Function constructor with the context
        const evalFn = new Function(...Object.keys(context), `return ${jsExpr}`);
        return evalFn(...Object.values(context));
      } catch (e) {
        return NaN;
      }
    };

    let prevX = xMin;
    let prevY = evaluate(prevX);
    
    for (let i = 1; i <= samples; i++) {
      const currX = xMin + i * step;
      const currY = evaluate(currX);
      
      if (currY === 0) {
        foundZeros.push(Number(currX.toFixed(4)));
      } else if (!isNaN(prevY) && !isNaN(currY) && prevY * currY < 0) {
        // Sign change, use bisection to find the zero
        let a = prevX;
        let b = currX;
        for (let j = 0; j < 20; j++) { // 20 iterations for good precision
          const mid = (a + b) / 2;
          const midY = evaluate(mid);
          if (midY === 0) {
            a = mid;
            break;
          }
          if (evaluate(a) * midY < 0) {
            b = mid;
          } else {
            a = mid;
          }
        }
        foundZeros.push(Number(((a + b) / 2).toFixed(4)));
      }
      
      prevX = currX;
      prevY = currY;
    }
    
    // De-duplicate zeros that might be too close
    const uniqueZeros: number[] = [];
    if (foundZeros.length > 0) {
      const first = foundZeros[0];
      if (first !== undefined) {
        uniqueZeros.push(first);
        for (let i = 1; i < foundZeros.length; i++) {
          const curr = foundZeros[i];
          const prev = foundZeros[i - 1];
          if (curr !== undefined && prev !== undefined) {
            if (Math.abs(curr - prev) > 1e-4) {
              uniqueZeros.push(curr);
            }
          }
        }
      }
    }
    
    zeros.value = uniqueZeros;
  } catch (e) {
    console.error("Error finding zeros:", e);
    error.value = "Error calculating zeros. Check your expression syntax.";
  } finally {
    isCalculatingZeros.value = false;
  }
}

async function findExtrema() {
  if (isCalculatingExtrema.value) return;
  isCalculatingExtrema.value = true;
  extrema.value = [];
  error.value = null;

  try {
    const substituted = substitutedExpression.value;
    const xMin = bounds.value.x[0];
    const xMax = bounds.value.x[1];
    const samples = 1000;
    const step = (xMax - xMin) / samples;
    const h = 1e-7; // Small step for numerical derivative

    const evaluate = (x: number) => {
      try {
        const context = {
          sin: Math.sin, cos: Math.cos, tan: Math.tan,
          asin: Math.asin, acos: Math.acos, atan: Math.atan,
          abs: Math.abs, sqrt: Math.sqrt, log: Math.log,
          exp: Math.exp, pow: Math.pow, pi: Math.PI,
          e: Math.E, PI: Math.PI, E: Math.E, x
        };
        let jsExpr = substituted.replace(/\^/g, '**');
        const evalFn = new Function(...Object.keys(context), `return ${jsExpr}`);
        return evalFn(...Object.values(context));
      } catch (e) { return NaN; }
    };

    const deriv = (x: number) => {
      const f1 = evaluate(x + h);
      const f2 = evaluate(x - h);
      if (isNaN(f1) || isNaN(f2)) return NaN;
      return (f1 - f2) / (2 * h);
    };

    const deriv2 = (x: number) => {
      const f1 = evaluate(x + h);
      const f = evaluate(x);
      const f2 = evaluate(x - h);
      if (isNaN(f1) || isNaN(f) || isNaN(f2)) return NaN;
      return (f1 - 2 * f + f2) / (h * h);
    };

    const foundExtrema: { x: number, y: number, type: 'max' | 'min' }[] = [];
    let prevX = xMin;
    let prevD = deriv(prevX);

    for (let i = 1; i <= samples; i++) {
      const currX = xMin + i * step;
      const currD = deriv(currX);

      if (currD === 0) {
        const d2 = deriv2(currX);
        if (!isNaN(d2) && Math.abs(d2) > 1e-9) {
          foundExtrema.push({
            x: Number(currX.toFixed(4)),
            y: Number(evaluate(currX).toFixed(4)),
            type: d2 < 0 ? 'max' : 'min'
          });
        }
      } else if (!isNaN(prevD) && !isNaN(currD) && prevD * currD < 0) {
        // Sign change in derivative, use bisection to find where derivative is 0
        let a = prevX;
        let b = currX;
        for (let j = 0; j < 20; j++) {
          const mid = (a + b) / 2;
          const midD = deriv(mid);
          if (midD === 0) {
            a = mid;
            break;
          }
          if (deriv(a) * midD < 0) b = mid;
          else a = mid;
        }
        const rootX = (a + b) / 2;
        const d2 = deriv2(rootX);
        if (!isNaN(d2) && Math.abs(d2) > 1e-9) {
          foundExtrema.push({
            x: Number(rootX.toFixed(4)),
            y: Number(evaluate(rootX).toFixed(4)),
            type: d2 < 0 ? 'max' : 'min'
          });
        }
      }
      prevX = currX;
      prevD = currD;
    }

    // De-duplicate
    const uniqueExtrema: typeof foundExtrema = [];
    if (foundExtrema.length > 0) {
      const first = foundExtrema[0];
      if (first) {
        uniqueExtrema.push(first);
        for (let i = 1; i < foundExtrema.length; i++) {
          const curr = foundExtrema[i];
          const prev = foundExtrema[i - 1];
          if (curr && prev) {
            if (Math.abs(curr.x - prev.x) > 1e-4) {
              uniqueExtrema.push(curr);
            }
          }
        }
      }
    }
    extrema.value = uniqueExtrema;
  } catch (e) {
    console.error("Error finding extrema:", e);
    error.value = "Error calculating maxima/minima.";
  } finally {
    isCalculatingExtrema.value = false;
  }
}

async function findIntegral() {
  if (isCalculatingIntegral.value) return;
  isCalculatingIntegral.value = true;
  integralResult.value = null;
  error.value = null;

  const x1 = integralX1.value;
  const x2 = integralX2.value;
  if (x1 === null || x2 === null) {
    isCalculatingIntegral.value = false;
    return;
  }

  const a = Math.min(x1, x2);
  const b = Math.max(x1, x2);

  try {
    const substituted = substitutedExpression.value;
    const samples = 2000;
    const step = (b - a) / samples;

    const evaluate = (x: number) => {
      try {
        const context = {
          sin: Math.sin, cos: Math.cos, tan: Math.tan,
          asin: Math.asin, acos: Math.acos, atan: Math.atan,
          abs: Math.abs, sqrt: Math.sqrt, log: Math.log,
          exp: Math.exp, pow: Math.pow, pi: Math.PI,
          e: Math.E, PI: Math.PI, E: Math.E, x
        };
        let jsExpr = substituted.replace(/\^/g, '**');
        const evalFn = new Function(...Object.keys(context), `return ${jsExpr}`);
        return evalFn(...Object.values(context));
      } catch (e) { return NaN; }
    };

    let area = 0;
    let prevY = evaluate(a);
    for (let i = 1; i <= samples; i++) {
      const x = a + i * step;
      const y = evaluate(x);
      if (!isNaN(prevY) && !isNaN(y)) {
        area += (prevY + y) * 0.5 * step;
      }
      prevY = y;
    }

    const signedArea = x1 <= x2 ? area : -area;
    integralResult.value = Number(signedArea.toFixed(6));
    integralLines.value = { x1, x2 };
    renderPlot();
  } catch (e) {
    console.error("Error finding integral:", e);
    error.value = "Error calculating integral.";
  } finally {
    isCalculatingIntegral.value = false;
  }
}

async function printPlot() {
  isPrinting.value = true;
  
  // Wait for isPrinting to propagate to watchers
  await nextTick();

  // Briefly zoom out and shift Y-axis for print
  const originalBounds = {
    x: [...bounds.value.x] as [number, number],
    y: [...bounds.value.y] as [number, number]
  };
  
  // 1. Zoom out factor 1.2
  const [x0, x1] = bounds.value.x;
  const [y0, y1] = bounds.value.y;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const nx = (x1 - x0) * 1.2;
  const ny = (y1 - y0) * 1.2;

  // 2. Shift domain to the right to push Y-axis (x=0) to the left
  // We'll shift it by about 20% of the new width
  const shift = nx * 0.2;

  bounds.value = {
    x: [(cx - nx / 2) + shift, (cx + nx / 2) + shift],
    y: [cy - ny / 2, cy + ny / 2],
  };

  // Force rendering for print
  renderPlot();
  
  // Also ensure the UI reflects any changes needed for print
  await nextTick();

  // Wait for the taller height and zoom to be applied in DOM
  await nextTick();
  // Small delay to ensure function-plot finishes its async internal render if any
  await new Promise(resolve => setTimeout(resolve, 100));

  window.print();

  // Wait for print dialog to close
  await nextTick();

  // Restore
  bounds.value = originalBounds;
  renderPlot();
  
  // Wait for bounds restoration to be processed by watchers
  await nextTick();
  isPrinting.value = false;
}

async function exportAsPng() {
  if (!plotEl.value) return;

  const activeHighlight = highlightedPoint.value;

  const svg = plotEl.value.querySelector("svg");
  if (!svg) return;

  // 1. Prepare SVG for canvas (needs dimensions and proper serialization)
  const width = svg.clientWidth || svg.viewBox.baseVal.width || 800;
  const height = svg.clientHeight || svg.viewBox.baseVal.height || 462;

  // Clone SVG to avoid modifying the displayed one if we need to add styles
  const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
  clonedSvg.setAttribute("width", width.toString());
  clonedSvg.setAttribute("height", height.toString());

  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  // 2. Load into Image and draw to Canvas
  const img = new Image();
  img.crossOrigin = "anonymous";
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  const headerHeight = 60; // Space for function name + expression text
  
  // Dynamic footer height
  let footerExtraHeight = 0;
  if (activeHighlight) footerExtraHeight += 45; // Matching the increment in drawing logic
  if (zeros.value.length > 0) footerExtraHeight += 40;
  if (extrema.value.length > 0) footerExtraHeight += 40;
  if (integralResult.value !== null) footerExtraHeight += 40;
  
  const footerHeight = footerExtraHeight > 0 ? footerExtraHeight + 20 : 0;
  
  canvas.width = width;
  canvas.height = height + headerHeight + footerHeight;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Fill white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the function name + expression text
    ctx.fillStyle = "#111827"; // text-gray-900
    ctx.font = "bold 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    const title = activeFunctionName.value?.trim() || "Plot";
    ctx.fillText(title, 10, 22);
    ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    ctx.fillText(`f(x) = ${substitutedExpression.value}`, 10, 46);

    // Draw the plot below the text
    ctx.drawImage(img, 0, headerHeight);

    let currentFooterY = headerHeight + height + 25;

    if (activeHighlight) {
      ctx.fillStyle = "#374151"; // text-gray-700
      ctx.font = "bold 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
      const id = activeHighlight.id;
      let pointType = "point";
      if (id) {
        if (id.startsWith("zero-")) pointType = "zero";
        else if (id.startsWith("extrema-")) pointType = id.endsWith("-max") ? "max" : "min";
      }
      ctx.fillText(`${pointType} (${activeHighlight.x}, ${activeHighlight.y})`, 10, currentFooterY);
      currentFooterY += 45; // Increased padding after highlighted point
    }

    if (zeros.value.length > 0) {
      ctx.fillStyle = "#1d4ed8"; // blue-700
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("ZEROS", 10, currentFooterY - 15);
      ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
      ctx.fillText(zerosFormatted.value, 10, currentFooterY);
      currentFooterY += 40;
    }

    if (extrema.value.length > 0) {
      ctx.fillStyle = "#047857"; // emerald-700
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("MAX / MIN", 10, currentFooterY - 15);
      ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
      ctx.fillText(extremaFormatted.value, 10, currentFooterY);
      currentFooterY += 40;
    }

    if (integralResult.value !== null) {
      ctx.fillStyle = "#c2410c"; // orange-700
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("INTEGRAL", 10, currentFooterY - 15);
      ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
      ctx.fillText(`Integral [${integralX1.value}, ${integralX2.value}] ~= ${integralResult.value}`, 10, currentFooterY);
    }

    // 3. Trigger download
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const fileName = activeFunctionName.value 
      ? `plot-${activeFunctionName.value.toLowerCase().replace(/\s+/g, '-')}.png` 
      : 'plot.png';
    
    link.download = fileName;
    link.href = pngUrl;
    link.click();
  }

  // Cleanup
  URL.revokeObjectURL(url);
}

function onVarValueInput(key: VarKey) {
  normalizeVar(key);
  renderPlot(); // live update while sliding
}

function onVarBoundsChange(key: VarKey) {
  normalizeVar(key);
  scheduleRender(); // debounced
}

onBeforeUnmount(() => {
  window.removeEventListener("resize", scheduleRender);
  if (debounceTimer) window.clearTimeout(debounceTimer);
  detachWheel();
});

function setExpr(next: string, name?: string | null) {
  expr.value = next;
  if (name) {
    activeFunctionName.value = name;
    lastActiveFunctionName.value = name;
  } else {
    // If it's just a string from outside, try to find if it matches an existing one
    const found = props.evals?.find(e => e.f === next);
    const foundName = found ? found.name : null;
    activeFunctionName.value = foundName;
    lastActiveFunctionName.value = foundName;
  }
  renderPlot();
}

function showSuccess(msg: string) {
  successMessage.value = msg;
  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
}

function saveFunction() {
  if (!expr.value.trim()) return;
  const newEvals = [...(props.evals || [])];
  
  if (newEvals.length === 0) return;

  const currentName = activeFunctionName.value?.trim() || null;
  const currentExpr = expr.value.trim();

  // Use lastActiveFunctionName to find what we are editing
  const originalName = lastActiveFunctionName.value;
  const index = originalName 
    ? newEvals.findIndex(i => i.name === originalName)
    : -1;

  if (index !== -1) {
    // Updating/Renaming existing
    const item = newEvals[index];
    if (item) {
      const oldName = item.name;
      const newName = currentName || oldName;
      
      newEvals[index] = {
        ...item,
        name: newName,
        f: currentExpr
      };
      
      activeFunctionName.value = newName;
      lastActiveFunctionName.value = newName;
      
      // Explicitly update localStorage for immediate persistence of current session state
      localStorage.setItem(STORAGE_KEY_ACTIVE, newName);
      localStorage.setItem(STORAGE_KEY_EXPR, currentExpr);
      
      showSuccess(`Updated ${newName}`);
    }
  } else {
    // Fallback: try to find by current name if no lastActive was set
    const existingIdx = currentName ? newEvals.findIndex(i => i.name === currentName) : -1;
    
    if (existingIdx !== -1 && currentName) {
      const item = newEvals[existingIdx];
      if (item) {
        newEvals[existingIdx] = {
          ...item,
          f: currentExpr
        };
        
        activeFunctionName.value = currentName;
        lastActiveFunctionName.value = currentName;
        
        localStorage.setItem(STORAGE_KEY_ACTIVE, currentName);
        localStorage.setItem(STORAGE_KEY_EXPR, currentExpr);
        
        showSuccess(`Updated ${currentName}`);
      }
    }
  }
  emit('update:evals', newEvals);
}

defineExpose({ setExpr });


// typing changes: debounced
watch(expr, (newVal) => {
  localStorage.setItem(STORAGE_KEY_EXPR, newVal);
  scheduleRender();
});

watch(activeFunctionName, (newVal) => {
  if (newVal) {
    localStorage.setItem(STORAGE_KEY_ACTIVE, newVal);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
  }
});
watch(vars, (newVal) => {
  localStorage.setItem(STORAGE_KEY_VARS, JSON.stringify(newVal));
  scheduleRender();
}, { deep: true });
</script>
