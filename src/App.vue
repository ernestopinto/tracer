<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <!-- Top bar -->
    <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/70 backdrop-blur print:hidden">
      <div class="px-6 py-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Tracer
          </h1>
          <p class="text-slate-600">
            A tiny function tracer for ℝ — variables, zoom, and live updates.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-slate-500 rounded-md border border-slate-200 bg-white px-2 py-1">
            @ernestopinto/tracer
          </span>

          <a
              href="#"
              class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2
                   text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Docs (soon)
          </a>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="px-6 py-8 print:p-0 print:m-0">
      <div 
        class="grid grid-cols-1 transition-all duration-300 ease-in-out print:block"
        :class="isSidebarOpen ? 'xl:grid-cols-[420px_1fr] gap-6' : 'xl:grid-cols-[0px_1fr] gap-0'"
      >
        <!-- Left panel -->
        <aside 
          class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:hidden transition-all duration-300 ease-in-out"
          :class="isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none w-0 h-0 border-none'"
        >
          <div class="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Playground</h2>
              <p class="text-sm text-slate-600 mt-1">
                Try expressions with <span class="font-mono">A</span>, <span class="font-mono">B</span>, <span class="font-mono">C</span> and more.
              </p>
            </div>
            <button 
              @click="isSidebarOpen = false"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Collapse playground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div class="text-xs font-semibold text-slate-500 mb-2">Functions</div>

              <div class="grid gap-2">
                <button
                    v-for="item in functions"
                    :key="item.name"
                    class="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2
                         hover:bg-slate-50 active:scale-[0.99] transition"
                    @click="setExpr(item.f, item.name)"
                >
                  <div class="font-mono text-sm text-slate-900">{{ item.f }}</div>
                  <div class="text-xs text-slate-500">{{ item.name }}</div>
                </button>
              </div>
            </div>

            <!-- Loaded Functions (JSON) -->
            <div v-if="functions && functions.length > 0" class="mt-4 print:hidden">
              <div class="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Loaded Functions</div>
              <pre class="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto text-[10px] leading-tight text-slate-700 max-h-64"><code>{{ JSON.stringify(functions, null, 2) }}</code></pre>
            </div>

            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="text-xs font-semibold text-slate-500 mb-2">Install</div>
              <pre class="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-auto"><code>npm i @ernestopinto/tracer

import Tracer from "@ernestopinto/tracer"</code></pre>
            </div>

            <div class="text-xs text-slate-500">
              Demo UI is not published to npm (only <span class="font-mono">dist/</span>).
            </div>
          </div>
        </aside>

        <!-- Right panel: actual component -->
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none min-w-0">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between print:hidden">
            <div class="flex items-center gap-3">
              <button 
                v-if="!isSidebarOpen"
                @click="isSidebarOpen = true"
                class="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 flex items-center gap-2 group"
                title="Expand playground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span class="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Show Playground</span>
              </button>
              <div class="text-sm font-semibold text-slate-900">Live Tracer</div>
            </div>
            <div class="text-xs text-slate-500">Scroll inside graph to zoom</div>
          </div>

          <div class="p-4 print:p-0">
            <Tracer ref="tracerRef" v-model:evals="functions" :demo-mode="true" />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
  import Tracer from "./lib/Tracer.vue";
  import type { EvalData } from "./lib/types";

const STORAGE_KEY = "tracer_evals";

const defaultFunctions: EvalData[] = [
  {
    "name":"Function 1",
    "f":"A*sin(B*x - C)"
  },
  {
    "name":"Function 2",
    "f":"x^2 + A*x + C"
  },
  {
    "name":"Function 3",
    "f":"A*cos(x) + B*sin(2*x) - C"
  },
  {
    "name":"Function 4",
    "f":"A/x"
  }
];

const savedFunctions = localStorage.getItem(STORAGE_KEY);
const functions = ref<EvalData[]>(
    savedFunctions ? JSON.parse(savedFunctions) : defaultFunctions
);

const isSidebarOpen = ref(true);

watch(functions, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

// We'll expose a tiny method from Tracer in a second (optional),
// so these buttons can set the expression.
const tracerRef = ref<any>(null);

function setExpr(expr: string, name?: string) {
  tracerRef.value?.setExpr?.(expr, name);
}
</script>
