declare module '*.glb' {
  const src: string;
  export default src;
}

declare namespace JSX {
  interface IntrinsicElements {
    primitive: any;
    group: any;
  }
}
