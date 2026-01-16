<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <!-- Top bar -->
    <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/70 backdrop-blur">
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
    <main class="px-6 py-8">
      <div class="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
        <!-- Left panel -->
        <aside class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100">
            <h2 class="text-lg font-semibold text-slate-900">Playground</h2>
            <p class="text-sm text-slate-600 mt-1">
              Try expressions with <span class="font-mono">A</span>, <span class="font-mono">B</span>, <span class="font-mono">C</span>.
              Scroll to zoom.
            </p>
          </div>

          <div class="p-5 space-y-4">
            <div class="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div class="text-xs font-semibold text-slate-500 mb-2">Examples</div>

              <div class="grid gap-2">
                <button
                    class="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2
                         hover:bg-slate-50 active:scale-[0.99] transition"
                    @click="setExpr('A*sin(B*x - C)')"
                >
                  <div class="font-mono text-sm text-slate-900">A*sin(B*x - C)</div>
                  <div class="text-xs text-slate-500">Sine wave with amplitude/phase</div>
                </button>

                <button
                    class="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2
                         hover:bg-slate-50 active:scale-[0.99] transition"
                    @click="setExpr('x^2 + A*x + C')"
                >
                  <div class="font-mono text-sm text-slate-900">x^2 + A*x + C</div>
                  <div class="text-xs text-slate-500">Parabola with slope/offset</div>
                </button>

                <button
                    class="w-full text-left rounded-lg border border-slate-200 bg-white px-3 py-2
                         hover:bg-slate-50 active:scale-[0.99] transition"
                    @click="setExpr('A*cos(x) + B*sin(2*x) - C')"
                >
                  <div class="font-mono text-sm text-slate-900">A*cos(x) + B*sin(2*x) - C</div>
                  <div class="text-xs text-slate-500">Mixed harmonics</div>
                </button>
              </div>
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
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div class="text-sm font-semibold text-slate-900">Live Tracer</div>
            <div class="text-xs text-slate-500">Scroll inside graph to zoom</div>
          </div>

          <div class="p-4">
            <Tracer ref="tracerRef" />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
  import Tracer from "./lib/Tracer.vue";

// We'll expose a tiny method from Tracer in a second (optional),
// so these buttons can set the expression.
const tracerRef = ref<any>(null);

function setExpr(expr: string) {
  tracerRef.value?.setExpr?.(expr);
}
</script>
