export type TracerFunctionDef = {
    /** Display name */
    name: string;
    /** Math expression string for function-plot, e.g. "A*sin(B*x - C)" */
    f: string;
};

export type TracerDisplayConfig = {
    axxis?: boolean; // keeping your spelling to match existing data
    vars?: boolean;
    calc?: boolean;
    expr?: boolean;
};

export type TracerDefs = {
    /** Functions to plot */
    f: TracerFunctionDef[];
    /** Display options */
    d?: TracerDisplayConfig;
};
